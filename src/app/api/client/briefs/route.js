import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await db.orgMember.findFirst({
      where: { userId: user.id },
    });

    if (!membership?.organizationId) {
      return NextResponse.json({ briefs: [] });
    }

    const briefs = await db.brief.findMany({
      where: {
        organizationId: membership.organizationId,
        deletedAt: null,
      },
      include: {
        workflows: {
          select: {
            id: true,
            name: true,
            automatabilityScore: true,
            businessImpactHours: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ briefs });
  } catch (error) {
    console.error("[Briefs GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let membership = await db.orgMember.findFirst({
      where: { userId: user.id },
    });

    let orgId = membership?.organizationId;

    if (!orgId) {
      const defaultOrg = await db.organization.create({
        data: {
          name: `${user.name || "Client"}'s Team`,
          slug: `org-${user.id.slice(-6)}-${Date.now().toString().slice(-4)}`,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });
      orgId = defaultOrg.id;
    }

    const body = await request.json().catch(() => ({}));

    const newBrief = await db.brief.create({
      data: {
        organizationId: orgId,
        createdById: user.id,
        title: body.title || "Untitled Automation Brief",
        problemDescription: body.problemDescription || "",
        goal: body.goal || "reduce_support_load",
        teamSize: body.teamSize || "11-50",
        currentTools: body.currentTools || [],
        targetOutcomes: body.targetOutcomes || "",
        budgetMin: body.budgetMin || 5000,
        budgetMax: body.budgetMax || 12000,
        preferredModel: body.preferredModel || "RETAINER",
        timeline: body.timeline || "Immediate (next 2 weeks)",
        hoursPerWeek: body.hoursPerWeek || 20,
        requiredSkills: body.requiredSkills || [],
        complianceNeeds: body.complianceNeeds || [],
        timezonePref: body.timezonePref || "Any",
        isNdaRequired: Boolean(body.isNdaRequired),
        status: "DRAFT",
      },
    });

    await writeAuditLog({
      userId: user.id,
      action: "BRIEF_CREATED",
      entityType: "Brief",
      entityId: newBrief.id,
      metadata: { title: newBrief.title },
    });

    return NextResponse.json({ brief: newBrief });
  } catch (error) {
    console.error("[Briefs POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
