// src/server/services/assessment.js
import { db } from "@/lib/db";
import { generateJSON } from "@/lib/ai";
import { z } from "zod";

const AI_EVALUATION_SCHEMA = z.object({
  score: z.number().min(0).max(5),
  maxScore: z.number().default(5),
  rationale: z.string(),
  criteriaScores: z
    .array(
      z.object({
        criterion: z.string(),
        score: z.number(),
        feedback: z.string(),
      })
    )
    .optional(),
});

/**
 * Get sanitized assessment questions for a candidate (NO ANSWER LEAKAGE)
 */
export async function getSanitizedAssessment(assessmentId = null) {
  let assessment;
  if (assessmentId) {
    assessment = await db.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });
  } else {
    assessment = await db.assessment.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  if (!assessment) {
    throw new Error("No skills assessment found");
  }

  // Strip correct options and internal answer keys
  const sanitizedQuestions = assessment.questions.map((q) => ({
    id: q.id,
    domain: q.domain,
    scenario: q.scenario,
    prompt: q.prompt,
    type: q.type,
    options: q.options,
    points: q.points,
    order: q.order,
  }));

  return {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    timeLimitMinutes: assessment.timeLimitMinutes,
    passingScore: assessment.passingScore,
    totalQuestions: sanitizedQuestions.length,
    questions: sanitizedQuestions,
  };
}

/**
 * Start or resume an active assessment attempt with server-side timer enforcement
 */
export async function startOrResumeAttempt({
  strategistProfileId,
  assessmentId,
}) {
  // Check existing attempts
  let attempt = await db.assessmentAttempt.findFirst({
    where: {
      strategistProfileId,
      assessmentId,
    },
    orderBy: { createdAt: "desc" },
  });

  const assessment = await db.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  const timeLimitSeconds = assessment.timeLimitMinutes * 60;

  if (!attempt || (attempt.evaluatedAt && !attempt.passed)) {
    // Create new attempt
    attempt = await db.assessmentAttempt.create({
      data: {
        assessmentId,
        strategistProfileId,
        answers: {},
        startedAt: new Date(),
        timeRemainingSeconds: timeLimitSeconds,
      },
    });
  }

  // Calculate elapsed time from server startedAt
  const elapsedSeconds = Math.floor(
    (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
  );
  const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
  const isExpired = remainingSeconds <= 0 && !attempt.evaluatedAt;

  return {
    attemptId: attempt.id,
    answers: attempt.answers || {},
    timeRemainingSeconds: remainingSeconds,
    isExpired,
    isCompleted: Boolean(attempt.evaluatedAt),
    score: attempt.score,
    passed: attempt.passed,
    startedAt: attempt.startedAt,
  };
}

/**
 * Autosave answers during the timed assessment
 */
export async function autosaveAnswers({ attemptId, answers }) {
  const attempt = await db.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { assessment: true },
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.evaluatedAt) throw new Error("Assessment already submitted");

  // Verify server timer has not expired
  const timeLimitSeconds = attempt.assessment.timeLimitMinutes * 60;
  const elapsed = Math.floor(
    (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
  );
  if (elapsed > timeLimitSeconds + 60) {
    throw new Error("Time expired. Assessment cannot accept new autosaves.");
  }

  return db.assessmentAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      timeRemainingSeconds: Math.max(0, timeLimitSeconds - elapsed),
    },
  });
}

/**
 * Grade free-text answers using Claude/Groq AI with strict rubric
 */
export async function gradeFreeTextWithAI({
  prompt,
  scenario,
  rubric,
  candidateAnswer,
}) {
  if (!candidateAnswer || candidateAnswer.trim().length < 10) {
    return {
      score: 0,
      maxScore: 5,
      rationale:
        "Answer was empty or too brief to demonstrate operational competency.",
    };
  }

  const system = `You are a Principal AI Governance Architect and Lead Assessor evaluating candidates for Fractional Head of AI & Automation engagements.
Evaluate the candidate's answer against the given scenario, prompt, and rubric.
Score on a strict scale of 0 to 5:
- 5: Exceptional, production-ready enterprise understanding with deterministic controls, failure mitigation, and clear trade-offs.
- 4: Strong, comprehensive answer covering key governance and architecture requirements.
- 3: Competent but generic; lacks specific engineering details or edge-case handling.
- 2: Weak; superficial understanding with missing security, latency, or compliance controls.
- 1: Inadequate or fundamentally flawed approach.
- 0: Completely irrelevant or nonsensical.

Respond strictly with valid JSON conforming to the requested schema.`;

  const user = `Scenario:
${scenario}

Prompt:
${prompt}

Rubric Criteria:
${JSON.stringify(rubric, null, 2)}

Candidate's Answer:
"""
${candidateAnswer}
"""

Evaluate this answer and provide a score (0 to 5), maxScore (5), and detailed rationale.`;

  try {
    const evaluation = await generateJSON({
      system,
      user,
      schema: AI_EVALUATION_SCHEMA,
    });
    return evaluation;
  } catch (err) {
    console.error("[AI Evaluation Failed]:", err?.message);
    // Fallback heuristic scoring if AI API temporarily unavailable
    const wordCount = candidateAnswer.trim().split(/\s+/).length;
    return {
      score: wordCount > 80 ? 4 : wordCount > 40 ? 3 : 2,
      maxScore: 5,
      rationale: "Automated heuristic fallback applied. Pending human review.",
    };
  }
}

