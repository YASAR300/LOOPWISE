import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: jobId } = await params;

    const profile = await db.strategistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile)
      return NextResponse.json(
        { error: "Strategist profile not found" },
        { status: 404 }
      );

    const existing = await db.savedJob.findUnique({
      where: {
        strategistProfileId_jobId: {
          strategistProfileId: profile.id,
          jobId,
        },
      },
    });

    if (existing) {
      await db.savedJob.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ saved: false });
    } else {
      await db.savedJob.create({
        data: {
          strategistProfileId: profile.id,
          jobId,
        },
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("[Save Job Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
