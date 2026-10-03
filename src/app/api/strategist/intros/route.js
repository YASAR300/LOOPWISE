import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        meetingRequests: {
          include: {
            organization: true,
          },
          orderBy: { requestedDate: "desc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ intros: profile.meetingRequests });
  } catch (error) {
    console.error("[Strategist Intros GET Error]:", error);
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
    const { introId, action, proposedTime, notes } = body;

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const meeting = await db.meetingRequest.findFirst({
      where: {
        id: introId,
        strategistProfileId: profile.id,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const nextStatus = action === "ACCEPT" ? "ACCEPTED" : "DECLINED";
    const updateData = { status: nextStatus };

    if (proposedTime) {
      updateData.requestedDate = new Date(proposedTime);
    }
    if (notes) {
      updateData.notes = notes;
    }
    if (action === "ACCEPT" && !meeting.meetUrl) {
      updateData.meetUrl = `https://meet.loopwise.dev/intro-${meeting.id.slice(-6)}`;
    }

    const updated = await db.meetingRequest.update({
      where: { id: meeting.id },
      data: updateData,
    });

    await writeAuditLog({
      userId: session.user.id,
      action: `INTRO_${action}`,
      entityType: "MeetingRequest",
      entityId: meeting.id,
      metadata: { status: nextStatus, proposedTime },
    });

    return NextResponse.json({ success: true, intro: updated });
  } catch (error) {
    console.error("[Strategist Intros POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
