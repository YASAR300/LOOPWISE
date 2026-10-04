import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/client/proposals/[id]
 * Fetch full proposal details. Automatically marks status as VIEWED in real-time.
 */
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: proposalId } = await params;

    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
      include: {
        job: {
          include: {
            organization: {
              include: {
                members: { where: { userId: user.id } },
              },
            },
            skills: { include: { skill: true } },
          },
        },
        strategistProfile: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
            skills: { include: { skill: true } },
            caseStudies: true,
          },
        },
      },
    });

    if (!proposal)
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );

    // Tenant check
    if (
      proposal.job.organization.members.length === 0 &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Auto update status to VIEWED if currently SENT
    let currentStatus = proposal.status;
    let viewedAt = proposal.viewedAt;

    if (currentStatus === "SENT") {
      viewedAt = new Date();
      currentStatus = "VIEWED";
      await db.proposal.update({
        where: { id: proposal.id },
        data: { status: "VIEWED", viewedAt },
      });

      // Emit notification for strategist
      if (proposal.strategistProfile.user?.id) {
        await db.notification.create({
          data: {
            userId: proposal.strategistProfile.user.id,
            type: "PROPOSAL_STATUS_CHANGED",
            title: `Proposal Viewed: ${proposal.job.title}`,
            body: `${proposal.job.organization.name} just opened and viewed your proposal.`,
            actionUrl: `/strategist/proposals`,
          },
        });
      }
    }

    // Fetch match result for this brief & strategist
    let matchResult = null;
    if (proposal.job.briefId) {
      matchResult = await db.matchResult.findUnique({
        where: {
          briefId_strategistProfileId: {
            briefId: proposal.job.briefId,
            strategistProfileId: proposal.strategistProfileId,
          },
        },
      });
    }

    return NextResponse.json({
      proposal: {
        id: proposal.id,
        coverLetter: proposal.coverLetter,
        proposedRate: proposal.proposedRate,
        proposedModel: proposal.proposedModel,
        hoursPerWeek: proposal.hoursPerWeek,
        timelineWeeks: proposal.timelineWeeks,
        startDate: proposal.startDate,
        milestones: proposal.milestones,
        attachments: proposal.attachments,
        screeningAnswers: proposal.screeningAnswers,
        status: currentStatus,
        viewedAt,
        createdAt: proposal.createdAt,
        declineReason: proposal.declineReason,
        changeRequestNotes: proposal.changeRequestNotes,
        job: {
          id: proposal.job.id,
          title: proposal.job.title,
          screeningQuestions: proposal.job.screeningQuestions,
        },
        strategist: {
          id: proposal.strategistProfile.id,
          name: proposal.strategistProfile.user?.name,
          email: proposal.strategistProfile.user?.email,
          image: proposal.strategistProfile.user?.image,
          headline: proposal.strategistProfile.headline,
          bio: proposal.strategistProfile.bio,
          hourlyRate: proposal.strategistProfile.hourlyRate,
          retainerRate: proposal.strategistProfile.retainerRate,
          weeklyAvailability: proposal.strategistProfile.weeklyAvailability,
          timezone: proposal.strategistProfile.timezone,
          ratingAvg: proposal.strategistProfile.ratingAvg,
          ratingCount: proposal.strategistProfile.ratingCount,
          skills: proposal.strategistProfile.skills.map((s) => ({
            name: s.skill.name,
            level: s.level,
            verified: s.verified,
          })),
          caseStudies: proposal.strategistProfile.caseStudies,
        },
        matchScore: matchResult?.score || null,
        matchBreakdown: matchResult?.breakdown || null,
        matchExplanation: matchResult?.explanation || null,
      },
    });
  } catch (error) {
    console.error("[Get Proposal Detail Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
