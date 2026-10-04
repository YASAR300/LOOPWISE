import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({
      where: { id },
      include: {
        organization: true,
        workflowSources: {
          orderBy: { createdAt: "desc" },
        },
        workflows: {
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
            },
            source: true,
          },
          orderBy: { createdAt: "desc" },
        },
        jobs: true,
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    // Verify membership
    const isMember = await db.orgMember.findFirst({
      where: {
        organizationId: brief.organizationId,
        userId: user.id,
      },
    });

    if (!isMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ brief });
  } catch (error) {
    console.error("[Brief GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({
      where: { id },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const isMember = await db.orgMember.findFirst({
      where: {
        organizationId: brief.organizationId,
        userId: user.id,
      },
    });

    if (!isMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const allowedKeys = [
      "title",
      "problemDescription",
      "goal",
      "teamSize",
      "currentTools",
      "targetOutcomes",
      "budgetMin",
      "budgetMax",
      "preferredModel",
      "timeline",
      "hoursPerWeek",
      "requiredSkills",
      "complianceNeeds",
      "timezonePref",
      "isNdaRequired",
      "opportunitySummary",
      "status",
    ];

    const updateData = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        if (
          key === "budgetMin" ||
          key === "budgetMax" ||
          key === "hoursPerWeek"
        ) {
          updateData[key] = body[key] !== null ? Number(body[key]) : null;
        } else if (key === "isNdaRequired") {
          updateData[key] = Boolean(body[key]);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    const updated = await db.brief.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, brief: updated });
  } catch (error) {
    console.error("[Brief PATCH Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brief = await db.brief.findUnique({ where: { id } });
    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    await db.brief.update({
      where: { id },
      data: { deletedAt: new Date(), status: "ARCHIVED" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Brief DELETE Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
