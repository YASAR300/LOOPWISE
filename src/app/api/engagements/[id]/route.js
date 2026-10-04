// src/app/api/engagements/[id]/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: {
        organization: true,
        strategistProfile: {
          include: {
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        },
        contract: {
          include: {
            versions: { orderBy: { versionNumber: "desc" } },
            comments: {
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
        milestones: {
          orderBy: { createdAt: "asc" },
          include: { deliverables: true },
        },
        deliverables: {
          orderBy: [{ stage: "asc" }, { order: "asc" }, { createdAt: "desc" }],
        },
        weeklyUpdates: {
          orderBy: { weekNumber: "desc" },
        },
        timeEntries: {
          orderBy: { date: "desc" },
          include: { deliverable: { select: { id: true, title: true } } },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
        activityEvents: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        replacementRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!engagement) {
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );
    }

    // Role & Tenant isolation
    const isStrategist = engagement.strategistProfile.userId === user.id;
    const orgMembership = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !orgMembership && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate time metrics for current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const hoursThisWeek = engagement.timeEntries
      .filter((t) => new Date(t.date) >= startOfWeek)
      .reduce((sum, t) => sum + (t.hours || 0), 0);

    // Days since engagement start (for 14-day fit guarantee calculation)
    const startDate = engagement.startDate || engagement.createdAt;
    const diffDays = Math.floor(
      (now.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const isWithinTrialGuarantee = diffDays <= 14;

    return NextResponse.json({
      engagement,
      viewerRole: isStrategist ? "STRATEGIST" : "CLIENT",
      metrics: {
        hoursThisWeek,
        weeklyCap: engagement.hourlyWeeklyCap || 20,
        daysActive: Math.max(1, diffDays),
        isWithinTrialGuarantee,
      },
    });
  } catch (error) {
    console.error("[Engagement GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
