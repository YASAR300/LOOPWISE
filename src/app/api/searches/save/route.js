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
    const { name, filters } = body || {};

    if (!name || !filters) {
      return NextResponse.json(
        { error: "Name and filters are required." },
        { status: 400 }
      );
    }

    const dbUser = await db.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const savedSearch = await db.savedSearch.create({
      data: {
        userId: dbUser.id,
        name,
        filters,
      },
    });

    return NextResponse.json({
      success: true,
      id: savedSearch.id,
      message: "Search saved successfully.",
    });
  } catch (error) {
    console.error("Error saving search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
