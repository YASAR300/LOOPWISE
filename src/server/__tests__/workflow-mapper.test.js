import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  WorkflowStepSchema,
  WorkflowExtractionSchema,
  MultiWorkflowSchema,
  checkAndConsumeOrgQuota,
  extractTextFromFile,
  analyzeWorkflowWithAI,
  generateOpportunityMarkdown,
} from "../services/workflow-mapper";
import { db } from "@/lib/db";
import * as aiLib from "@/lib/ai";
import * as auditLib from "@/lib/audit";

vi.mock("@/lib/db", () => ({
  db: {
    organization: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/ai", () => ({
  generateAnthropicJSON: vi.fn(),
}));

describe("Workflow Mapper Service & Schemas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Schema Validation", () => {
    it("validates a complete WorkflowStep", () => {
      const validStep = {
        stepNumber: 1,
        name: "Receive inbound invoice",
        description: "Parse attachment from finance inbox",
        tool: "Gmail",
        actor: "AGENT",
        input: "Raw email message",
        output: "Extracted PDF attachment",
        durationMinutes: 5,
        decisionPoints: "Check sender SPF/DKIM verification",
        failureModes: "Unsupported file extension or corrupt file",
        automatabilityPct: 95,
        hoursSavedWeekly: 4.5,
        riskLevel: "LOW",
        agentFit: "RULE_BASED",
      };

      const result = WorkflowStepSchema.safeParse(validStep);
      expect(result.success).toBe(true);
      expect(result.data.stepNumber).toBe(1);
      expect(result.data.actor).toBe("AGENT");
    });

    it("applies defaults to optional WorkflowStep fields", () => {
      const minimalStep = {
        stepNumber: 2,
        name: "Manual verification",
      };

      const result = WorkflowStepSchema.safeParse(minimalStep);
      expect(result.success).toBe(true);
      expect(result.data.actor).toBe("HUMAN");
      expect(result.data.durationMinutes).toBe(15);
      expect(result.data.automatabilityPct).toBe(50);
      expect(result.data.riskLevel).toBe("LOW");
      expect(result.data.agentFit).toBe("HUMAN_IN_THE_LOOP");
    });

    it("rejects invalid step automatability out of 0-100 bounds", () => {
      const invalidStep = {
        stepNumber: 1,
        name: "Bad bounds",
        automatabilityPct: 150,
      };

      const result = WorkflowStepSchema.safeParse(invalidStep);
      expect(result.success).toBe(false);
    });

    it("validates a full WorkflowExtraction structure", () => {
      const workflow = {
        name: "Accounts Payable Invoice Processing",
        description: "Automated end-to-end receipt, validation, and SAP entry",
        automatabilityScore: 85,
        businessImpactHours: 18,
        impactAssumptions:
          "Based on 250 monthly vendor invoices and 2 finance clerks",
        riskScore: 25,
        riskSummary: "Requires double-key verification on invoices > $10,000",
        agentFit: "LLM_AGENT",
        steps: [
          {
            stepNumber: 1,
            name: "Extract invoice data",
            tool: "DocuParse",
            actor: "AGENT",
            automatabilityPct: 90,
            hoursSavedWeekly: 6,
            riskLevel: "LOW",
            agentFit: "LLM_AGENT",
          },
        ],
        suggestedSkills: ["Python", "Claude API", "SAP Connector"],
        suggestedWeeklyHours: 20,
        suggestedGoals: ["Zero human touch on standard invoices under $5,000"],
      };

      const result = WorkflowExtractionSchema.safeParse(workflow);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe("Accounts Payable Invoice Processing");
      expect(result.data.steps).toHaveLength(1);
    });

    it("validates MultiWorkflowSchema with overall summary", () => {
      const payload = {
        workflows: [
          {
            name: "Customer Support L1 Triage",
            automatabilityScore: 90,
            businessImpactHours: 25,
            impactAssumptions: "500 Zendesk tickets/week",
            riskScore: 15,
            riskSummary: "Guardrails on refund limits",
            agentFit: "LLM_AGENT",
            steps: [
              {
                stepNumber: 1,
                name: "Classify incoming ticket",
                actor: "AGENT",
                automatabilityPct: 95,
                hoursSavedWeekly: 10,
                riskLevel: "LOW",
                agentFit: "LLM_AGENT",
              },
            ],
            suggestedSkills: ["Zendesk API", "LangGraph"],
            suggestedWeeklyHours: 15,
            suggestedGoals: ["Resolve 40% of tier 1 inquiries autonomously"],
          },
        ],
        overallSummary: {
          totalHoursSavedWeekly: 25,
          averageAutomatability: 90,
          primaryBottlenecks: [
            "Manual Zendesk tagging",
            "Delayed customer responses",
          ],
          recommendedAgentArchitecture: "Supervised Autonomous Multi-Agent",
          suggestedSkills: ["Zendesk API", "LangGraph", "Claude 3.5 Sonnet"],
          suggestedWeeklyHours: 15,
          suggestedGoals: ["Fast-track SLA resolution to under 5 minutes"],
        },
      };

      const result = MultiWorkflowSchema.safeParse(payload);
      expect(result.success).toBe(true);
      expect(result.data.overallSummary.totalHoursSavedWeekly).toBe(25);
    });
  });

  describe("checkAndConsumeOrgQuota", () => {
    it("throws when organization does not exist", async () => {
      db.organization.findUnique.mockResolvedValue(null);

      await expect(checkAndConsumeOrgQuota("non-existent-id")).rejects.toThrow(
        "Organization not found"
      );
    });

    it("throws when monthly AI quota is reached", async () => {
      db.organization.findUnique.mockResolvedValue({
        id: "org-1",
        aiAnalysisQuota: 50,
        aiAnalysisUsed: 50,
        aiQuotaResetAt: new Date(Date.now() + 86400000), // future
      });

      await expect(checkAndConsumeOrgQuota("org-1")).rejects.toThrow(
        /Monthly AI analysis quota exceeded/
      );
    });

    it("resets usage when quota reset date has passed", async () => {
      const pastDate = new Date(Date.now() - 86400000);
      db.organization.findUnique.mockResolvedValue({
        id: "org-1",
        aiAnalysisQuota: 50,
        aiAnalysisUsed: 50,
        aiQuotaResetAt: pastDate,
      });

      db.organization.update.mockResolvedValue({});

      const status = await checkAndConsumeOrgQuota("org-1");

      expect(db.organization.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "org-1" },
          data: expect.objectContaining({ aiAnalysisUsed: 0 }),
        })
      );
      expect(status.used).toBe(1);
      expect(status.remaining).toBe(49);
    });

    it("consumes quota and increments usage for valid request", async () => {
      db.organization.findUnique.mockResolvedValue({
        id: "org-1",
        aiAnalysisQuota: 50,
        aiAnalysisUsed: 10,
        aiQuotaResetAt: new Date(Date.now() + 86400000),
      });

      db.organization.update.mockResolvedValue({});

      const status = await checkAndConsumeOrgQuota("org-1");

      expect(db.organization.update).toHaveBeenCalledWith({
        where: { id: "org-1" },
        data: { aiAnalysisUsed: { increment: 1 } },
      });
      expect(status.used).toBe(11);
      expect(status.remaining).toBe(39);
    });
  });

  describe("extractTextFromFile", () => {
    it("extracts text from plain text buffer", async () => {
      const text =
        "1. Receive customer email\n2. Tag in CRM\n3. Reply with template";
      const buffer = Buffer.from(text, "utf-8");

      const result = await extractTextFromFile({
        buffer,
        fileName: "sop.txt",
        mimeType: "text/plain",
      });

      expect(result).toBe(text);
    });

    it("extracts text from markdown buffer", async () => {
      const md = "# Support SOP\n- Step 1: Open ticket\n- Step 2: Check plan";
      const buffer = Buffer.from(md, "utf-8");

      const result = await extractTextFromFile({
        buffer,
        fileName: "guide.md",
        mimeType: "text/markdown",
      });

      expect(result).toBe(md);
    });

    it("throws on unsupported file extension", async () => {
      const buffer = Buffer.from("data", "utf-8");

      await expect(
        extractTextFromFile({
          buffer,
          fileName: "spreadsheet.xlsx",
          mimeType: "application/vnd.ms-excel",
        })
      ).rejects.toThrow(/Unsupported file type/);
    });
  });

  describe("analyzeWorkflowWithAI", () => {
    const originalApiKey = process.env.ANTHROPIC_API_KEY;

    beforeEach(() => {
      process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
    });

    it("throws explicit error when ANTHROPIC_API_KEY is not configured", async () => {
      delete process.env.ANTHROPIC_API_KEY;

      await expect(
        analyzeWorkflowWithAI({
          rawContent: "SOP text",
          organizationId: "org-1",
        })
      ).rejects.toThrow("ANTHROPIC_API_KEY is not configured");

      process.env.ANTHROPIC_API_KEY = originalApiKey;
    });

    it("calls generateAnthropicJSON, consumes quota and writes audit log", async () => {
      db.organization.findUnique.mockResolvedValue({
        id: "org-1",
        aiAnalysisQuota: 50,
        aiAnalysisUsed: 2,
        aiQuotaResetAt: new Date(Date.now() + 86400000),
      });
      db.organization.update.mockResolvedValue({});

      const mockAnalysis = {
        workflows: [
          {
            name: "Lead Qualification",
            automatabilityScore: 80,
            businessImpactHours: 12,
            impactAssumptions: "100 incoming leads/week",
            riskScore: 20,
            riskSummary: "CRM validation",
            agentFit: "LLM_AGENT",
            steps: [
              {
                stepNumber: 1,
                name: "Enrich lead domain",
                tool: "Clearbit",
                actor: "AGENT",
                automatabilityPct: 90,
                hoursSavedWeekly: 5,
                riskLevel: "LOW",
                agentFit: "RULE_BASED",
              },
            ],
            suggestedSkills: ["HubSpot API", "Python"],
            suggestedWeeklyHours: 15,
            suggestedGoals: ["Automate 80% lead qualification"],
          },
        ],
        overallSummary: {
          totalHoursSavedWeekly: 12,
          averageAutomatability: 80,
          primaryBottlenecks: ["Manual enrichment"],
          recommendedAgentArchitecture: "Enrichment Agent",
          suggestedSkills: ["HubSpot API"],
          suggestedWeeklyHours: 15,
          suggestedGoals: ["Faster qualification"],
        },
      };

      aiLib.generateAnthropicJSON.mockResolvedValue({
        data: mockAnalysis,
        usage: { inputTokens: 450, outputTokens: 900, totalTokens: 1350 },
        raw: JSON.stringify(mockAnalysis),
      });

      const result = await analyzeWorkflowWithAI({
        rawContent: "Process description text here",
        organizationId: "org-1",
        briefId: "brief-123",
        userId: "user-456",
      });

      expect(result.analysis.workflows).toHaveLength(1);
      expect(result.usage.totalTokens).toBe(1350);
      expect(auditLib.writeAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-456",
          action: "WORKFLOW_ANALYSIS_EXECUTED",
          entityType: "Workflow",
          entityId: "brief-123",
        })
      );
    });
  });

  describe("generateOpportunityMarkdown", () => {
    it("generates markdown document containing metrics, bottlenecks, and steps", () => {
      const workflows = [
        {
          name: "Invoice Reconciliation",
          description: "Match bank feeds to ERP records",
          automatabilityScore: 92,
          businessImpactHours: 15,
          riskScore: 30,
          agentFit: "LLM_AGENT",
          impactAssumptions: "400 invoices per billing cycle",
          riskSummary: "Require controller approval on discrepancies > $50",
          steps: [
            {
              stepNumber: 1,
              name: "Download bank statements",
              tool: "Plaid",
              actor: "AGENT",
              durationMinutes: 5,
              automatabilityPct: 98,
              riskLevel: "LOW",
              agentFit: "RULE_BASED",
            },
          ],
        },
      ];

      const summary = {
        totalHoursSavedWeekly: 15,
        averageAutomatability: 92,
        recommendedAgentArchitecture: "Bank Feed Synchronizer Agent",
        suggestedWeeklyHours: 20,
        primaryBottlenecks: [
          "Manual statement download",
          "Typo in vendor names",
        ],
        suggestedSkills: ["Plaid API", "NetSuite SuiteScript", "Python"],
      };

      const markdown = generateOpportunityMarkdown({
        workflows,
        summary,
        briefTitle: "Finance Ops Overhaul",
      });

      expect(markdown).toContain(
        "# Loopwise Automation Opportunity Summary: Finance Ops Overhaul"
      );
      expect(markdown).toContain("15 hrs/week");
      expect(markdown).toContain("92%");
      expect(markdown).toContain("Manual statement download");
      expect(markdown).toContain("Plaid API");
      expect(markdown).toContain("Invoice Reconciliation");
      expect(markdown).toContain("Download bank statements");
    });
  });
});
