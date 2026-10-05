// src/app/api/disputes/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { engagementId, milestoneId, invoiceId, reason, amount, evidence } =
      body;

    if (!engagementId || !reason?.trim()) {
      return NextResponse.json(
        { error: "Engagement ID and dispute reason are required" },
        { status: 400 }
      );
    }

    const engagement = await db.engagement.findUnique({
      where: { id: engagementId },
      include: {
        strategistProfile: { include: { user: true } },
        organization: { include: { members: true } },
      },
    });

    if (!engagement)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = engagement.organization.members.some(
      (m) => m.userId === user.id
    );
    const isAdmin = user.role === "ADMIN";

    if (!isStrategist && !isOrgMember && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Not a party to this engagement" },
        { status: 403 }
      );
    }

    // 1. Create Dispute record
    const dispute = await db.dispute.create({
      data: {
        engagementId,
        milestoneId: milestoneId || null,
        invoiceId: invoiceId || null,
        initiatedById: user.id,
        reason: reason.trim(),
        amount: amount ? parseFloat(amount) : null,
        evidence: evidence || null,
        status: "OPEN",
      },
    });

    // 2. Freeze milestone if milestone disputed
    if (milestoneId) {
      await db.milestone.update({
        where: { id: milestoneId },
        data: { status: "DISPUTED" },
      });
    }

    // 3. Mark engagement state as DISPUTED to freeze mutations
    await db.engagement.update({
      where: { id: engagementId },
      data: { status: "DISPUTED" },
    });

    // 4. Log ActivityEvent
    await db.activityEvent.create({
      data: {
        engagementId,
        actorId: user.id,
        type: "DISPUTE_FILED",
        title: `Dispute filed by ${user.name || user.email}: "${reason.trim().slice(0, 80)}"`,
        metadata: { disputeId: dispute.id, milestoneId },
      },
    });

    // 5. Notify the counterparty and platform admins
    const notifyTargetUserId = isStrategist
      ? engagement.organization.members[0]?.userId
      : engagement.strategistProfile.userId;

    if (notifyTargetUserId) {
      await db.notification.create({
        data: {
          userId: notifyTargetUserId,
          type: "ENGAGEMENT",
          title: "Formal Dispute Opened – Funds Frozen in Escrow",
          body: `A dispute has been initiated regarding "${engagement.title}". Funds are frozen pending Loopwise mediation.`,
          actionUrl: `/app/messages`,
        },
      });
    }

    const admins = await db.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: "SYSTEM",
          title: "New Escrow Dispute Requires Mediation",
          body: `Dispute filed on engagement "${engagement.title}" (${engagement.organization.name} vs ${engagement.strategistProfile.user.name}).`,
          actionUrl: `/admin/disputes`,
        },
      });
    }

    return NextResponse.json({ success: true, dispute });
  } catch (error) {
    console.error("[Dispute Create Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const engagementId = searchParams.get("engagementId");

    let whereClause = {};
    if (engagementId) {
      whereClause.engagementId = engagementId;
    } else if (user.role === "CLIENT") {
      const membership = await db.orgMember.findFirst({
        where: { userId: user.id },
      });
      if (!membership) return NextResponse.json({ disputes: [] });
      whereClause.engagement = { organizationId: membership.organizationId };
    } else if (user.role === "STRATEGIST") {
      const profile = await db.strategistProfile.findUnique({
        where: { userId: user.id },
      });
      if (!profile) return NextResponse.json({ disputes: [] });
      whereClause.engagement = { strategistProfileId: profile.id };
    } else if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const disputes = await db.dispute.findMany({
      where: whereClause,
      include: {
        milestone: { select: { id: true, title: true, amount: true } },
        invoice: { select: { id: true, number: true, total: true } },
        engagement: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ disputes });
  } catch (error) {
    console.error("[Disputes GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
