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
        workflows: true,
        organization: true,
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    // Validation checklist
    const errors = [];
    if (!brief.title || brief.title.trim().length < 5) {
      errors.push("Brief title must be at least 5 characters long");
    }
    if (
      !brief.problemDescription ||
      brief.problemDescription.trim().length < 20
    ) {
      errors.push(
        "Problem description must detail workflow objectives (min 20 chars)"
      );
    }
    if (!brief.budgetMin || !brief.budgetMax || brief.budgetMin <= 0) {
      errors.push("Please set a valid budget band (min and max)");
    }
    if (
      brief.budgetMin &&
      brief.budgetMax &&
      brief.budgetMin > brief.budgetMax
    ) {
      errors.push("Minimum budget cannot exceed maximum budget");
    }
    if (!brief.timeline) {
      errors.push("Target timeline is required");
    }
    const skills = Array.isArray(brief.requiredSkills)
      ? brief.requiredSkills
      : [];
    if (skills.length === 0) {
      errors.push("Select at least 1 required technical skill or framework");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed before publishing",
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Transition brief status to PUBLISHED
    const updated = await db.brief.update({
      where: { id },
      data: {
        status: "PUBLISHED",
      },
    });

    // Create or update corresponding Job listing for matching feed (Prompt 6)
    const existingJob = await db.job.findFirst({
      where: { briefId: id },
    });

    if (!existingJob) {
      await db.job.create({
        data: {
          organizationId: brief.organizationId,
          briefId: brief.id,
          title: brief.title,
          description: brief.problemDescription,
          model: brief.preferredModel || "RETAINER",
          budget: brief.budgetMax,
          status: "OPEN",
        },
      });
    } else {
      await db.job.update({
        where: { id: existingJob.id },
        data: {
          title: brief.title,
          description: brief.problemDescription,
          model: brief.preferredModel || "RETAINER",
          budget: brief.budgetMax,
          status: "OPEN",
        },
      });
    }

    await writeAuditLog({
      userId: user.id,
      action: "BRIEF_PUBLISHED",
      entityType: "Brief",
      entityId: id,
      metadata: {
        title: brief.title,
        budgetBand: `$${brief.budgetMin}-$${brief.budgetMax}`,
        workflowsCount: brief.workflows.length,
      },
    });

    return NextResponse.json({
      success: true,
      brief: updated,
    });
  } catch (error) {
    console.error("[Brief Publish Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
