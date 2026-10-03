import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  transitionStrategistStatus,
  VETTING_STATUS,
} from "@/server/services/vetting";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Strategist profile not found" },
        { status: 404 }
      );
    }

    const updated = await transitionStrategistStatus({
      profileId: profile.id,
      targetStatus: VETTING_STATUS.SUBMITTED,
    });

    return NextResponse.json({
      success: true,
      status: updated.status,
      slaDeadline: updated.slaDeadline,
    });
  } catch (error) {
    console.error("[Strategist Submit Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
