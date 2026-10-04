// src/app/api/contracts/[id]/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        engagement: {
          include: {
            organization: true,
            strategistProfile: {
              include: { user: true },
            },
          },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          include: {
            createdBy: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Tenant check: must be either an org member or the strategist
    const isStrategist =
      contract.engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: {
        organizationId: contract.engagement.organizationId,
        userId: user.id,
      },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: tenant isolation" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      contract,
      userRole: isStrategist ? "STRATEGIST" : "CLIENT",
    });
  } catch (error) {
    console.error("[Contract GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
