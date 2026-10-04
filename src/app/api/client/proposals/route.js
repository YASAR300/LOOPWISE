import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/client/proposals
 * Client proposal inbox
 */
export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await db.orgMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!member) return NextResponse.json({ proposals: [], jobs: [] });

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");

    const where = {
      job: {
        organizationId: member.organizationId,
      },
    };

    if (jobId && jobId !== "ALL") {
      where.jobId = jobId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const proposals = await db.proposal.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            model: true,
            budget: true,
            briefId: true,
          },
        },
        strategistProfile: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also get all jobs for the filter dropdown
    const clientJobs = await db.job.findMany({
      where: { organizationId: member.organizationId },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });

    // Fetch match results for quick score display
    const briefIds = Array.from(
      new Set(proposals.map((p) => p.job.briefId).filter(Boolean))
    );
    const matchScores = await db.matchResult.findMany({
      where: { briefId: { in: briefIds } },
      select: { briefId: true, strategistProfileId: true, score: true },
    });

    const scoreMap = new Map(
      matchScores.map((m) => [`${m.briefId}_${m.strategistProfileId}`, m.score])
    );

    const formattedProposals = proposals.map((p) => {
      const matchScore =
        scoreMap.get(`${p.job.briefId}_${p.strategistProfileId}`) || null;
      return {
        id: p.id,
        jobId: p.jobId,
        jobTitle: p.job.title,
        proposedRate: p.proposedRate,
        proposedModel: p.proposedModel,
        hoursPerWeek: p.hoursPerWeek,
        status: p.status,
        createdAt: p.createdAt,
        viewedAt: p.viewedAt,
        matchScore,
        strategist: {
          id: p.strategistProfile.id,
          name: p.strategistProfile.user?.name || "Strategist",
          headline: p.strategistProfile.headline,
          image: p.strategistProfile.user?.image,
          ratingAvg: p.strategistProfile.ratingAvg,
          ratingCount: p.strategistProfile.ratingCount,
          skills: p.strategistProfile.skills
            .map((s) => s.skill.name)
            .slice(0, 4),
        },
      };
    });

    return NextResponse.json({
      proposals: formattedProposals,
      jobs: clientJobs,
    });
  } catch (error) {
    console.error("[Get Client Proposals Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
