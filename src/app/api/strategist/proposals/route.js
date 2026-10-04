import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/strategist/proposals
 * Returns all proposals submitted by the current strategist
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.strategistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) return NextResponse.json({ proposals: [] });

    const proposals = await db.proposal.findMany({
      where: { strategistProfileId: profile.id },
      include: {
        job: {
          include: {
            organization: {
              select: { id: true, name: true, logo: true, industry: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      proposals: proposals.map((p) => ({
        id: p.id,
        jobId: p.jobId,
        jobTitle: p.job.title,
        organizationName: p.job.organization.name,
        organizationLogo: p.job.organization.logo,
        proposedRate: p.proposedRate,
        proposedModel: p.proposedModel,
        hoursPerWeek: p.hoursPerWeek,
        status: p.status,
        viewedAt: p.viewedAt,
        declineReason: p.declineReason,
        changeRequestNotes: p.changeRequestNotes,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Get Strategist Proposals Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
