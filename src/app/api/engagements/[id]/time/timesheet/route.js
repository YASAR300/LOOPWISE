// src/app/api/engagements/[id]/time/timesheet/route.js
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
    const { timesheetWeek, action, disputeReason } = await request.json(); // action: "APPROVE" | "DISPUTE"

    if (!timesheetWeek || !action) {
      return NextResponse.json(
        { error: "timesheetWeek and action are required" },
        { status: 400 }
      );
    }

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: { strategistProfile: true, organization: true },
    });

    if (!engagement)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );

    // Only client can approve or dispute timesheets
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only client organization can approve/dispute timesheets" },
        { status: 403 }
      );
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "DISPUTED";
    const now = new Date();

    const result = await db.timeEntry.updateMany({
      where: {
        engagementId: id,
        timesheetWeek,
      },
      data: {
        status: newStatus,
        disputeReason:
          action === "DISPUTE" ? disputeReason || "Disputed by client" : null,
        approvedAt: action === "APPROVE" ? now : null,
        approvedById: action === "APPROVE" ? user.id : null,
      },
    });

    // Notify strategist
    if (engagement.strategistProfile.userId) {
      await db.notification.create({
        data: {
          userId: engagement.strategistProfile.userId,
          type: "ENGAGEMENT",
          title: `Timesheet ${timesheetWeek} ${action === "APPROVE" ? "Approved" : "Disputed"}`,
          body:
            action === "APPROVE"
              ? `Client approved your logged hours for ${timesheetWeek}.`
              : `Client requested clarification on timesheet ${timesheetWeek}: ${disputeReason || "No details provided"}`,
          actionUrl: `/strategist/engagements/${id}?tab=time`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      status: newStatus,
    });
  } catch (error) {
    console.error("[Timesheet Action Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
