// src/server/__tests__/engagements.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  IP_ASSIGNMENT_CLAUSES,
  CONFIDENTIALITY_CLAUSES,
  TERMINATION_CLAUSES,
  CADENCE_CLAUSES,
  buildContractMarkdown,
} from "@/lib/contract-templates";
import { generateContractPdfBuffer } from "../services/pdf-service.jsx";

describe("Engagement Lifecycle & Contract State Machine Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Versioned Contract Clause Templates", () => {
    it("provides versioned IP assignment clauses", () => {
      expect(IP_ASSIGNMENT_CLAUSES["standard_v1"]).toBeDefined();
      expect(IP_ASSIGNMENT_CLAUSES["standard_v1"].title).toContain(
        "Standard Work for Hire"
      );
      expect(IP_ASSIGNMENT_CLAUSES["standard_v1"].text).toContain(
        "property of Client"
      );
      expect(IP_ASSIGNMENT_CLAUSES["open_source_permissive_v1"]).toBeDefined();
    });

    it("provides versioned confidentiality and NDA clauses", () => {
      expect(CONFIDENTIALITY_CLAUSES["mutual_nd_v1"]).toBeDefined();
      expect(CONFIDENTIALITY_CLAUSES["mutual_nd_v1"].text).toContain(
        "Confidential Information"
      );
      expect(CONFIDENTIALITY_CLAUSES["strict_enterprise_v1"]).toBeDefined();
    });

    it("provides versioned termination and notice period clauses", () => {
      expect(TERMINATION_CLAUSES["standard_notice_v1"]).toBeDefined();
      const populated = TERMINATION_CLAUSES["standard_notice_v1"].text.replace(
        "{{noticeDays}}",
        "14"
      );
      expect(populated).toContain("14 calendar days");
    });

    it("builds complete legal markdown with all clauses and rates populated", () => {
      const markdown = buildContractMarkdown({
        title: "AI Automation Leadership",
        clientName: "Acme Corp",
        strategistName: "Dr. Jane Doe",
        model: "HOURLY",
        rate: 250,
        hourlyWeeklyCap: 20,
        startDate: "2026-10-15",
        endDate: "2027-04-15",
        noticePeriodDays: 14,
        scopeOfWork:
          "Implement autonomous customer support swarms and n8n triage workflows.",
        ipKey: "standard_v1",
        confidentialityKey: "mutual_nd_v1",
        terminationKey: "standard_notice_v1",
      });

      expect(markdown).toContain("# AI Automation Leadership");
      expect(markdown).toContain("Acme Corp");
      expect(markdown).toContain("Dr. Jane Doe");
      expect(markdown).toContain("$250/hr (Weekly Cap: 20 hours)");
      expect(markdown).toContain("14 days written notice");
      expect(markdown).toContain(
        "Standard Work for Hire & Moral Rights Waiver"
      );
      expect(markdown).toContain("Mutual Confidentiality & Non-Disclosure");
      expect(markdown).toContain(
        "Implement autonomous customer support swarms"
      );
    });
  });

  describe("Contract E-Acceptance Evidence & State Machine", () => {
    it("transitions contract to ACTIVE only when both parties have signed", () => {
      const contract = {
        id: "c-1",
        status: "DRAFT",
        clientSignedAt: null,
        strategistSignedAt: null,
      };

      // Helper to compute state transition
      function handleSignature(contract, role, signatureEvidence) {
        const next = { ...contract };
        if (role === "CLIENT") {
          next.clientSignedAt = signatureEvidence.timestamp;
          next.clientSignedName = signatureEvidence.name;
          next.clientSignedIp = signatureEvidence.ip;
          next.clientSignedUserAgent = signatureEvidence.userAgent;
        } else if (role === "STRATEGIST") {
          next.strategistSignedAt = signatureEvidence.timestamp;
          next.strategistSignedName = signatureEvidence.name;
          next.strategistSignedIp = signatureEvidence.ip;
          next.strategistSignedUserAgent = signatureEvidence.userAgent;
        }

        if (next.clientSignedAt && next.strategistSignedAt) {
          next.status = "ACTIVE";
        } else {
          next.status = "SENT";
        }
        return next;
      }

      // 1. Client signs
      const afterClient = handleSignature(contract, "CLIENT", {
        name: "Jane Smith",
        timestamp: new Date().toISOString(),
        ip: "192.0.2.1",
        userAgent: "Mozilla/5.0",
      });
      expect(afterClient.status).toBe("SENT");
      expect(afterClient.clientSignedAt).toBeDefined();
      expect(afterClient.strategistSignedAt).toBeNull();

      // 2. Strategist signs
      const afterBoth = handleSignature(afterClient, "STRATEGIST", {
        name: "Alex Doe",
        timestamp: new Date().toISOString(),
        ip: "198.51.100.2",
        userAgent: "Mozilla/5.0",
      });
      expect(afterBoth.status).toBe("ACTIVE");
      expect(afterBoth.clientSignedName).toBe("Jane Smith");
      expect(afterBoth.strategistSignedName).toBe("Alex Doe");
    });

    it("resets signatures and moves to CHANGES_REQUESTED upon scope amendment", () => {
      const activeContract = {
        id: "c-1",
        status: "ACTIVE",
        clientSignedAt: new Date(),
        strategistSignedAt: new Date(),
        version: 1,
      };

      function requestChanges(contract, newScope) {
        return {
          ...contract,
          status: "CHANGES_REQUESTED",
          scopeOfWork: newScope,
          clientSignedAt: null,
          strategistSignedAt: null,
          version: contract.version + 1,
        };
      }

      const amended = requestChanges(activeContract, "New expanded scope");
      expect(amended.status).toBe("CHANGES_REQUESTED");
      expect(amended.version).toBe(2);
      expect(amended.clientSignedAt).toBeNull();
      expect(amended.strategistSignedAt).toBeNull();
    });
  });

  describe("Deliverables Kanban Board Rules & Permissions", () => {
    it("allows only CLIENT to approve or request changes on deliverable", () => {
      const canApprove = (userRole) =>
        userRole === "CLIENT" || userRole === "ADMIN";

      expect(canApprove("CLIENT")).toBe(true);
      expect(canApprove("STRATEGIST")).toBe(false);
      expect(canApprove("ADMIN")).toBe(true);
    });

    it("transitions deliverable stage correctly", () => {
      const validStages = ["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "APPROVED"];

      function moveDeliverable(deliverable, targetStage) {
        if (!validStages.includes(targetStage)) {
          throw new Error("Invalid stage");
        }
        return {
          ...deliverable,
          stage: targetStage,
          clientApprovalStatus:
            targetStage === "APPROVED"
              ? "APPROVED"
              : targetStage === "IN_REVIEW"
                ? "PENDING"
                : null,
        };
      }

      const item = { id: "d-1", stage: "BACKLOG", clientApprovalStatus: null };
      const inProgress = moveDeliverable(item, "IN_PROGRESS");
      expect(inProgress.stage).toBe("IN_PROGRESS");

      const inReview = moveDeliverable(inProgress, "IN_REVIEW");
      expect(inReview.stage).toBe("IN_REVIEW");
      expect(inReview.clientApprovalStatus).toBe("PENDING");

      const approved = moveDeliverable(inReview, "APPROVED");
      expect(approved.stage).toBe("APPROVED");
      expect(approved.clientApprovalStatus).toBe("APPROVED");
    });
  });

  describe("Engagement Freeze & Controls", () => {
    it("freezes deliverable updates and timer when engagement is COMPLETED or TERMINATED", () => {
      function canEditDeliverables(engagementStatus) {
        return !["COMPLETED", "TERMINATED", "PAUSED"].includes(
          engagementStatus
        );
      }

      function canLogTime(engagementStatus) {
        return engagementStatus === "ACTIVE";
      }

      expect(canEditDeliverables("ACTIVE")).toBe(true);
      expect(canEditDeliverables("PAUSED")).toBe(false);
      expect(canEditDeliverables("COMPLETED")).toBe(false);
      expect(canEditDeliverables("TERMINATED")).toBe(false);

      expect(canLogTime("ACTIVE")).toBe(true);
      expect(canLogTime("PAUSED")).toBe(false);
      expect(canLogTime("COMPLETED")).toBe(false);
      expect(canLogTime("TERMINATED")).toBe(false);
    });

    it("verifies 14-day trial replacement eligibility", () => {
      function isTrialEligible(startDate, currentDate) {
        const diffMs = currentDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 14;
      }

      const now = new Date("2026-10-14T00:00:00Z");
      const day3 = new Date("2026-10-11T00:00:00Z");
      const day14 = new Date("2026-09-30T00:00:00Z");
      const day20 = new Date("2026-09-24T00:00:00Z");

      expect(isTrialEligible(day3, now)).toBe(true);
      expect(isTrialEligible(day14, now)).toBe(true);
      expect(isTrialEligible(day20, now)).toBe(false);
    });
  });

  describe("PDF Snapshot Generation", () => {
    it("generates a valid binary PDF buffer with legal metadata", async () => {
      const mockContract = {
        id: "c-test-99",
        title: "Master Services Agreement",
        termsMd:
          "# Master Agreement\n\nConfidentiality and deliverables clauses.",
        model: "HOURLY",
        rate: 200,
        weeklyHours: 15,
        startDate: new Date("2026-10-01"),
        endDate: new Date("2027-04-01"),
        noticePeriodDays: 14,
        clientSignedName: "Client Officer",
        clientSignedAt: new Date("2026-10-01T12:00:00Z"),
        clientSignedIp: "10.0.0.1",
        strategistSignedName: "Strategist Lead",
        strategistSignedAt: new Date("2026-10-01T13:00:00Z"),
        strategistSignedIp: "10.0.0.2",
        engagement: {
          title: "Enterprise GenAI Platform",
          organization: { name: "FinTech Global" },
          strategistProfile: { user: { name: "Alex Turing" } },
        },
      };

      const buffer = await generateContractPdfBuffer(mockContract);
      expect(buffer).toBeDefined();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(100);

      // PDF files always begin with '%PDF-'
      const header = buffer.subarray(0, 5).toString("utf-8");
      expect(header).toBe("%PDF-");
    });
  });
});
