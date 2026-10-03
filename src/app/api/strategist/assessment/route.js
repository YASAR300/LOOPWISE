import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getSanitizedAssessment,
  startOrResumeAttempt,
  autosaveAnswers,
  submitAndScoreAttempt,
} from "@/server/services/assessment";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const assessment = await getSanitizedAssessment();
    const attempt = await startOrResumeAttempt({
      strategistProfileId: profile.id,
      assessmentId: assessment.id,
    });

    return NextResponse.json({
      assessment,
      attempt,
    });
  } catch (error) {
    console.error("[Assessment GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, attemptId, answers } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });
    }

    if (action === "autosave") {
      const saved = await autosaveAnswers({ attemptId, answers });
      return NextResponse.json({
        success: true,
        timeRemainingSeconds: saved.timeRemainingSeconds,
      });
    }

    if (action === "submit") {
      const evaluated = await submitAndScoreAttempt({ attemptId, answers });
      return NextResponse.json({
        success: true,
        score: evaluated.score,
        passed: evaluated.passed,
        aiEvaluations: evaluated.aiEvaluations,
        evaluatedAt: evaluated.evaluatedAt,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Assessment POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
