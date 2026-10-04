// src/app/api/engagements/[id]/deliverables/[deliverableId]/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, deliverableId } = await params;
    const body = await request.json();
    const {
      stage,
      order,
      checklist,
      clientApprovalStatus,
      clientFeedback,
      title,
      description,
      dueDate,
    } = body;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: {
        strategistProfile: true,
        organization: true,
      },
    });

    if (!engagement) {
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );
    }

    if (["COMPLETED", "TERMINATED"].includes(engagement.status)) {
      return NextResponse.json(
        { error: "Engagement is closed. Edits are frozen." },
        { status: 400 }
      );
    }

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deliverable = await db.deliverable.findUnique({
      where: { id: deliverableId },
    });

    if (!deliverable || deliverable.engagementId !== id) {
      return NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 }
      );
    }

    const updateData = {};
    if (stage !== undefined) updateData.stage = stage;
    if (order !== undefined) updateData.order = order;
    if (checklist !== undefined) updateData.checklist = checklist;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;

    // Client approval actions
    if (clientApprovalStatus !== undefined) {
      if (!isOrgMember && user.role !== "ADMIN") {
        return NextResponse.json(
          {
            error: "Only client can approve or request changes on deliverables",
          },
          { status: 403 }
        );
      }
      updateData.clientApprovalStatus = clientApprovalStatus;
      if (clientFeedback !== undefined)
        updateData.clientFeedback = clientFeedback;

      if (clientApprovalStatus === "APPROVED") {
        updateData.stage = "APPROVED";
      } else if (clientApprovalStatus === "CHANGES_REQUESTED") {
        updateData.stage = "IN_PROGRESS";
      }
    }

    const updated = await db.deliverable.update({
      where: { id: deliverableId },
      data: updateData,
    });

    // Notify on status transition or review
    if (stage === "IN_REVIEW" && isStrategist) {
      const client = await db.orgMember.findFirst({
        where: { organizationId: engagement.organizationId },
      });
      if (client?.userId) {
        await db.notification.create({
          data: {
            userId: client.userId,
            type: "ENGAGEMENT",
            title: "Deliverable Ready for Review",
            body: `Strategist submitted "${deliverable.title}" for client approval.`,
            actionUrl: `/client/engagements/${id}?tab=deliverables`,
          },
        });
      }
    }

    if (clientApprovalStatus && isOrgMember) {
      if (engagement.strategistProfile.userId) {
        await db.notification.create({
          data: {
            userId: engagement.strategistProfile.userId,
            type: "ENGAGEMENT",
            title:
              clientApprovalStatus === "APPROVED"
                ? "Deliverable Approved! 🎉"
                : "Changes Requested on Deliverable",
            body: `Client responded to "${deliverable.title}": ${clientFeedback || clientApprovalStatus}`,
            actionUrl: `/strategist/engagements/${id}?tab=deliverables`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, deliverable: updated });
  } catch (error) {
    console.error("[Update Deliverable Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, deliverableId } = await params;

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: { strategistProfile: true },
    });

    if (!engagement)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (["COMPLETED", "TERMINATED"].includes(engagement.status)) {
      return NextResponse.json(
        { error: "Engagement is closed" },
        { status: 400 }
      );
    }

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.deliverable.delete({
      where: { id: deliverableId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
