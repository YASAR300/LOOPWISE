// src/app/api/settings/password/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { rateLimitRequest } from "@/lib/rate-limit";
import { logPasswordChange } from "@/lib/audit";

const PasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 password changes per 15 min per user
  const rl = await rateLimitRequest(request, {
    key: `pw-change:${user.id}`,
    endpoint: "POST /api/settings/password",
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

  const parsed = PasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 422 }
    );
  }

  const { password } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logPasswordChange(user.id);

  return NextResponse.json({
    success: true,
    message: "Password updated successfully.",
  });
}
