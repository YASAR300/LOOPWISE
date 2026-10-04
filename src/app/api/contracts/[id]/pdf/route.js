// src/app/api/contracts/[id]/pdf/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateContractPdfBuffer } from "@/server/services/pdf-service";

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
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    // Verify tenant
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

    const pdfBuffer = await generateContractPdfBuffer(
      contract,
      contract.engagement
    );

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Loopwise_Contract_${contract.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Contract PDF Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
