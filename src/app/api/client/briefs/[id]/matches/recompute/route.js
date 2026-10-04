import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateAndPersistMatchesForBrief } from "@/server/services/matching";

export const dynamic = "force-dynamic";

/**
 * POST /api/client/briefs/[id]/matches/recompute
 * On-demand recompute button for matching
 */
export async function POST(request, { params }) {
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

    if (!brief)
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    if (brief.organization.members.length === 0 && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const matches = await calculateAndPersistMatchesForBrief(briefId);

    return NextResponse.json({
      success: true,
      matchCount: matches.length,
      topScore: matches[0]?.score || 0,
    });
  } catch (error) {
    console.error("[Recompute Matches Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
