// src/app/api/engagements/[id]/files/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { name, fileUrl, fileSize, fileType, deliverableId } = body;

    if (!name?.trim() || !fileUrl) {
      return NextResponse.json(
        { error: "File name and URL are required" },
        { status: 400 }
      );
    }

    const engagement = await db.engagement.findUnique({
      where: { id },
      include: { strategistProfile: true },
    });

    if (!engagement)
      return NextResponse.json(
        { error: "Engagement not found" },
        { status: 404 }
      );

    const isStrategist = engagement.strategistProfile.userId === user.id;
    const isOrgMember = await db.orgMember.findFirst({
      where: { organizationId: engagement.organizationId, userId: user.id },
    });

    if (!isStrategist && !isOrgMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check existing version count with this name
    const existingCount = await db.engagementFile.count({
      where: { engagementId: id, name: name.trim() },
    });

    const file = await db.engagementFile.create({
      data: {
        engagementId: id,
        deliverableId: deliverableId || null,
        name: name.trim(),
        fileUrl,
        fileSize: fileSize || 0,
        fileType: fileType || "application/octet-stream",
        version: existingCount + 1,
        uploadedById: user.id,
      },
    });

    // Log ActivityEvent
    await db.activityEvent.create({
      data: {
        engagementId: id,
        actorId: user.id,
        type: "FILE_UPLOADED",
        title: `Uploaded document: "${name.trim()}" (v${file.version})`,
        metadata: { fileId: file.id, version: file.version },
      },
    });

    return NextResponse.json({ success: true, file });
  } catch (error) {
    console.error("[Upload File Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
