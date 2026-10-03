import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const introSchema = z.object({
  strategistProfileId: z.string().min(1),
  requestedDate: z.string().optional(),
  notes: z.string().max(1000).optional().default(""),
});

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required to request an introduction.",
          redirectUrl: "/signup?role=client",
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = introSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 422 }
      );
    }

    const { strategistProfileId, requestedDate, notes } = parsed.data;

    // Find DB user and user's organization
    const dbUser = await db.user.findUnique({
      where: { email: user.email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 }
      );
    }

    // Get user's org, or create a default personal org if none
    let orgId = dbUser.memberships?.[0]?.organizationId;
    if (!orgId) {
      const defaultOrg = await db.organization.create({
        data: {
          name: `${dbUser.name || "Client"}'s Team`,
          slug: `client-org-${Date.now()}`,
          members: {
            create: {
              userId: dbUser.id,
              role: "OWNER",
            },
          },
        },
      });
      orgId = defaultOrg.id;
    }

    const meeting = await db.meetingRequest.create({
      data: {
        organizationId: orgId,
        strategistProfileId,
        requestedDate: requestedDate
          ? new Date(requestedDate)
          : new Date(Date.now() + 48 * 3600 * 1000),
        status: "PENDING",
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      meetingId: meeting.id,
      message:
        "Introduction request submitted! The strategist and Loopwise coordinator have been notified.",
    });
  } catch (error) {
    console.error("Error creating intro meeting request:", error);
    return NextResponse.json(
      { error: "Failed to submit introduction request." },
      { status: 500 }
    );
  }
}
