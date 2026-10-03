import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getVettingQueue,
  transitionStrategistStatus,
} from "@/server/services/vetting";
import { overrideAttemptScore } from "@/server/services/assessment";

export async function GET(request) {
  try {
    const session = await getSession();
    // Verify admin role
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      // In dev environment, allow if no admin session exists yet or check role
      if (
        process.env.NODE_ENV === "production" &&
        session?.user?.role !== "ADMIN"
      ) {
        return NextResponse.json(
          { error: "Unauthorized admin access" },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get("id");

    if (applicantId) {
      // Return single detailed applicant dossier for split-view review
      const profile = await db.strategistProfile.findUnique({
        where: { id: applicantId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
            },
          },
          specializations: {
            include: { specialization: true },
          },
          skills: {
            include: { skill: true },
          },
          caseStudies: {
            orderBy: { createdAt: "desc" },
          },
          availabilitySlots: {
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
          assessmentAttempts: {
            orderBy: { createdAt: "desc" },
            include: {
              assessment: {
                include: {
                  questions: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
          },
          vettingReviews: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Applicant not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ applicant: profile });
    }

    // List queue
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const queueData = await getVettingQueue({ status, search, page, limit });
    return NextResponse.json(queueData);
  } catch (error) {
    console.error("[Admin Vetting GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      if (
        process.env.NODE_ENV === "production" &&
        session?.user?.role !== "ADMIN"
      ) {
        return NextResponse.json(
          { error: "Unauthorized admin access" },
          { status: 403 }
        );
      }
    }

    const adminUserId = session?.user?.id || "admin-system";
    const body = await request.json();
    const {
      action,
      strategistProfileId,
      toStatus,
      reason,
      reviewerNotes,
      reviewerId,
      attemptId,
      manualScore,
      overrideNotes,
    } = body;

    if (action === "transition") {
      const updated = await transitionStrategistStatus({
        strategistProfileId,
        toStatus,
        adminUserId,
        reason,
        reviewerNotes,
      });

      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === "assign") {
      const updated = await db.strategistProfile.update({
        where: { id: strategistProfileId },
        data: {
          assignedReviewerId: reviewerId || adminUserId,
          status: "IN_REVIEW",
        },
      });

      await db.auditLog.create({
        data: {
          userId: adminUserId,
          action: "VETTING_ASSIGNED",
          entityType: "StrategistProfile",
          entityId: strategistProfileId,
          metadata: { assignedTo: reviewerId || adminUserId },
        },
      });

      return NextResponse.json({ success: true, profile: updated });
    }

    if (action === "override_score") {
      const updated = await overrideAttemptScore({
        attemptId,
        adminUserId,
        manualScore,
        overrideNotes,
      });

      return NextResponse.json({ success: true, attempt: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Admin Vetting POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
