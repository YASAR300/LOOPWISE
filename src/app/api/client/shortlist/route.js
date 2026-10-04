import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const member = await db.orgMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!member) {
      return NextResponse.json({ shortlists: [] });
    }

    const shortlists = await db.shortlist.findMany({
      where: { organizationId: member.organizationId },
      include: {
        brief: {
          select: { id: true, title: true, status: true },
        },
        items: {
          orderBy: { rank: "asc" },
          include: {
            strategistProfile: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true },
                },
                skills: {
                  include: { skill: true },
                },
                specializations: {
                  include: { specialization: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ shortlists });
  } catch (error) {
    console.error("[Get Shortlist Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
