// src/lib/rate-limit.js
import { db } from "@/lib/db";

/**
 * Rate limiter backed by the RateLimitHit table.
 *
 * @param {Object} opts
 * @param {string} opts.key        Unique key e.g. "login:ip:1.2.3.4"
 * @param {string} opts.endpoint   Endpoint label e.g. "POST /api/auth/login"
 * @param {number} opts.limit      Max hits allowed within windowMs
 * @param {number} opts.windowMs   Window in milliseconds (default: 15 min)
 * @param {string} [opts.ipAddress]
 * @returns {Promise<{ success: boolean; remaining: number; resetAt: Date }>}
 */
export async function rateLimit({
  key,
  endpoint,
  limit,
  windowMs = 15 * 60 * 1000,
  ipAddress = null,
}) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Count hits in the current window
  const count = await db.rateLimitHit.count({
    where: {
      key,
      timestamp: { gte: windowStart },
    },
  });

  const resetAt = new Date(now.getTime() + windowMs);

  if (count >= limit) {
    return { success: false, remaining: 0, resetAt };
  }

  // Record this hit
  await db.rateLimitHit.create({
    data: { key, endpoint, ipAddress, timestamp: now },
  });

  return { success: true, remaining: limit - count - 1, resetAt };
}

/**
 * Rate limit an HTTP request, returning a 429 Response on failure.
 * Usage:
 *   const rl = await rateLimitRequest(req, { ... });
 *   if (!rl.success) return rl.response;
 */
export async function rateLimitRequest(
  request,
  { key, endpoint, limit, windowMs }
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const result = await rateLimit({
    key: `${key}:${ip}`,
    endpoint,
    limit,
    windowMs,
    ipAddress: ip,
  });

  if (!result.success) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: "Too many requests. Please wait before trying again.",
          resetAt: result.resetAt,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(
              Math.ceil((result.resetAt - Date.now()) / 1000)
            ),
          },
        }
      ),
    };
  }

  return { success: true, remaining: result.remaining };
}
