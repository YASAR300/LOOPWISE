import { z } from "zod";
import { db } from "@/lib/db";
import { generateAnthropicJSON } from "@/lib/ai";
import { writeAuditLog } from "@/lib/audit";

export const WorkflowStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  name: z.string().min(1),
  description: z.string().optional().default(""),
  tool: z.string().optional().default(""),
  actor: z.string().default("HUMAN"), // HUMAN | AGENT | HYBRID
  input: z.string().optional().default(""),
  output: z.string().optional().default(""),
  durationMinutes: z.number().min(0).default(15),
  decisionPoints: z.string().optional().default(""),
  failureModes: z.string().optional().default(""),
  automatabilityPct: z.number().min(0).max(100).default(50),
  hoursSavedWeekly: z.number().min(0).default(2),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  agentFit: z
    .enum(["RULE_BASED", "LLM_AGENT", "HUMAN_IN_THE_LOOP"])
    .default("HUMAN_IN_THE_LOOP"),
});

export const WorkflowExtractionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  automatabilityScore: z.number().min(0).max(100),
  businessImpactHours: z.number().min(0),
  impactAssumptions: z.string().min(1),
  riskScore: z.number().min(0).max(100),
  riskSummary: z.string().min(1),
  agentFit: z.enum(["RULE_BASED", "LLM_AGENT", "HUMAN_IN_THE_LOOP"]),
  steps: z.array(WorkflowStepSchema).min(1),
  suggestedSkills: z.array(z.string()).default([]),
  suggestedWeeklyHours: z.number().default(20),
  suggestedGoals: z.array(z.string()).default([]),
});

export const MultiWorkflowSchema = z.object({
  workflows: z.array(WorkflowExtractionSchema).min(1),
  overallSummary: z.object({
    totalHoursSavedWeekly: z.number(),
    averageAutomatability: z.number(),
    primaryBottlenecks: z.array(z.string()),
    recommendedAgentArchitecture: z.string(),
    suggestedSkills: z.array(z.string()),
    suggestedWeeklyHours: z.number(),
    suggestedGoals: z.array(z.string()),
  }),
});

/**
 * Check and consume organization AI analysis quota
 */
export async function checkAndConsumeOrgQuota(organizationId) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      aiAnalysisQuota: true,
      aiAnalysisUsed: true,
      aiQuotaResetAt: true,
    },
  });

  if (!org) throw new Error("Organization not found");

  const now = new Date();
  if (org.aiQuotaResetAt && now > org.aiQuotaResetAt) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await db.organization.update({
      where: { id: organizationId },
      data: { aiAnalysisUsed: 0, aiQuotaResetAt: nextMonth },
    });
    org.aiAnalysisUsed = 0;
  }

  if (org.aiAnalysisUsed >= org.aiAnalysisQuota) {
    throw new Error(
      `Monthly AI analysis quota exceeded (${org.aiAnalysisUsed}/${org.aiAnalysisQuota} used). Please upgrade your organization plan or contact support.`
    );
  }

  // Consume 1 quota credit
  await db.organization.update({
    where: { id: organizationId },
    data: { aiAnalysisUsed: { increment: 1 } },
  });

  return {
    quota: org.aiAnalysisQuota,
    used: org.aiAnalysisUsed + 1,
    remaining: org.aiAnalysisQuota - (org.aiAnalysisUsed + 1),
  };
}

/**
 * Extract plain text from uploaded document buffer (.txt, .md, .docx, .pdf)
 */
export async function extractTextFromFile({ buffer, fileName, mimeType }) {
  const ext = (fileName || "").split(".").pop()?.toLowerCase();

  if (ext === "txt" || ext === "md" || mimeType?.includes("text/")) {
    return buffer.toString("utf-8");
  }

  if (ext === "pdf" || mimeType === "application/pdf") {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err) {
      console.error("[PDF Parse Error]:", err);
      throw new Error(`Failed to extract text from PDF: ${err.message}`);
    }
  }

  if (ext === "docx" || mimeType?.includes("wordprocessingml")) {
    try {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err) {
      console.error("[DOCX Parse Error]:", err);
      throw new Error(`Failed to extract text from DOCX: ${err.message}`);
    }
  }

  throw new Error(
    `Unsupported file type: .${ext}. Please upload .txt, .md, .docx, or .pdf files.`
  );
}

/**
 * Analyze SOP or process text with Anthropic Claude and produce scored workflows
 */
