// src/app/api/contracts/[id]/negotiate/route.js
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
    const body = await request.json();
    const {
      termsMd,
      scopeOfWork,
      changesSummary = "Updated contract clauses",
    } = body;

    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        engagement: {
          include: {
            organization: true,
            strategistProfile: true,
          },
        },
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
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

    const nextVersionNumber = (contract.versions[0]?.versionNumber || 1) + 1;

    // Reset signatures since terms have changed
    const updatedContract = await db.contract.update({
      where: { id },
      data: {
        termsMd: termsMd || contract.termsMd,
        scopeOfWork: scopeOfWork || contract.scopeOfWork,
        status: "CHANGES_REQUESTED",
        clientSignedName: null,
        clientSignedAt: null,
        clientSignedIp: null,
        clientSignedUserAgent: null,
        strategistSignedName: null,
        strategistSignedAt: null,
        strategistSignedIp: null,
        strategistSignedUserAgent: null,
        signedByClientAt: null,
        signedByStrategistAt: null,
        versions: {
          create: {
            versionNumber: nextVersionNumber,
            termsMd: termsMd || contract.termsMd,
            scopeOfWork: scopeOfWork || contract.scopeOfWork,
            changesSummary,
            createdById: user.id,
          },
        },
      },
      include: {
        versions: { orderBy: { versionNumber: "desc" } },
      },
    });

    // Notify other party
    const targetUserId = isStrategist
      ? (
          await db.orgMember.findFirst({
            where: { organizationId: contract.engagement.organizationId },
          })
        )?.userId
      : contract.engagement.strategistProfile.userId;

    if (targetUserId) {
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: "ENGAGEMENT",
          title: "Contract Amendments Requested",
          body: `${user.name || "A collaborator"} proposed changes (Version ${nextVersionNumber}) to the engagement agreement.`,
          actionUrl: isStrategist
            ? `/client/engagements/${contract.engagementId}`
            : `/strategist/engagements/${contract.engagementId}`,
        },
      });
    }

    // Log activity
    await db.activityEvent.create({
      data: {
        engagementId: contract.engagementId,
        actorId: user.id,
        type: "CONTRACT_AMENDED",
        title: `Contract Version ${nextVersionNumber} drafted`,
        metadata: { changesSummary, versionNumber: nextVersionNumber },
      },
    });

    return NextResponse.json({
      success: true,
      versionNumber: nextVersionNumber,
      contract: updatedContract,
    });
  } catch (error) {
    console.error("[Negotiate Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
