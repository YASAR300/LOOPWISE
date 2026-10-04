import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;
    const body = await request.json();
    const { notes, rank } = body;

    const item = await db.shortlistItem.findUnique({
      where: { id: itemId },
      include: {
        shortlist: {
          include: {
            organization: {
              include: {
                members: { where: { userId: user.id } },
              },
            },
          },
        },
      },
    });

    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (
      item.shortlist.organization.members.length === 0 &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const updated = await db.shortlistItem.update({
      where: { id: itemId },
      data: {
        notes: notes !== undefined ? notes : item.notes,
        rank: rank !== undefined ? rank : item.rank,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("[Update Shortlist Item Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;

    const item = await db.shortlistItem.findUnique({
      where: { id: itemId },
      include: {
        shortlist: {
          include: {
            organization: {
              include: {
                members: { where: { userId: user.id } },
              },
            },
          },
        },
      },
    });

    if (!item)
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    if (
      item.shortlist.organization.members.length === 0 &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await db.shortlistItem.delete({ where: { id: itemId } });

    // Also update matchResult isShortlisted
    if (item.shortlist.briefId) {
      await db.matchResult.updateMany({
        where: {
          briefId: item.shortlist.briefId,
          strategistProfileId: item.strategistProfileId,
        },
        data: { isShortlisted: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete Shortlist Item Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
