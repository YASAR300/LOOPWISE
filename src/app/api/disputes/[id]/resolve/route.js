// src/app/api/disputes/[id]/resolve/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordDisputeResolution } from "@/server/services/ledger";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      outcome,
      clientRefundCents,
      strategistPayoutCents,
      resolutionNotes,
    } = body;

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        engagement: {
          include: {
            organization: { include: { members: true } },
            strategistProfile: { include: { user: true } },
          },
        },
        milestone: true,
      },
    });

    if (!dispute)
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });

    // Only Admin can adjudicate and resolve disputes
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can adjudicate disputes" },
        { status: 403 }
      );
    }

    const now = new Date();
    const escrowBaseCents = Math.round(
      (dispute.milestone?.amount || dispute.amount || 0) * 100
    );

    const clientCents = Math.round(Number(clientRefundCents) || 0);
    const stratCents = Math.round(Number(strategistPayoutCents) || 0);
    const platformFeeCents = Math.max(
      0,
      escrowBaseCents - clientCents - stratCents
    );

    // 1. Record Double-Entry Dispute Resolution in Ledger
    if (escrowBaseCents > 0) {
      await recordDisputeResolution({
        disputeId: dispute.id,
        engagementId: dispute.engagementId,
        organizationId: dispute.engagement.organizationId,
        strategistProfileId: dispute.engagement.strategistProfileId,
        escrowBaseCents,
        clientRefundCents: clientCents,
        strategistPayoutCents: stratCents,
        platformFeeCents,
        idempotencyKey: `dispute_resolve_${dispute.id}`,
      });
    }

    // 2. Update Dispute record
    const statusOutcome =
      outcome === "FULL_CLIENT_REFUND"
        ? "RESOLVED_CLIENT"
        : outcome === "FULL_STRATEGIST_PAYOUT"
          ? "RESOLVED_STRATEGIST"
          : outcome === "SPLIT"
            ? "RESOLVED_SPLIT"
            : "DISMISSED";

    const updatedDispute = await db.dispute.update({
      where: { id },
      data: {
        status: statusOutcome,
        resolutionOutcome: outcome,
        clientRefundAmount: clientCents / 100,
        strategistPayoutAmount: stratCents / 100,
        resolutionNotes: resolutionNotes || "Resolved by platform mediation",
        resolvedAt: now,
        resolvedById: user.id,
      },
    });

    // 3. Update milestone status
    if (dispute.milestoneId) {
      const milestoneNextStatus =
        outcome === "FULL_CLIENT_REFUND"
          ? "REJECTED"
          : outcome === "FULL_STRATEGIST_PAYOUT"
            ? "RELEASED"
            : "APPROVED";

      await db.milestone.update({
        where: { id: dispute.milestoneId },
        data: { status: milestoneNextStatus },
      });
    }

    // 4. Resume Engagement out of DISPUTED state back to ACTIVE
    await db.engagement.update({
      where: { id: dispute.engagementId },
      data: { status: "ACTIVE" },
    });

    // 5. Notify both parties
    await db.notification.create({
      data: {
        userId: dispute.engagement.strategistProfile.userId,
        type: "ENGAGEMENT",
        title: "Escrow Dispute Resolved",
        body: `Dispute on "${dispute.engagement.title}" has been resolved (${outcome}). Payout: $${(stratCents / 100).toLocaleString()}.`,
        actionUrl: `/strategist/earnings`,
      },
    });

    for (const m of dispute.engagement.organization.members) {
      await db.notification.create({
        data: {
          userId: m.userId,
          type: "ENGAGEMENT",
          title: "Escrow Dispute Resolved",
          body: `Dispute on "${dispute.engagement.title}" has been resolved (${outcome}). Refund: $${(clientCents / 100).toLocaleString()}.`,
          actionUrl: `/client/billing`,
        },
      });
    }

    await db.activityEvent.create({
      data: {
        engagementId: dispute.engagementId,
        actorId: user.id,
        type: "DISPUTE_RESOLVED",
        title: `Dispute resolved (${outcome}): Refund $${(clientCents / 100).toLocaleString()}, Payout $${(stratCents / 100).toLocaleString()}`,
        metadata: { disputeId: dispute.id, outcome },
      },
    });

    return NextResponse.json({ success: true, dispute: updatedDispute });
  } catch (error) {
    console.error("[Dispute Resolution Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