export async function analyzeWorkflowWithAI({
  rawContent,
  organizationId,
  briefId = null,
  userId = null,
}) {
  // Check API key configuration explicitly per acceptance criteria
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Please set ANTHROPIC_API_KEY in your environment variables (.env.local) to use the Workflow Mapper."
    );
  }

  // Enforce quota
  const quotaStatus = await checkAndConsumeOrgQuota(organizationId);

  const systemPrompt = `You are a Principal AI Systems Architect and Operations Engineer at Loopwise.
Your task is to analyze standard operating procedures (SOPs), messy process documentation, transcripts, or workflow descriptions and turn them into an exhaustive, structured automation map.

Analyze the input text and extract:
1. One or more distinct Workflows with clear business names.
2. For each workflow, an ordered sequence of discrete WorkflowSteps (stepNumber starting at 1).
3. For each step, determine:
   - name: clear action title
   - description: what is happening
   - tool: software or interface involved (e.g. Salesforce, Zendesk, Gmail, Excel, PostgreSQL, Slack, SAP)
   - actor: "HUMAN", "AGENT", or "HYBRID"
   - input & output data
   - durationMinutes: approximate time spent per execution
   - decisionPoints: conditional logic or human judgment required
   - failureModes: what breaks or requires human exception handling
   - automatabilityPct (0-100): feasibility of automated or agentic execution
   - hoursSavedWeekly: estimated hours saved across a typical operating team
   - riskLevel: "LOW", "MEDIUM", or "HIGH" (evaluating data privacy, financial impact, compliance)
   - agentFit: "RULE_BASED" (deterministic triggers/APIs), "LLM_AGENT" (reasoning, extraction, synthesis), or "HUMAN_IN_THE_LOOP" (gated review)
4. For each workflow:
   - automatabilityScore (0-100 overall)
   - businessImpactHours (total weekly hours saved)
   - impactAssumptions: explicit assumptions made about volume, team size, and cycle times
   - riskScore (0-100)
   - riskSummary: safety and compliance guardrails needed
   - agentFit: "RULE_BASED" | "LLM_AGENT" | "HUMAN_IN_THE_LOOP"
   - suggestedSkills: key engineering technologies (e.g. LangGraph, Claude API, n8n, DSPy, pgvector, Python)
   - suggestedWeeklyHours: recommended fractional strategist hours/week (e.g. 15, 20)
   - suggestedGoals: concise engagement goals
5. Provide overall summary with aggregate metrics.`;

  const userPrompt = `Analyze the following operational process documentation and generate the structured JSON automation map:

---
${rawContent}
---`;

  const {
    data: analysis,
    usage,
    raw,
  } = await generateAnthropicJSON({
    system: systemPrompt,
    user: userPrompt,
    schema: MultiWorkflowSchema,
  });

  // Audit log
  if (userId) {
    await writeAuditLog({
      userId,
      action: "WORKFLOW_ANALYSIS_EXECUTED",
      entityType: "Workflow",
      entityId: briefId || organizationId,
      metadata: {
        tokenUsage: usage,
        workflowCount: analysis.workflows.length,
        totalHoursSavedWeekly: analysis.overallSummary.totalHoursSavedWeekly,
      },
    });
  }

  return {
    analysis,
    usage,
    raw,
    quotaStatus,
  };
}

/**
 * Generate formatted Markdown export of Automation Opportunity Summary
 */
export function generateOpportunityMarkdown({
  workflows,
  summary,
  briefTitle = "Automation Map",
}) {
  let md = `# Loopwise Automation Opportunity Summary: ${briefTitle}\n\n`;
  md += `*Generated by Loopwise Workflow Mapper on ${new Date().toLocaleDateString()}*\n\n`;

  md += `## Executive Summary\n\n`;
  md += `- **Estimated Weekly Hours Saved:** ${summary?.totalHoursSavedWeekly || 0} hrs/week\n`;
  md += `- **Average Automatability Score:** ${summary?.averageAutomatability || 0}%\n`;
  md += `- **Recommended Agent Architecture:** ${summary?.recommendedAgentArchitecture || "Supervised Multi-Agent System"}\n`;
  md += `- **Recommended Fractional Bandwidth:** ${summary?.suggestedWeeklyHours || 20} hrs/week\n\n`;

  if (summary?.primaryBottlenecks?.length) {
    md += `### Primary Operational Bottlenecks\n\n`;
    summary.primaryBottlenecks.forEach((b) => {
      md += `- ${b}\n`;
    });
    md += `\n`;
  }

  if (summary?.suggestedSkills?.length) {
    md += `### Recommended Skill Stack for Fractional AI Head\n\n`;
    md += summary.suggestedSkills.map((s) => `\`${s}\``).join(" • ") + `\n\n`;
  }

  md += `## Mapped Workflows & Opportunities\n\n`;

  workflows.forEach((wf, index) => {
    md += `### ${index + 1}. ${wf.name}\n\n`;
    md += `${wf.description || ""}\n\n`;
    md += `| Metric | Assessment |\n`;
    md += `| --- | --- |\n`;
    md += `| **Automatability** | ${wf.automatabilityScore}% |\n`;
    md += `| **Impact (Weekly Hours Saved)** | ${wf.businessImpactHours} hrs/wk |\n`;
    md += `| **Risk Score** | ${wf.riskScore}/100 |\n`;
    md += `| **Recommended Agent Fit** | ${wf.agentFit.replace(/_/g, " ")} |\n\n`;

    md += `**Impact Assumptions:** ${wf.impactAssumptions}\n\n`;
    md += `**Risk & Compliance Guardrails:** ${wf.riskSummary}\n\n`;

    if (wf.steps?.length) {
      md += `#### Process Steps Breakdown\n\n`;
      md += `| Step | Name | Tool | Actor | Duration | Automatability | Risk | Agent Fit |\n`;
      md += `| --- | --- | --- | --- | --- | --- | --- | --- |\n`;
      wf.steps.forEach((s) => {
        md += `| ${s.stepNumber} | ${s.name} | ${s.tool || "—"} | ${s.actor} | ${s.durationMinutes}m | ${s.automatabilityPct}% | ${s.riskLevel} | ${s.agentFit} |\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  });

  return md;
}
