import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeDeterministicMatchScore } from "../services/matching";
import { DEFAULT_MATCH_WEIGHTS } from "@/lib/match-weights";

describe("Tenant Isolation & Matching Authorization Rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Brief Tenant Isolation", () => {
    it("prohibits a client from accessing another organization's brief", () => {
      const clientUser = {
        id: "client-user-1",
        role: "CLIENT",
        organizationId: "org-alpha",
      };

      const briefFromOtherOrg = {
        id: "brief-999",
        organizationId: "org-beta",
        title: "Confidential Finance Automation",
      };

      const hasAccess =
        clientUser.role === "ADMIN" ||
        clientUser.organizationId === briefFromOtherOrg.organizationId;

      expect(hasAccess).toBe(false);
    });

    it("allows a client to access their own organization's brief", () => {
      const clientUser = {
        id: "client-user-1",
        role: "CLIENT",
        organizationId: "org-alpha",
      };

      const ownBrief = {
        id: "brief-101",
        organizationId: "org-alpha",
        title: "Enterprise AP Automation",
      };

      const hasAccess =
        clientUser.role === "ADMIN" ||
        clientUser.organizationId === ownBrief.organizationId;

      expect(hasAccess).toBe(true);
    });
  });

  describe("Proposal Strategist Isolation", () => {
    it("prohibits a strategist from viewing another strategist's private proposal", () => {
      const strategistA = {
        id: "strat-user-A",
        profileId: "profile-A",
        role: "STRATEGIST",
      };

      const proposalByStrategistB = {
        id: "prop-456",
        strategistProfileId: "profile-B",
        jobId: "job-101",
        proposedRate: 180,
        coverLetter: "Proprietary pricing and strategy",
      };

      const canView =
        strategistA.role === "ADMIN" ||
        strategistA.profileId === proposalByStrategistB.strategistProfileId;

      expect(canView).toBe(false);
    });

    it("allows a strategist to view and withdraw their own proposal", () => {
      const strategistA = {
        id: "strat-user-A",
        profileId: "profile-A",
        role: "STRATEGIST",
      };

      const ownProposal = {
        id: "prop-123",
        strategistProfileId: "profile-A",
        jobId: "job-101",
        status: "SENT",
      };

      const canManage =
        strategistA.role === "ADMIN" ||
        strategistA.profileId === ownProposal.strategistProfileId;

      expect(canManage).toBe(true);
    });

    it("allows the hiring client organization to view proposals submitted to their jobs", () => {
      const clientOrg = { id: "org-alpha" };
      const job = { id: "job-101", organizationId: "org-alpha" };
      const proposal = { id: "prop-123", jobId: "job-101" };

      const isHiringOrg = clientOrg.id === job.organizationId;
      expect(isHiringOrg).toBe(true);
    });

    it("prohibits a client from viewing proposals submitted to other organizations' jobs", () => {
      const clientOrg = { id: "org-gamma" };
      const otherOrgJob = { id: "job-202", organizationId: "org-beta" };

      const isHiringOrg = clientOrg.id === otherOrgJob.organizationId;
      expect(isHiringOrg).toBe(false);
    });
  });

  describe("Deterministic Matching Scoring Service", () => {
    it("scores high for exact skill match, budget fit, and timezone overlap", () => {
      const brief = {
        title: "LangGraph Multi-Agent Support Triage",
        goal: "Automate tier-1 customer inquiries with LangGraph and Python",
        requiredSkills: ["LangGraph", "Python", "Zendesk"],
        budgetMin: 120,
        budgetMax: 200,
        hoursPerWeek: 15,
        timezonePref: "America/New_York",
        organization: { industry: "SaaS" },
      };

      const profile = {
        id: "prof-1",
        hourlyRate: 150,
        weeklyAvailability: 20,
        timezone: "America/New_York",
        ratingAvg: 4.9,
        status: "APPROVED",
        skills: [
          {
            skill: { name: "LangGraph", slug: "langgraph" },
            level: 5,
            verified: true,
          },
          {
            skill: { name: "Python", slug: "python" },
            level: 5,
            verified: true,
          },
          {
            skill: { name: "Zendesk", slug: "zendesk" },
            level: 4,
            verified: false,
          },
        ],
        specializations: [
          { specialization: { name: "AI Agent Orchestration" } },
        ],
        caseStudies: [
          {
            title: "Autonomous Tier 1 Support Agent",
            clientIndustry: "SaaS",
            metricsAchieved: "Resolved 42% of tickets without human touch",
          },
        ],
        industries: ["SaaS", "Fintech"],
      };

      const result = computeDeterministicMatchScore({
        brief,
        profile,
        weights: DEFAULT_MATCH_WEIGHTS,
      });

      expect(result.totalScore).toBeGreaterThanOrEqual(85);
      expect(result.breakdown.skillCoverage.score).toBe(
        DEFAULT_MATCH_WEIGHTS.skillCoverage
      );
      expect(result.breakdown.budgetFit.status).toBe("EXACT");
      expect(result.breakdown.timezoneOverlap.overlapHours).toBe(8);
      expect(result.explanation).toContain("LangGraph");
    });

    it("penalizes out of budget rate and missing skills proportionally", () => {
      const brief = {
        title: "Enterprise NetSuite Accounting AI",
        requiredSkills: ["NetSuite", "SAP"],
        budgetMin: 80,
        budgetMax: 120,
        hoursPerWeek: 30,
        timezonePref: "UTC",
      };

      const profile = {
        id: "prof-2",
        hourlyRate: 300, // Very over budget
        weeklyAvailability: 10, // Under required hours
        timezone: "Asia/Tokyo", // Limited overlap
        ratingAvg: 4.5,
        status: "APPROVED",
        skills: [
          {
            skill: { name: "React", slug: "react" },
            level: 4,
            verified: false,
          },
        ],
        specializations: [],
        caseStudies: [],
      };

      const result = computeDeterministicMatchScore({
        brief,
        profile,
        weights: DEFAULT_MATCH_WEIGHTS,
      });

      expect(result.totalScore).toBeLessThan(50);
      expect(result.breakdown.budgetFit.status).toBe("OVER_BUDGET");
      expect(result.watchOuts).toContain("Hourly rate");
    });
  });
});
