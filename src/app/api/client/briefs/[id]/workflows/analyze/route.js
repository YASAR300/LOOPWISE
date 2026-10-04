import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  analyzeWorkflowWithAI,
  extractTextFromFile,
} from "@/server/services/workflow-mapper";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({
      where: { id },
      include: { organization: true },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    let rawContent = "";
    let sourceType = "SOP_TEXT";
    let sourceName = "Pasted Process SOP";
    let fileName = null;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const text = formData.get("rawContent") || formData.get("sopText");
      const intakeMode = formData.get("intakeMode"); // "paste" | "upload" | "guided"

      if (file && typeof file === "object" && file.size > 0) {
        sourceType = "FILE_UPLOAD";
        fileName = file.name;
        sourceName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        rawContent = await extractTextFromFile({
          buffer,
          fileName: file.name,
          mimeType: file.type,
        });
      } else if (intakeMode === "guided") {
        sourceType = "GUIDED_FORM";
        sourceName = "Guided Process Form";
        const trigger = formData.get("trigger") || "";
        const operator = formData.get("operator") || "";
        const tools = formData.get("tools") || "";
        const duration = formData.get("duration") || "";
        const runsPerWeek = formData.get("runsPerWeek") || "";
        const failureModes = formData.get("failureModes") || "";

        rawContent = `Process Guided Interview:
- What triggers this process: ${trigger}
- Who performs it / roles: ${operator}
- Software, tools and systems used: ${tools}
- Average duration per execution: ${duration}
- Execution frequency / runs per week: ${runsPerWeek}
- What goes wrong, edge cases, failure points: ${failureModes}`;
      } else if (text) {
        rawContent = String(text);
      }
    } else {
      // JSON body
      const body = await request.json();
      if (body.intakeMode === "guided") {
        sourceType = "GUIDED_FORM";
        sourceName = "Guided Process Form";
        rawContent = `Process Guided Interview:
- What triggers this process: ${body.trigger || ""}
- Who performs it / roles: ${body.operator || ""}
- Software, tools and systems used: ${body.tools || ""}
- Average duration per execution: ${body.duration || ""}
- Execution frequency / runs per week: ${body.runsPerWeek || ""}
- What goes wrong, edge cases, failure points: ${body.failureModes || ""}`;
      } else {
        rawContent = body.rawContent || body.sopText || "";
        sourceName = body.sourceName || "Pasted Process Documentation";
      }
    }

    if (!rawContent || rawContent.trim().length < 15) {
      return NextResponse.json(
        {
          error:
            "Process documentation or SOP text is required (minimum 15 characters).",
        },
        { status: 400 }
      );
    }

    // 1. Save WorkflowSource
    const workflowSource = await db.workflowSource.create({
      data: {
        organizationId: brief.organizationId,
        briefId: id,
        name: sourceName,
        type: sourceType,
        fileName,
        rawContent,
        extractedText: rawContent,
      },
    });

    // 2. Run Anthropic AI Analysis
    const { analysis, usage, quotaStatus } = await analyzeWorkflowWithAI({
      rawContent,
      organizationId: brief.organizationId,
      briefId: id,
      userId: user.id,
    });

    // 3. Persist Workflows and Steps to DB
    const createdWorkflows = [];
    for (const wf of analysis.workflows) {
      const created = await db.workflow.create({
        data: {
          organizationId: brief.organizationId,
          briefId: id,
          sourceId: workflowSource.id,
          name: wf.name,
          description: wf.description || "",
          status: "MAPPED",
          automatabilityScore: wf.automatabilityScore,
          businessImpactHours: wf.businessImpactHours,
          impactAssumptions: wf.impactAssumptions,
          riskScore: wf.riskScore,
          riskSummary: wf.riskSummary,
          agentFit: wf.agentFit,
          tokenUsage: usage,
          opportunitySummary: {
            suggestedSkills: wf.suggestedSkills,
            suggestedWeeklyHours: wf.suggestedWeeklyHours,
            suggestedGoals: wf.suggestedGoals,
          },
          steps: {
            create: wf.steps.map((s, idx) => ({
              stepNumber: s.stepNumber || idx + 1,
              name: s.name,
              description: s.description || "",
              tool: s.tool || "",
              actor: s.actor || "HUMAN",
              input: s.input || "",
              output: s.output || "",
              durationMinutes: s.durationMinutes || 15,
              decisionPoints: s.decisionPoints || "",
              failureModes: s.failureModes || "",
              automatabilityPct: s.automatabilityPct || 50,
              hoursSavedWeekly: s.hoursSavedWeekly || 2,
              riskLevel: s.riskLevel || "LOW",
              agentFit: s.agentFit || "HUMAN_IN_THE_LOOP",
            })),
          },
        },
        include: {
          steps: { orderBy: { stepNumber: "asc" } },
        },
      });
      createdWorkflows.push(created);
    }

    // 4. Update Brief Opportunity Summary
    await db.brief.update({
      where: { id },
      data: {
        opportunitySummary: analysis.overallSummary,
      },
    });

    return NextResponse.json({
      success: true,
      workflows: createdWorkflows,
      summary: analysis.overallSummary,
      quotaStatus,
      sourceId: workflowSource.id,
    });
  } catch (error) {
    console.error("[Workflow Analyze Error]:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to analyze workflow with AI",
        isConfigError: error.message?.includes("ANTHROPIC_API_KEY"),
        isQuotaError: error.message?.includes("quota"),
      },
      { status: 500 }
    );
  }
}
