import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({
      where: { id },
      include: {
        workflows: {
          select: { opportunitySummary: true },
        },
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const summary = brief.opportunitySummary || {};
    const suggestedSkills = summary.suggestedSkills || [];
    const suggestedHours = summary.suggestedWeeklyHours || 20;
    const suggestedGoals = summary.suggestedGoals || [];

    const existingSkills = Array.isArray(brief.requiredSkills)
      ? brief.requiredSkills
      : [];
    const mergedSkills = Array.from(
      new Set([...existingSkills, ...suggestedSkills])
    );

    const outcomesNote =
      suggestedGoals.length > 0
        ? `${brief.targetOutcomes ? brief.targetOutcomes + "\n\n" : ""}AI Automation Objectives:\n` +
          suggestedGoals.map((g) => `- ${g}`).join("\n")
        : brief.targetOutcomes;

    const updated = await db.brief.update({
      where: { id },
      data: {
        requiredSkills: mergedSkills,
        hoursPerWeek: suggestedHours,
        targetOutcomes: outcomesNote,
      },
    });

    await writeAuditLog({
      userId: user.id,
      action: "WORKFLOW_SUGGESTIONS_APPLIED",
      entityType: "Brief",
      entityId: id,
      metadata: {
        appliedSkills: suggestedSkills,
        appliedHours: suggestedHours,
      },
    });

    return NextResponse.json({
      success: true,
      brief: updated,
      applied: {
        skills: mergedSkills,
        hoursPerWeek: suggestedHours,
      },
    });
  } catch (error) {
    console.error("[Apply Suggestions Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
