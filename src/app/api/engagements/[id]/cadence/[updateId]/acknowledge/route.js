// src/app/api/engagements/[id]/cadence/[updateId]/acknowledge/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, updateId } = await params;
    const body = await request.json();
    const { clientReaction = "THUMBS_UP", clientNotes = "" } = body;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: { strategistProfile: true },
    });

    if (!engagement) {
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );
    }

    // Only client can acknowledge
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only client can acknowledge weekly updates" },
        { status: 403 }
      );
    }

    const updated = await db.weeklyCadenceUpdate.update({
      where: { id: updateId },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedById: user.id,
        clientReaction,
        clientNotes: clientNotes?.trim() || null,
      },
    });

    // Notify strategist
    if (engagement.strategistProfile.userId) {
      await db.notification.create({
        data: {
          userId: engagement.strategistProfile.userId,
          type: "ENGAGEMENT",
          title: "Weekly Cadence Acknowledged",
          body: `Client acknowledged Week ${updated.weekNumber} update with feedback: "${clientNotes || clientReaction}".`,
          actionUrl: `/strategist/engagements/${id}?tab=cadence`,
        },
      });
    }

    return NextResponse.json({ success: true, update: updated });
  } catch (error) {
    console.error("[Acknowledge Cadence Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
