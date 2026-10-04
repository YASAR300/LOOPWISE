// src/app/api/contracts/[id]/accept/route.js
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
    const { typedName, agreeCheckbox } = body;

    if (!agreeCheckbox || !typedName?.trim()) {
      return NextResponse.json(
        { error: "Must confirm agreement and provide full legal typed name." },
        { status: 400 }
      );
    }

    const contract = await db.contract.findUnique({
      where: { id },
      include: {
        engagement: {
          include: {
            organization: true,
            strategistProfile: { include: { user: true } },
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

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent =
      request.headers.get("user-agent") || "Loopwise Platform Browser";
    const now = new Date();

    const updateData = {};

    if (isStrategist) {
      updateData.strategistSignedName = typedName.trim();
      updateData.strategistSignedAt = now;
      updateData.strategistSignedIp = ipAddress;
      updateData.strategistSignedUserAgent = userAgent;
      updateData.signedByStrategistAt = now;
    } else {
      updateData.clientSignedName = typedName.trim();
      updateData.clientSignedAt = now;
      updateData.clientSignedIp = ipAddress;
      updateData.clientSignedUserAgent = userAgent;
      updateData.signedByClientAt = now;
    }

    // Determine if both parties are now signed
    const willBeClientSigned = Boolean(
      updateData.signedByClientAt || contract.signedByClientAt
    );
    const willBeStrategistSigned = Boolean(
      updateData.signedByStrategistAt || contract.signedByStrategistAt
    );

    let bothSigned = willBeClientSigned && willBeStrategistSigned;

    if (bothSigned) {
      updateData.status = "ACTIVE";
      updateData.pdfSnapshotUrl = `/api/contracts/${id}/pdf`;
    } else {
      updateData.status = "SENT";
    }

    const updatedContract = await db.contract.update({
      where: { id },
      data: updateData,
      include: {
        engagement: {
          include: {
            organization: true,
            strategistProfile: { include: { user: true } },
          },
        },
      },
    });

    // If both signed, activate the engagement
    if (bothSigned) {
      await db.engagement.update({
        where: { id: contract.engagementId },
        data: {
          status: "ACTIVE",
          startDate: contract.startDate || now,
        },
      });

      // Emit notifications
      const clientMember = await db.orgMember.findFirst({
        where: { organizationId: contract.engagement.organizationId },
      });

      if (clientMember?.userId) {
        await db.notification.create({
          data: {
            userId: clientMember.userId,
            type: "ENGAGEMENT",
            title: "Engagement Agreement Fully Executed!",
            body: `All parties have electronically signed. Workspace is now ACTIVE with ${contract.engagement.strategistProfile.user?.name}.`,
            actionUrl: `/client/engagements/${contract.engagementId}`,
          },
        });
      }

      if (contract.engagement.strategistProfile.userId) {
        await db.notification.create({
          data: {
            userId: contract.engagement.strategistProfile.userId,
            type: "ENGAGEMENT",
            title: "Engagement Agreement Fully Executed!",
            body: `Agreement is active. You can now log time, map deliverables, and publish cadence updates.`,
            actionUrl: `/strategist/engagements/${contract.engagementId}`,
          },
        });
      }

      // Log activity event
      await db.activityEvent.create({
        data: {
          engagementId: contract.engagementId,
          actorId: user.id,
          type: "ENGAGEMENT_ACTIVATED",
          title: "Contract fully executed by both parties. Engagement active.",
          metadata: {
            clientSignedAt: updatedContract.clientSignedAt,
            strategistSignedAt: updatedContract.strategistSignedAt,
          },
        },
      });
    } else {
      // Notify other party that signature was recorded
      const recipientId = isStrategist
        ? (
            await db.orgMember.findFirst({
              where: { organizationId: contract.engagement.organizationId },
            })
          )?.userId
        : contract.engagement.strategistProfile.userId;

      if (recipientId) {
        await db.notification.create({
          data: {
            userId: recipientId,
            type: "ENGAGEMENT",
            title: "Contract E-Signed",
            body: `${user.name || "A collaborator"} has signed the agreement. Awaiting your counter-signature to activate.`,
            actionUrl: isStrategist
              ? `/client/engagements/${contract.engagementId}`
              : `/strategist/engagements/${contract.engagementId}`,
          },
        });
      }

      await db.activityEvent.create({
        data: {
          engagementId: contract.engagementId,
          actorId: user.id,
          type: "CONTRACT_SIGNED",
          title: `${isStrategist ? "Strategist" : "Client"} electronically signed the contract`,
          metadata: {
            signerName: typedName,
            role: isStrategist ? "STRATEGIST" : "CLIENT",
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      bothSigned,
      contract: updatedContract,
    });
  } catch (error) {
    console.error("[Accept Contract Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