/**
 * Submit and Score Assessment Attempt
 */
export async function submitAndScoreAttempt({ attemptId, answers }) {
  const attempt = await db.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: {
          questions: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!attempt) throw new Error("Attempt not found");
  if (attempt.evaluatedAt) return attempt;

  const questions = attempt.assessment.questions;
  let earnedPoints = 0;
  let totalAvailablePoints = 0;
  const aiEvaluations = {};

  for (const q of questions) {
    totalAvailablePoints += q.points;
    const userAnswer = answers[q.id];

    if (q.type === "MULTIPLE_CHOICE") {
      if (
        userAnswer &&
        String(userAnswer).trim() === String(q.correctOption).trim()
      ) {
        earnedPoints += q.points;
      }
    } else if (q.type === "RANKED_PRIORITY") {
      // Check full or partial order match
      if (userAnswer) {
        const correctStr = String(q.correctOption).trim();
        const userStr = Array.isArray(userAnswer)
          ? userAnswer.join(",")
          : String(userAnswer).trim();
        if (userStr === correctStr) {
          earnedPoints += q.points;
        } else {
          // Partial points if first 2 match
          const correctArr = correctStr.split(",");
          const userArr = userStr.split(",");
          let matches = 0;
          for (
            let i = 0;
            i < Math.min(correctArr.length, userArr.length);
            i++
          ) {
            if (correctArr[i] === userArr[i]) matches++;
          }
          const partialRatio = matches / correctArr.length;
          earnedPoints += Math.round(q.points * partialRatio);
        }
      }
    } else if (q.type === "FREE_TEXT") {
      // Evaluate via AI
      const aiResult = await gradeFreeTextWithAI({
        prompt: q.prompt,
        scenario: q.scenario,
        rubric: q.rubric,
        candidateAnswer: userAnswer,
      });

      aiEvaluations[q.id] = aiResult;
      const normalizedRatio = (aiResult.score || 0) / (aiResult.maxScore || 5);
      earnedPoints += Math.round(q.points * normalizedRatio);
    }
  }

  const finalPercentage = Math.round(
    (earnedPoints / (totalAvailablePoints || 1)) * 100
  );
  const passed = finalPercentage >= (attempt.assessment.passingScore || 80);

  const updatedAttempt = await db.assessmentAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      score: finalPercentage,
      passed,
      aiEvaluations,
      rubricVersion: "1.0",
      evaluatedAt: new Date(),
    },
  });

  return updatedAttempt;
}

/**
 * Human admin review override of assessment score
 */
export async function overrideAttemptScore({
  attemptId,
  reviewerId,
  adminUserId,
  newScore,
  manualScore,
  overrideReason,
  overrideNotes,
}) {
  const actualReviewerId = reviewerId || adminUserId;
  const actualScore = newScore !== undefined ? newScore : manualScore;
  const actualReason = overrideReason || overrideNotes;

  const attempt = await db.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: { assessment: true },
  });

  if (!attempt) throw new Error("Attempt not found");

  const passed = actualScore >= (attempt.assessment?.passingScore || 80);

  return db.assessmentAttempt.update({
    where: { id: attemptId },
    data: {
      score: actualScore,
      passed,
      aiEvaluations: {
        ...(attempt.aiEvaluations || {}),
        humanOverride: {
          reviewerId: actualReviewerId,
          overrideReason: actualReason,
          overriddenAt: new Date().toISOString(),
          originalScore: attempt.score,
        },
      },
    },
  });
}
