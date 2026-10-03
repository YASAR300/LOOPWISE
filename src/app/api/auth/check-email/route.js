import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimitRequest } from "@/lib/rate-limit";

export async function POST(request) {
  // Rate limit: 20 checks per minute per IP
  const rl = await rateLimitRequest(request, {
    key: "check-email",
    endpoint: "POST /api/auth/check-email",
    limit: 20,
    windowMs: 60 * 1000,
  });
  if (!rl.success) return rl.response;

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ exists: false });
    }

    const normalized = email.trim().toLowerCase();
    const user = await db.user.findUnique({
      where: { email: normalized },
      select: { id: true, deletedAt: true },
    });

    const exists = Boolean(user && !user.deletedAt);
    return NextResponse.json({ exists });
  } catch (error) {
    return NextResponse.json({ exists: false });
  }
}
