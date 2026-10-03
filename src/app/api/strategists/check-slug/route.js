import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim().toLowerCase();

    if (!slug || slug.length < 3) {
      return NextResponse.json({
        available: false,
        message: "Slug must be at least 3 characters",
      });
    }

    const session = await getSession();
    const currentUserId = session?.user?.id;

    const existing = await db.strategistProfile.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    });

    if (!existing) {
      return NextResponse.json({ available: true });
    }

    if (currentUserId && existing.userId === currentUserId) {
      return NextResponse.json({ available: true, isCurrent: true });
    }

    return NextResponse.json({ available: false, message: "Already in use" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
