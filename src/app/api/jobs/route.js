import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/jobs
 * Public jobs board & strategist job explorer
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const model = searchParams.get("model") || "ALL";
    const skill = searchParams.get("skill") || "";
    const minBudget = searchParams.get("minBudget")
      ? parseFloat(searchParams.get("minBudget"))
      : null;
    const maxBudget = searchParams.get("maxBudget")
      ? parseFloat(searchParams.get("maxBudget"))
      : null;

    let user = null;
    let strategistProfile = null;
    try {
      user = await getCurrentUser();
      if (user?.role === "STRATEGIST") {
        strategistProfile = await db.strategistProfile.findUnique({
          where: { userId: user.id },
          include: { savedJobs: true, proposals: true },
        });
      }
    } catch {
      // Unauthenticated visitor is allowed for public board
    }

    const where = {
      isPublic: true,
      status: "OPEN",
    };

    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (model && model !== "ALL") {
      where.model = model;
    }

    if (minBudget !== null) {
      where.budget = { gte: minBudget };
    }
    if (maxBudget !== null) {
      where.budget = { ...(where.budget || {}), lte: maxBudget };
    }

    const jobs = await db.job.findMany({
      where,
      include: {
        organization: {
          select: { id: true, name: true, logo: true, industry: true },
        },
        skills: {
          include: { skill: true },
        },
        _count: {
          select: { proposals: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Check saved jobs and applied jobs for strategist
    const savedJobIds = new Set(
      (strategistProfile?.savedJobs || []).map((s) => s.jobId)
    );
    const appliedJobIds = new Set(
      (strategistProfile?.proposals || []).map((p) => p.jobId)
    );

    const formattedJobs = jobs.map((j) => {
      const skillsList = j.skills.map((s) => s.skill.name);
      return {
        id: j.id,
        briefId: j.briefId,
        title: j.title,
        description: j.description,
        model: j.model,
        budget: j.budget,
        hoursPerWeek: j.hoursPerWeek,
        timeline: j.timeline,
        timezonePref: j.timezonePref,
        screeningQuestions: j.screeningQuestions,
        createdAt: j.createdAt,
        organization: j.organization,
        skills: skillsList,
        proposalsCount: j._count.proposals,
        isSaved: savedJobIds.has(j.id),
        hasApplied: appliedJobIds.has(j.id),
      };
    });

    // Filter by skill if requested
    const filteredJobs = skill
      ? formattedJobs.filter((j) =>
          j.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
        )
      : formattedJobs;

    return NextResponse.json({ jobs: filteredJobs });
  } catch (error) {
    console.error("[Get Jobs Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
