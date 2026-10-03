import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const invitation = await db.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            industry: true,
            logo: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found", status: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation already accepted", status: "ALREADY_ACCEPTED" },
        { status: 410 }
      );
    }

    if (new Date() > new Date(invitation.expires)) {
      return NextResponse.json(
        { error: "Invitation has expired", status: "EXPIRED" },
        { status: 410 }
      );
    }

    const currentUser = await getCurrentUser();

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires: invitation.expires,
        organization: invitation.organization,
      },
      currentUser: currentUser
        ? {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { token } = await params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "You must be signed in to accept an invitation" },
        { status: 401 }
      );
    }

    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (
      !invitation ||
      invitation.acceptedAt ||
      new Date() > new Date(invitation.expires)
    ) {
      return NextResponse.json(
        { error: "Invitation is invalid or has expired" },
        { status: 400 }
      );
    }

    // Add user as org member
    await db.$transaction([
      db.orgMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: invitation.organizationId,
            userId: currentUser.id,
          },
        },
        create: {
          organizationId: invitation.organizationId,
          userId: currentUser.id,
          role: invitation.role,
        },
        update: {
          role: invitation.role,
        },
      }),
      db.invitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      redirectUrl: `/client/dashboard`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
