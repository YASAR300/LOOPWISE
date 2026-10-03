// src/app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { rateLimitRequest } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request) {
  // Rate limit: 3 requests per 15 min
  const rl = await rateLimitRequest(request, {
    key: "forgot-password",
    endpoint: "POST /api/auth/forgot-password",
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.success) return rl.response;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 422 }
    );
  }

  const { email } = parsed.data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`,
  });

  if (error) {
    console.error("[Forgot Password] Supabase error:", error.message);
  }

  // Audit log if user exists in DB
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    await writeAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      entityType: "User",
      entityId: user.id,
      metadata: { ip: request.headers.get("x-forwarded-for") || "unknown" },
    }).catch(() => null);
  }

  // Prevent email enumeration
  return NextResponse.json({
    success: true,
    message:
      "If an account exists with this email, a password reset link has been sent.",
  });
}
