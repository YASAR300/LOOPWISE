import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  VETTING_STATUS,
  ALLOWED_TRANSITIONS,
  VettingTransitionError,
  validateProfileCompleteness,
  transitionStrategistStatus,
} from "../services/vetting";
import {
  getSanitizedAssessment,
  autosaveAnswers,
  submitAndScoreAttempt,
  overrideAttemptScore,
} from "../services/assessment";
import { db } from "@/lib/db";
import * as aiLib from "@/lib/ai";
import * as emailLib from "@/lib/email";
import * as auditLib from "@/lib/audit";

vi.mock("@/lib/db", () => ({
  db: {
    strategistProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({}),
    },
    assessment: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    assessmentAttempt: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    vettingReview: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
  sendTemplatedEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/ai", () => ({
  generateJSON: vi.fn(),
}));

describe("Vetting Status Machine & Profile Completeness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Status Transitions", () => {
    it("allows valid transitions", () => {
      expect(ALLOWED_TRANSITIONS[VETTING_STATUS.DRAFT]).toContain(
        VETTING_STATUS.SUBMITTED
      );
      expect(ALLOWED_TRANSITIONS[VETTING_STATUS.SUBMITTED]).toContain(
        VETTING_STATUS.IN_REVIEW
      );
      expect(ALLOWED_TRANSITIONS[VETTING_STATUS.IN_REVIEW]).toContain(
        VETTING_STATUS.APPROVED
      );
      expect(ALLOWED_TRANSITIONS[VETTING_STATUS.IN_REVIEW]).toContain(
        VETTING_STATUS.REJECTED
      );
      expect(ALLOWED_TRANSITIONS[VETTING_STATUS.APPROVED]).toContain(
        VETTING_STATUS.SUSPENDED
      );
      expect(ALLOWED_TRANSITIONS[VETTING_STATUS.SUSPENDED]).toContain(
        VETTING_STATUS.APPROVED
      );
    });

    it("throws VettingTransitionError on illegal transitions", async () => {
      vi.mocked(db.strategistProfile.findUnique).mockResolvedValueOnce({
        id: "prof_1",
        status: VETTING_STATUS.DRAFT,
        user: { email: "strat@loopwise.dev", name: "Alex" },
      });

      await expect(
        transitionStrategistStatus({
          strategistProfileId: "prof_1",
          toStatus: VETTING_STATUS.APPROVED,
          adminUserId: "admin_1",
        })
      ).rejects.toThrow(VettingTransitionError);
    });

    it("successfully transitions from SUBMITTED to IN_REVIEW and logs audit event", async () => {
      const mockProfile = {
        id: "prof_2",
        status: VETTING_STATUS.SUBMITTED,
        user: { email: "strat@loopwise.dev", name: "Elena" },
      };
      vi.mocked(db.strategistProfile.findUnique).mockResolvedValueOnce(
        mockProfile
      );
      vi.mocked(db.strategistProfile.update).mockResolvedValueOnce({
        ...mockProfile,
        status: VETTING_STATUS.IN_REVIEW,
      });

      const updated = await transitionStrategistStatus({
        strategistProfileId: "prof_2",
        toStatus: VETTING_STATUS.IN_REVIEW,
        adminUserId: "admin_1",
      });

      expect(updated.status).toBe(VETTING_STATUS.IN_REVIEW);
      expect(auditLib.writeAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "STRATEGIST_STATUS_IN_REVIEW",
          entityId: "prof_2",
        })
      );
    });

    it("sends approval email and sets verifiedAt when transitioning to APPROVED", async () => {
      const mockProfile = {
        id: "prof_3",
        status: VETTING_STATUS.IN_REVIEW,
        user: { email: "marcus@loopwise.dev", name: "Dr. Marcus Chen" },
      };
      vi.mocked(db.strategistProfile.findUnique).mockResolvedValueOnce(
        mockProfile
      );
      vi.mocked(db.strategistProfile.update).mockResolvedValueOnce({
        ...mockProfile,
        status: VETTING_STATUS.APPROVED,
        verifiedAt: new Date(),
      });

      const updated = await transitionStrategistStatus({
        strategistProfileId: "prof_3",
        toStatus: VETTING_STATUS.APPROVED,
        adminUserId: "admin_1",
      });

      expect(updated.status).toBe(VETTING_STATUS.APPROVED);
      expect(emailLib.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "marcus@loopwise.dev",
          subject: expect.stringContaining("Approved"),
        })
      );
    });
  });

  describe("Profile Completeness Validator", () => {
    it("flags missing fields for an incomplete profile", async () => {
      const incompleteProfile = {
        headline: null,
        bio: null,
        location: null,
        caseStudies: [],
        skills: [],
        availabilitySlots: [],
      };

      const result = await validateProfileCompleteness(incompleteProfile);
      expect(result.isComplete).toBe(false);
      expect(result.score).toBeLessThan(100);
      expect(result.missing.some((m) => m.includes("caseStudies"))).toBe(true);
    });

    it("confirms 100% completeness when all sections and at least 2 case studies are present", async () => {
      const completeProfile = {
        headline: "Fractional Head of AI & LLM Systems",
        bio: "Over 10 years of experience building multi-agent architectures and enterprise automation.",
        location: "San Francisco, CA",
        timezone: "America/Los_Angeles",
        linkedinUrl: "https://linkedin.com/in/alex",
        yearsExperience: 10,
        hourlyRateMin: 200,
        availabilityHoursPerWeek: 20,
        skills: [{ id: "sk_1", level: 5 }],
        specializations: [{ id: "sp_1" }],
        caseStudies: [
          { id: "cs_1", title: "Study 1", problem: "P1", approach: "A1" },
          { id: "cs_2", title: "Study 2", problem: "P2", approach: "A2" },
        ],
        availabilitySlots: [{ id: "av_1", dayOfWeek: 1 }],
      };

      const result = await validateProfileCompleteness(completeProfile);
      expect(result.isComplete).toBe(true);
      expect(result.score).toBe(100);
      expect(result.missing).toHaveLength(0);
    });
  });
});

