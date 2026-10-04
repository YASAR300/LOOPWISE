import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id: jobId } = await params;

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
            website: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        brief: {
          select: {
            id: true,
            title: true,
            problemDescription: true,
            targetOutcomes: true,
            goal: true,
            timeline: true,
            isNdaRequired: true,
          },
        },
      },
    });

    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({
      job: {
        ...job,
        skills: job.skills.map((s) => s.skill.name),
      },
    });
  } catch (error) {
    console.error("[Get Job Detail Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
