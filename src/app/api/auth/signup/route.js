// src/app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { rateLimitRequest } from "@/lib/rate-limit";

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  name: z.string().min(1, "Name is required").max(100),
  role: z.enum(["CLIENT", "STRATEGIST"], {
    errorMap: () => ({ message: "Role must be CLIENT or STRATEGIST" }),
  }),
});

export async function POST(request) {
  // Rate limit: 5 signups per 15 min per IP
  const rl = await rateLimitRequest(request, {
    key: "signup",
    endpoint: "POST /api/auth/signup",
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.success) return rl.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 422 }
    );
  }

  const { email, password, name, role } = parsed.data;

  // Check if email already exists in Prisma
  const existing = await db.user.findUnique({ where: { email } });
  if (existing && !existing.deletedAt) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: `${appUrl}/api/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Create Prisma user record immediately (pre-verification)
  if (data.user) {
    const prismaUser = existing
      ? await db.user.update({
          where: { id: existing.id },
          data: { name, role, deletedAt: null },
        })
      : await db.user.create({
          data: { email, name, role },
        });

    // Default notification prefs
    await db.notificationPreference
      .upsert({
        where: { userId: prismaUser.id },
        create: { userId: prismaUser.id },
        update: {},
      })
      .catch(() => null);
  }

  return NextResponse.json({
    success: true,
    message:
      "Account created. Check your email to verify your address before logging in.",
  });
}
