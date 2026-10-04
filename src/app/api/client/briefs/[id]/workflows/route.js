import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            aiAnalysisQuota: true,
            aiAnalysisUsed: true,
          },
        },
        workflowSources: {
          orderBy: { createdAt: "desc" },
        },
        workflows: {
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
            },
            source: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const quota = {
      quota: brief.organization?.aiAnalysisQuota || 50,
      used: brief.organization?.aiAnalysisUsed || 0,
      remaining: Math.max(
        0,
        (brief.organization?.aiAnalysisQuota || 50) -
          (brief.organization?.aiAnalysisUsed || 0)
      ),
    };

    return NextResponse.json({
      brief,
      workflows: brief.workflows,
      sources: brief.workflowSources,
      quota,
    });
  } catch (error) {
    console.error("[Workflows GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({ where: { id } });
    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, steps } = body;

    const newWorkflow = await db.workflow.create({
      data: {
        organizationId: brief.organizationId,
        briefId: id,
        name: name || "New Custom Workflow",
        description: description || "",
        status: "MAPPED",
        steps: {
          create: (steps || []).map((s, idx) => ({
            stepNumber: idx + 1,
            name: s.name || `Step ${idx + 1}`,
            description: s.description || "",
            tool: s.tool || "",
            actor: s.actor || "HUMAN",
            durationMinutes: s.durationMinutes || 15,
            automatabilityPct: s.automatabilityPct || 50,
            hoursSavedWeekly: s.hoursSavedWeekly || 1,
            riskLevel: s.riskLevel || "LOW",
            agentFit: s.agentFit || "HUMAN_IN_THE_LOOP",
          })),
        },
      },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
      },
    });

    return NextResponse.json({ success: true, workflow: newWorkflow });
  } catch (error) {
    console.error("[Workflows POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
