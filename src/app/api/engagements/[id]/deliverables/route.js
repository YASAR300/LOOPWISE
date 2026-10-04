// src/app/api/engagements/[id]/deliverables/route.js
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
      title,
      description,
      stage = "BACKLOG",
      labels = [],
      dueDate,
      checklist = [],
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

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

    // Freeze edits if completed or terminated
    if (["COMPLETED", "TERMINATED"].includes(engagement.status)) {
      return NextResponse.json(
        { error: "Engagement is closed. Deliverables are frozen." },
        { status: 400 }
      );
    }

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const count = await db.deliverable.count({
      where: { engagementId: id, stage },
    });

    const deliverable = await db.deliverable.create({
      data: {
        engagementId: id,
        title: title.trim(),
        description: description?.trim() || "",
        stage,
        order: count,
        labels,
        dueDate: dueDate ? new Date(dueDate) : null,
        checklist,
        assigneeId: isStrategist ? engagement.strategistProfile.id : null,
      },
    });

    // Activity event
    await db.activityEvent.create({
      data: {
        engagementId: id,
        actorId: user.id,
        type: "DELIVERABLE_CREATED",
        title: `Deliverable added: "${title.trim()}"`,
        metadata: { deliverableId: deliverable.id, stage },
      },
    });

    return NextResponse.json({ success: true, deliverable });
  } catch (error) {
    console.error("[Create Deliverable Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
