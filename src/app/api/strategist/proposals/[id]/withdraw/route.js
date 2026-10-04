import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: proposalId } = await params;

    const profile = await db.strategistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal || proposal.strategistProfileId !== profile.id) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    if (proposal.status === "ACCEPTED") {
      return NextResponse.json(
        { error: "Cannot withdraw an accepted proposal" },
        { status: 400 }
      );
    }

    const updated = await db.proposal.update({
      where: { id: proposalId },
      data: { status: "WITHDRAWN" },
    });

    return NextResponse.json({ success: true, proposal: updated });
  } catch (error) {
    console.error("[Withdraw Proposal Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
