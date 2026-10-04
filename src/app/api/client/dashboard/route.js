import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's active organization membership
    const membership = await db.orgMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!membership?.organizationId) {
      return NextResponse.json({
        hasOrg: false,
        briefs: [],
        shortlists: [],
        proposals: [],
        engagements: [],
        unreadMessagesCount: 0,
        activityFeed: [],
        quota: { quota: 50, used: 0, remaining: 50 },
      });
    }

    const orgId = membership.organizationId;

    // 1. Active Briefs
    const briefs = await db.brief.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
      include: {
        workflows: {
          select: {
            id: true,
            name: true,
            automatabilityScore: true,
            businessImpactHours: true,
          },
        },
        jobs: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    // 2. Shortlists
    const shortlists = await db.shortlist.findMany({
      where: { organizationId: orgId },
      include: {
        items: {
          include: {
            strategistProfile: {
              include: {
                user: { select: { name: true, image: true, email: true } },
              },
            },
          },
        },
      },
      take: 5,
    });

    // 3. Pending Proposals
    const proposals = await db.proposal.findMany({
      where: {
        job: { organizationId: orgId },
        status: { in: ["SUBMITTED", "SHORTLISTED"] },
      },
      include: {
        job: { select: { id: true, title: true } },
        strategistProfile: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 4. Active Engagements
    const engagements = await db.engagement.findMany({
      where: {
        organizationId: orgId,
        status: { in: ["PENDING", "ACTIVE"] },
      },
      include: {
        strategistProfile: {
          include: {
            user: { select: { name: true, image: true } },
          },
        },
        milestones: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    // 5. Unread Messages count
    const unreadMessagesCount = await db.notification.count({
      where: {
        userId: user.id,
        type: "MESSAGE",
        read: false,
      },
    });

    // 6. Recent Activity Feed from ActivityEvent & AuditLog
    const activityEvents = await db.activityEvent.findMany({
      where: {
        engagement: { organizationId: orgId },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 7. AI Quota
    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { aiAnalysisQuota: true, aiAnalysisUsed: true },
    });

    const quota = {
      quota: org?.aiAnalysisQuota || 50,
      used: org?.aiAnalysisUsed || 0,
      remaining: Math.max(
        0,
        (org?.aiAnalysisQuota || 50) - (org?.aiAnalysisUsed || 0)
      ),
    };

    return NextResponse.json({
      hasOrg: true,
      organization: membership.organization,
      userRole: membership.role,
      briefs,
      shortlists,
      proposals,
      engagements,
      unreadMessagesCount,
      activityFeed: activityEvents,
      quota,
    });
  } catch (error) {
    console.error("[Client Dashboard GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
