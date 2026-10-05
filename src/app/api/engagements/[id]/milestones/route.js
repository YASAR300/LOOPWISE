// src/app/api/engagements/[id]/milestones/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: {
        strategistProfile: true,
        organization: true,
      },
    });

    if (!engagement)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const milestones = await db.milestone.findMany({
      where: { engagementId: id },
      include: {
        deliverables: { select: { id: true, title: true, stage: true } },
        disputes: { select: { id: true, status: true, reason: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      milestones,
      escrowBalance: engagement.escrowBalance,
    });
  } catch (error) {
    console.error("[Milestones GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { title, description, amount, dueDate } = body;

    if (!title?.trim() || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Title and positive amount are required" },
        { status: 400 }
      );
    }

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: { strategistProfile: true },
    });

    if (!engagement)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const milestone = await db.milestone.create({
      data: {
        engagementId: id,
        title: title.trim(),
        description: description?.trim() || null,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
      },
    });

    await db.activityEvent.create({
      data: {
        engagementId: id,
        actorId: user.id,
        type: "MILESTONE_CREATED",
        title: `Added milestone: "${milestone.title}" ($${milestone.amount.toLocaleString()})`,
        metadata: { milestoneId: milestone.id },
      },
    });

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error("[Milestone POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
