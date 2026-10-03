import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const { strategistProfileId } = body || {};

    if (!strategistProfileId) {
      return NextResponse.json(
        { error: "strategistProfileId is required." },
        { status: 400 }
      );
    }

    // Find DB user by email
    const dbUser = await db.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User record not found." },
        { status: 404 }
      );
    }

    // Check if already saved
    const existing = await db.savedStrategist.findUnique({
      where: {
        userId_strategistProfileId: {
          userId: dbUser.id,
          strategistProfileId,
        },
      },
    });

    if (existing) {
      // Remove save (toggle off)
      await db.savedStrategist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        saved: false,
        message: "Strategist removed from saved list.",
      });
    } else {
      // Create save (toggle on)
      await db.savedStrategist.create({
        data: {
          userId: dbUser.id,
          strategistProfileId,
        },
      });
      return NextResponse.json({
        saved: true,
        message: "Strategist saved to your shortlist.",
      });
    }
  } catch (error) {
    console.error("Error in saved strategist toggle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
