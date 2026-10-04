// src/app/api/contracts/[id]/comment/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment text is required" },
        { status: 400 }
      );
    }

    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        engagement: {
          include: {
            organization: true,
            strategistProfile: true,
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

    const isStrategist =
      contract.engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: {
        organizationId: contract.engagement.organizationId,
        userId: user.id,
      },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const comment = await db.contractComment.create({
      data: {
        contractId: id,
        authorId: user.id,
        authorRole: isStrategist ? "STRATEGIST" : "CLIENT",
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("[Comment Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
