import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateAndPersistMatchesForBrief } from "@/server/services/matching";

export const dynamic = "force-dynamic";

/**
 * GET /api/client/briefs/[id]/matches
 * Fetch matches for a brief. Automatically computes matches if none exist.
 */
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: briefId } = await params;

    const brief = await db.brief.findUnique({
      where: { id: briefId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    // Tenant check
    if (brief.organization.members.length === 0 && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch existing matches
    let matches = await db.matchResult.findMany({
      where: {
        briefId,
        isDismissed: false,
      },
      include: {
        strategistProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            skills: {
              include: { skill: true },
            },
            specializations: {
              include: { specialization: true },
            },
            caseStudies: true,
          },
        },
      },
      orderBy: { score: "desc" },
    });

    // If no matches yet, compute them now
    if (matches.length === 0) {
      await calculateAndPersistMatchesForBrief(briefId);
      matches = await db.matchResult.findMany({
        where: {
          briefId,
          isDismissed: false,
        },
        include: {
          strategistProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              skills: {
                include: { skill: true },
              },
              specializations: {
                include: { specialization: true },
              },
              caseStudies: true,
            },
          },
        },
        orderBy: { score: "desc" },
      });
    }

    // Fetch sent invitations for this brief
    const invitations = await db.briefInvitation.findMany({
      where: { briefId },
      select: { strategistProfileId: true, status: true },
    });
    const invitedSet = new Map(
      invitations.map((i) => [i.strategistProfileId, i.status])
    );

    // Format matches
    const formattedMatches = matches.map((m) => ({
      id: m.id,
      score: m.score,
      breakdown: m.breakdown,
      explanation: m.explanation,
      watchOuts: m.watchOuts,
      aiReranked: m.aiReranked,
      isShortlisted: m.isShortlisted,
      invitationStatus: invitedSet.get(m.strategistProfileId) || null,
      strategist: {
        id: m.strategistProfile.id,
        name: m.strategistProfile.user?.name || "Verified Strategist",
        slug: m.strategistProfile.slug,
        headline: m.strategistProfile.headline,
        bio: m.strategistProfile.bio,
        location: m.strategistProfile.location,
        timezone: m.strategistProfile.timezone,
        hourlyRate: m.strategistProfile.hourlyRate,
        retainerRate: m.strategistProfile.retainerRate,
        weeklyAvailability: m.strategistProfile.weeklyAvailability,
        yearsOfExperience: m.strategistProfile.yearsOfExperience,
        ratingAvg: m.strategistProfile.ratingAvg,
        ratingCount: m.strategistProfile.ratingCount,
        image: m.strategistProfile.user?.image,
        skills: m.strategistProfile.skills.map((s) => ({
          name: s.skill?.name,
          level: s.level,
          verified: s.verified,
        })),
        specializations: m.strategistProfile.specializations.map(
          (s) => s.specialization?.name
        ),
        caseStudies: m.strategistProfile.caseStudies.map((cs) => ({
          title: cs.title,
          clientIndustry: cs.clientIndustry,
          outcome: cs.outcome || cs.metricsAchieved,
        })),
      },
    }));

    return NextResponse.json({
      brief: {
        id: brief.id,
        title: brief.title,
        goal: brief.goal,
        status: brief.status,
        budgetMin: brief.budgetMin,
        budgetMax: brief.budgetMax,
        hoursPerWeek: brief.hoursPerWeek,
        requiredSkills: brief.requiredSkills,
        timezonePref: brief.timezonePref,
      },
      matches: formattedMatches,
    });
  } catch (error) {
    console.error("[Get Brief Matches Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
