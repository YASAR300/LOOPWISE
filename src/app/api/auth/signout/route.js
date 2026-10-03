// src/app/api/auth/signout/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { logSignOut } from "@/lib/audit";

async function handleSignOut(request) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (user) {
    await logSignOut(user.id).catch(() => null);
  }

  await supabase.auth.signOut();

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/login`);
}

export async function POST(request) {
  return handleSignOut(request);
}

export async function GET(request) {
  return handleSignOut(request);
}
