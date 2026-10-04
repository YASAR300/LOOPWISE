// src/app/api/engagements/[id]/controls/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { action, reason, feedback, newScope, replacementReason } = body;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: {
        strategistProfile: { include: { user: true } },
        organization: true,
        contract: true,
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

    const now = new Date();

    if (action === "PAUSE") {
      await db.engagement.update({
        where: { id },
        data: {
          status: "PAUSED",
          pauseReason: reason || "Paused by user",
        },
      });

      if (engagement.contract) {
        await db.contract.update({
          where: { id: engagement.contract.id },
          data: { status: "PAUSED" },
        });
      }

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "ENGAGEMENT_PAUSED",
          title: `Engagement paused: ${reason || "Temporary pause"}`,
        },
      });

      return NextResponse.json({ success: true, status: "PAUSED" });
    }

    if (action === "RESUME") {
      await db.engagement.update({
        where: { id },
        data: {
          status: "ACTIVE",
          pauseReason: null,
        },
      });

      if (engagement.contract) {
        await db.contract.update({
          where: { id: engagement.contract.id },
          data: { status: "ACTIVE" },
        });
      }

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "ENGAGEMENT_RESUMED",
          title: "Engagement resumed and operational",
        },
      });

      return NextResponse.json({ success: true, status: "ACTIVE" });
    }

    if (action === "END") {
      const endStatus =
        body.status === "TERMINATED" ? "TERMINATED" : "COMPLETED";

      await db.engagement.update({
        where: { id },
        data: {
          status: endStatus,
          endReason: reason || "Engagement concluded",
          endFeedback: feedback || null,
          closedAt: now,
        },
      });

      if (engagement.contract) {
        await db.contract.update({
          where: { id: engagement.contract.id },
          data: { status: endStatus },
        });
      }

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "ENGAGEMENT_CLOSED",
          title: `Engagement closed as ${endStatus}. Reason: ${reason || "Completed"}`,
        },
      });

      // Notify other party
      const notifyUserId = isStrategist
        ? (
            await db.orgMember.findFirst({
              where: { organizationId: engagement.organizationId },
            })
          )?.userId
        : engagement.strategistProfile.userId;

      if (notifyUserId) {
        await db.notification.create({
          data: {
            userId: notifyUserId,
            type: "ENGAGEMENT",
            title: `Engagement Concluded (${endStatus})`,
            body: `Engagement has ended. Work is frozen. Please complete any final timesheet reviews.`,
            actionUrl: isStrategist
              ? `/client/engagements/${id}`
              : `/strategist/engagements/${id}`,
          },
        });
      }

      return NextResponse.json({ success: true, status: endStatus });
    }

    if (action === "REPLACEMENT") {
      // 14-day trial fit guarantee
      const startDate = engagement.startDate || engagement.createdAt;
      const diffDays = Math.floor(
        (now.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      const replacement = await db.replacementRequest.create({
        data: {
          engagementId: id,
          organizationId: engagement.organizationId,
          reason:
            replacementReason || reason || "14-Day Trial Fit Guarantee invoked",
          status: "PENDING",
        },
      });

      // Notify admins
      const admins = await db.user.findMany({ where: { role: "ADMIN" } });
      for (const admin of admins) {
        await db.notification.create({
          data: {
            userId: admin.id,
            type: "SYSTEM",
            title: "14-Day Fit Guarantee Request Submitted",
            body: `${engagement.organization.name} requested a strategist replacement for "${engagement.title}".`,
            actionUrl: `/admin/disputes`,
          },
        });
      }

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "REPLACEMENT_REQUESTED",
          title: `Trial Guarantee Replacement requested (Day ${diffDays})`,
          metadata: { replacementId: replacement.id },
        },
      });

      return NextResponse.json({ success: true, replacement });
    }

    if (action === "SCOPE_CHANGE") {
      if (!newScope?.trim()) {
        return NextResponse.json(
          { error: "New scope is required" },
          { status: 400 }
        );
      }

      if (!engagement.contract) {
        return NextResponse.json(
          { error: "No active contract found" },
          { status: 400 }
        );
      }

      const versionCount = await db.contractVersion.count({
        where: { contractId: engagement.contract.id },
      });

      const updatedContract = await db.contract.update({
        where: { id: engagement.contract.id },
        data: {
          scopeOfWork: newScope.trim(),
          status: "CHANGES_REQUESTED",
          versions: {
            create: {
              versionNumber: versionCount + 1,
              termsMd: engagement.contract.termsMd,
              scopeOfWork: newScope.trim(),
              changesSummary:
                reason || "Scope amendment requested by collaborator",
              createdById: user.id,
            },
          },
        },
      });

      await db.activityEvent.create({
        data: {
          engagementId: id,
          actorId: user.id,
          type: "SCOPE_AMENDMENT_PROPOSED",
          title: `Scope amendment proposed (Contract v${versionCount + 1})`,
        },
      });

      return NextResponse.json({ success: true, contract: updatedContract });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Engagement Controls Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
