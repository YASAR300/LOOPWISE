// src/app/api/engagements/[id]/milestones/[milestoneId]/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordMilestoneRelease } from "@/server/services/ledger";

export const dynamic = "force-dynamic";

const AUTO_RELEASE_DAYS = 7; // Configurable client review window

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, milestoneId } = await params;
    const body = await request.json();
    const {
      action,
      workNotes,
      workAttachments,
      clientFeedback,
      disputeReason,
    } = body;

    const milestone = await db.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        engagement: {
          include: {
            strategistProfile: { include: { user: true } },
            organization: true,
          },
        },
      },
    });

    if (!milestone || milestone.engagementId !== id) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const isStrategist =
      milestone.engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: {
        organizationId: milestone.engagement.organizationId,
        userId: user.id,
      },
    });
    const isAdmin = user.role === "ADMIN";

    const now = new Date();

    // 1. STRATEGIST SUBMITS WORK FOR MILESTONE
    if (action === "SUBMIT") {
      if (!isStrategist && !isAdmin) {
        return NextResponse.json(
          { error: "Only the assigned strategist can submit milestone work" },
          { status: 403 }
        );
      }

      if (
        milestone.status !== "IN_ESCROW" &&
        milestone.status !== "IN_PROGRESS" &&
        milestone.status !== "FUNDED"
      ) {
        return NextResponse.json(
          {
            error: `Cannot submit milestone from status ${milestone.status}. Must be IN_ESCROW.`,
          },
          { status: 400 }
        );
      }

      const autoReleaseDate = new Date(
        Date.now() + AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000
      );

      const updated = await db.milestone.update({
        where: { id: milestoneId },
        data: {
          status: "SUBMITTED",
          submittedAt: now,
          autoReleaseAt: autoReleaseDate,
          workNotes: workNotes?.trim() || null,
          workAttachments: workAttachments || null,
        },
      });

      // Notify Client Members
      const clientMembers = await db.orgMember.findMany({
        where: { organizationId: milestone.engagement.organizationId },
      });

      for (const m of clientMembers) {
        await db.notification.create({
          data: {
            userId: m.userId,
            type: "ENGAGEMENT",
            title: `Deliverables Submitted: "${milestone.title}"`,
            body: `${milestone.engagement.strategistProfile.user.name} submitted deliverables for milestone "${milestone.title}". Please review and approve within 7 days.`,
            actionUrl: `/client/engagements/${id}?tab=money`,
          },
        });
      }

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "MILESTONE_SUBMITTED",
          title: `Milestone submitted for review: "${milestone.title}"`,
          metadata: {
            milestoneId: milestone.id,
            autoReleaseAt: autoReleaseDate,
          },
        },
      });

      return NextResponse.json({ success: true, milestone: updated });
    }

    // 2. CLIENT APPROVES MILESTONE (Releases Escrow to Strategist)
    if (action === "APPROVE") {
      if (!isOrgMember && !isAdmin) {
        return NextResponse.json(
          {
            error:
              "Only the client organization can approve milestone deliverables",
          },
          { status: 403 }
        );
      }

      if (
        milestone.status !== "SUBMITTED" &&
        milestone.status !== "IN_ESCROW"
      ) {
        return NextResponse.json(
          {
            error: `Cannot approve milestone in status ${milestone.status}. Must be SUBMITTED.`,
          },
          { status: 400 }
        );
      }

      // Update milestone status to RELEASED
      const updated = await db.milestone.update({
        where: { id: milestoneId },
        data: {
          status: "RELEASED",
          approvedAt: now,
          releasedAt: now,
        },
      });

      // Record double-entry escrow release transaction in Ledger
      const baseAmountCents = Math.round(milestone.amount * 100);
      await recordMilestoneRelease({
        milestoneId: milestone.id,
        engagementId: milestone.engagementId,
        organizationId: milestone.engagement.organizationId,
        strategistProfileId: milestone.engagement.strategistProfileId,
        baseAmountCents,
        idempotencyKey: `escrow_release_${milestone.id}`,
      });

      // Notify Strategist
      await db.notification.create({
        data: {
          userId: milestone.engagement.strategistProfile.userId,
          type: "ENGAGEMENT",
          title: `Milestone Approved: "${milestone.title}"`,
          body: `Escrow released! $${milestone.amount.toLocaleString()} has been added to your earnings balance.`,
          actionUrl: `/strategist/earnings`,
        },
      });

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "MILESTONE_APPROVED",
          title: `Milestone approved and escrow released: "${milestone.title}" ($${milestone.amount.toLocaleString()})`,
          metadata: { milestoneId: milestone.id },
        },
      });

      return NextResponse.json({ success: true, milestone: updated });
    }

    // 3. CLIENT REQUESTS REVISIONS
    if (action === "REQUEST_CHANGES") {
      if (!isOrgMember && !isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updated = await db.milestone.update({
        where: { id: milestoneId },
        data: {
          status: "IN_PROGRESS",
          workNotes: clientFeedback
            ? `Changes requested: ${clientFeedback}`
            : milestone.workNotes,
        },
      });

      await db.notification.create({
        data: {
          userId: milestone.engagement.strategistProfile.userId,
          type: "ENGAGEMENT",
          title: `Changes Requested: "${milestone.title}"`,
          body: `${milestone.engagement.organization.name} requested changes on milestone "${milestone.title}". Feedback: ${clientFeedback || "See workspace notes."}`,
          actionUrl: `/strategist/engagements/${id}?tab=money`,
        },
      });

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "MILESTONE_CHANGES_REQUESTED",
          title: `Changes requested on milestone: "${milestone.title}"`,
          metadata: { milestoneId: milestone.id, feedback: clientFeedback },
        },
      });

      return NextResponse.json({ success: true, milestone: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Milestone Action Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
