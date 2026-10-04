// src/app/api/client/engagements/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const membership = await db.orgMember.findFirst({
      where: { userId: user.id },
    });

    if (!membership?.organizationId) {
      return NextResponse.json({ engagements: [], actionCount: 0 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";

    const whereClause = {
      organizationId: membership.organizationId,
      deletedAt: null,
    };

    if (status !== "ALL") {
      whereClause.status = status;
    }

    const engagements = await db.engagement.findMany({
      where: whereClause,
      include: {
        strategistProfile: {
          include: {
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        },
        contract: true,
        milestones: { select: { id: true, status: true, amount: true } },
        deliverables: {
          select: { id: true, stage: true, clientApprovalStatus: true },
        },
        weeklyUpdates: {
          orderBy: { weekNumber: "desc" },
          take: 1,
        },
        timeEntries: {
          where: {
            date: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          select: { hours: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Count action items: unapproved deliverables, pending contract signatures, unacknowledged cadence
    let actionCount = 0;
    const formatted = engagements.map((eng) => {
      const pendingDeliverables = eng.deliverables.filter(
        (d) => d.stage === "IN_REVIEW" || d.clientApprovalStatus === "PENDING"
      ).length;
      const needsContractSig = eng.contract && !eng.contract.signedByClientAt;
      const unacknowledgedUpdate =
        eng.weeklyUpdates[0] && !eng.weeklyUpdates[0].acknowledgedAt;

      const itemsNeedingAction =
        (pendingDeliverables > 0 ? 1 : 0) +
        (needsContractSig ? 1 : 0) +
        (unacknowledgedUpdate ? 1 : 0);

      actionCount += itemsNeedingAction;

      const hoursThisWeek = eng.timeEntries.reduce(
        (s, t) => s + (t.hours || 0),
        0
      );

      return {
        ...eng,
        hoursThisWeek,
        pendingDeliverables,
        needsContractSig,
        unacknowledgedUpdate,
        itemsNeedingAction,
      };
    });

    return NextResponse.json({ engagements: formatted, actionCount });
  } catch (error) {
    console.error("[Client Engagements Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
