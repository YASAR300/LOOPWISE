import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getOnboardingState,
  saveStepProgress,
} from "@/server/services/onboarding";
import { validateProfileCompleteness } from "@/server/services/vetting";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profile, allSpecializations, allSkills } = await getOnboardingState(
      session.user.id
    );
    const { isComplete, checklist } = await validateProfileCompleteness(
      profile.id
    );

    return NextResponse.json({
      profile,
      allSpecializations,
      allSkills,
      isComplete,
      checklist,
    });
  } catch (error) {
    console.error("[Onboarding GET Error]:", error);
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
    const { step, data } = body;

    if (!step || !data) {
      return NextResponse.json(
        { error: "Missing step or data" },
        { status: 400 }
      );
    }

    const updated = await saveStepProgress({
      userId: session.user.id,
      step: Number(step),
      data,
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("[Onboarding POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
