// src/app/api/engagements/[id]/cadence/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      weekNumber,
      startDate,
      endDate,
      done,
      next,
      risks,
      decisionsNeeded,
    } = body;

    if (!done?.trim() || !next?.trim()) {
      return NextResponse.json(
        { error: "Must specify what was done and what is planned next" },
        { status: 400 }
      );
    }

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: {
        strategistProfile: true,
        organization: true,
      },
    });

    if (!engagement) {
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );
    }

    if (["COMPLETED", "TERMINATED"].includes(engagement.status)) {
      return NextResponse.json(
        { error: "Engagement is closed. Updates are frozen." },
        { status: 400 }
      );
    }

    // Only strategist can post cadence updates
    const isStrategist = engagement.strategistProfile.userId === user.id;
    if (!isStrategist && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only the appointed strategist can post cadence updates" },
        { status: 403 }
      );
    }

    const currentCount = await db.weeklyCadenceUpdate.count({
      where: { engagementId: id },
    });

    const now = new Date();
    const sDate = startDate
      ? new Date(startDate)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const eDate = endDate ? new Date(endDate) : now;

    const cadenceUpdate = await db.weeklyCadenceUpdate.create({
      data: {
        engagementId: id,
        weekNumber: weekNumber || currentCount + 1,
        startDate: sDate,
        endDate: eDate,
        done: done.trim(),
        next: next.trim(),
        risks: risks?.trim() || null,
        decisionsNeeded: decisionsNeeded?.trim() || null,
      },
    });

    // Notify client organization members
    const orgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId },
    });

    if (orgMember?.userId) {
      await db.notification.create({
        data: {
          userId: orgMember.userId,
          type: "ENGAGEMENT",
          title: `Weekly Update Posted (Week ${cadenceUpdate.weekNumber})`,
          body: `Strategist published the weekly progress cadence. Review Done, Next, and Decisions Needed.`,
          actionUrl: `/client/engagements/${id}?tab=cadence`,
        },
      });
    }

    // Log ActivityEvent
    await db.activityEvent.create({
      data: {
        engagementId: id,
        actorId: user.id,
        type: "CADENCE_UPDATE_POSTED",
        title: `Weekly Cadence Update posted for Week ${cadenceUpdate.weekNumber}`,
        metadata: {
          updateId: cadenceUpdate.id,
          weekNumber: cadenceUpdate.weekNumber,
        },
      },
    });

    return NextResponse.json({ success: true, update: cadenceUpdate });
  } catch (error) {
    console.error("[Post Cadence Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
