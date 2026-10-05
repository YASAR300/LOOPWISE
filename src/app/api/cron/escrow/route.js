// src/app/api/cron/escrow/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordMilestoneRelease } from "@/server/services/ledger";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional verification if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In production with CRON_SECRET, reject unauthorized calls
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Unauthorized cron trigger" },
          { status: 401 }
        );
      }
    }

    const now = new Date();

    // Find all milestones in SUBMITTED status past their autoReleaseAt deadline
    const expiredMilestones = await db.milestone.findMany({
      where: {
        status: "SUBMITTED",
        autoReleaseAt: { lte: now },
        disputes: {
          none: {
            status: { in: ["OPEN", "UNDER_REVIEW"] },
          },
        },
      },
      include: {
        engagement: {
          include: {
            strategistProfile: { include: { user: true } },
            organization: { include: { members: true } },
          },
        },
      },
    });

    const releasedIds = [];

    for (const milestone of expiredMilestones) {
      try {
        // Mark as RELEASED
        await db.milestone.update({
          where: { id: milestone.id },
          data: {
            status: "RELEASED",
            approvedAt: now,
            releasedAt: now,
          },
        });

        // Release escrow in ledger
        const baseAmountCents = Math.round(milestone.amount * 100);
        await recordMilestoneRelease({
          milestoneId: milestone.id,
          engagementId: milestone.engagementId,
          organizationId: milestone.engagement.organizationId,
          strategistProfileId: milestone.engagement.strategistProfileId,
          baseAmountCents,
          idempotencyKey: `cron_autorelease_${milestone.id}`,
        });

        // Notify Strategist
        await db.notification.create({
          data: {
            userId: milestone.engagement.strategistProfile.userId,
            type: "ENGAGEMENT",
            title: `Milestone Auto-Released: "${milestone.title}"`,
            body: `Funds ($${milestone.amount.toLocaleString()}) have been auto-released after the review window passed without dispute.`,
            actionUrl: `/strategist/earnings`,
          },
        });

        // Notify Client Members
        for (const member of milestone.engagement.organization.members) {
          await db.notification.create({
            data: {
              userId: member.userId,
              type: "ENGAGEMENT",
              title: `Milestone Auto-Released: "${milestone.title}"`,
              body: `Milestone "${milestone.title}" ($${milestone.amount.toLocaleString()}) was auto-approved following the 7-day review period.`,
              actionUrl: `/client/engagements/${milestone.engagementId}?tab=money`,
            },
          });
        }

        await db.activityEvent.create({
          data: {
            engagementId: milestone.engagementId,
            actorId: "SYSTEM_CRON",
            type: "MILESTONE_AUTO_RELEASED",
            title: `Milestone auto-released after review period: "${milestone.title}" ($${milestone.amount.toLocaleString()})`,
            metadata: { milestoneId: milestone.id, autoReleasedAt: now },
          },
        });

        releasedIds.push(milestone.id);
      } catch (itemErr) {
        console.error(`[Auto-Release Failed for ${milestone.id}]:`, itemErr);
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: expiredMilestones.length,
      autoReleasedCount: releasedIds.length,
      releasedIds,
      executedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[Escrow Cron Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