describe("Skills Assessment Engine & Scoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sanitization", () => {
    it("strips correct answers and internal rubrics before sending to candidate", async () => {
      const mockAssessment = {
        id: "as_1",
        title: "Fractional AI Benchmark",
        timeLimitMinutes: 45,
        questions: [
          {
            id: "q_1",
            domain: "Agent Architecture",
            scenario: "Support team automation",
            prompt: "Select orchestration pattern",
            type: "MULTIPLE_CHOICE",
            options: ["A", "B", "C"],
            correctOption: "B",
            rubric: { weight: 1.0 },
            points: 10,
            order: 1,
          },
        ],
      };

      vi.mocked(db.assessment.findFirst).mockResolvedValueOnce(mockAssessment);

      const result = await getSanitizedAssessment();
      expect(result.questions).toHaveLength(1);
      const q = result.questions[0];
      expect(q.prompt).toBe("Select orchestration pattern");
      expect(q.correctOption).toBeUndefined();
      expect(q.rubric).toBeUndefined();
    });
  });

  describe("Autosave", () => {
    it("updates attempt answers and tracks time remaining", async () => {
      const mockAttempt = {
        id: "att_1",
        startedAt: new Date(Date.now() - 300000), // 5 mins ago
        answers: { q_1: "Answer A" },
        timeRemainingSeconds: 2400,
        assessment: { timeLimitMinutes: 45 },
      };

      vi.mocked(db.assessmentAttempt.findUnique).mockResolvedValueOnce(
        mockAttempt
      );
      vi.mocked(db.assessmentAttempt.update).mockResolvedValueOnce({
        ...mockAttempt,
        answers: { q_1: "Answer A", q_2: "Answer B" },
      });

      const saved = await autosaveAnswers({
        attemptId: "att_1",
        answers: { q_1: "Answer A", q_2: "Answer B" },
      });

      expect(db.assessmentAttempt.update).toHaveBeenCalled();
      expect(saved.timeRemainingSeconds).toBeLessThanOrEqual(2700);
    });
  });

  describe("Grading & AI Evaluation", () => {
    it("auto-scores multiple choice and uses AI rubric for free-text answers", async () => {
      const mockAttempt = {
        id: "att_2",
        answers: {
          q_mcq: "B) LangGraph Supervisor",
          q_free:
            "We deploy deterministic guardrails on tool execution with human-in-the-loop.",
        },
        assessment: {
          passingScore: 80,
          questions: [
            {
              id: "q_mcq",
              type: "MULTIPLE_CHOICE",
              correctOption: "B) LangGraph Supervisor",
              points: 10,
            },
            {
              id: "q_free",
              type: "FREE_TEXT",
              prompt: "Explain guardrail architecture",
              points: 10,
              rubric: {
                criteria: ["Security", "Fallback"],
              },
            },
          ],
        },
      };

      vi.mocked(db.assessmentAttempt.findUnique).mockResolvedValueOnce(
        mockAttempt
      );
      vi.mocked(aiLib.generateJSON).mockResolvedValueOnce({
        score: 5,
        maxScore: 5,
        rationale: "Exceptional architecture with zero trust tool calling.",
      });

      vi.mocked(db.assessmentAttempt.update).mockImplementationOnce(
        ({ data }) =>
          Promise.resolve({
            ...mockAttempt,
            ...data,
            evaluatedAt: new Date(),
          })
      );

      const evaluated = await submitAndScoreAttempt({
        attemptId: "att_2",
        answers: mockAttempt.answers,
      });

      expect(evaluated.score).toBe(100);
      expect(evaluated.passed).toBe(true);
      expect(evaluated.aiEvaluations["q_free"].score).toBe(5);
    });

    it("allows human admin score override", async () => {
      const mockAttempt = {
        id: "att_3",
        score: 75,
        passed: false,
        answers: {},
        assessment: { passingScore: 80 },
      };

      vi.mocked(db.assessmentAttempt.findUnique).mockResolvedValueOnce(
        mockAttempt
      );
      vi.mocked(db.assessmentAttempt.update).mockImplementationOnce(
        ({ data }) =>
          Promise.resolve({
            ...mockAttempt,
            ...data,
          })
      );

      const overridden = await overrideAttemptScore({
        attemptId: "att_3",
        adminUserId: "admin_1",
        manualScore: 85,
        overrideNotes:
          "Candidate demonstrated deep production understanding in live case study.",
      });

      expect(overridden.score).toBe(85);
      expect(overridden.passed).toBe(true);
    });
  });
});
