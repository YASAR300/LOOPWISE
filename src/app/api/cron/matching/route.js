import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndPersistMatchesForBrief } from "@/server/services/matching";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint to process pending matching jobs
 * Protected by CRON_SECRET authorization header or query param
 */
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  const expectedSecret =
    process.env.CRON_SECRET || "loopwise-cron-secret-local";

  if (
    authHeader !== `Bearer ${expectedSecret}` &&
    secretParam !== expectedSecret &&
    process.env.NODE_ENV === "production"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch pending matching queue jobs
    const pendingJobs = await db.matchingQueue.findMany({
      where: { status: "PENDING" },
      take: 10,
      orderBy: { createdAt: "asc" },
    });

    const processed = [];
    const errors = [];

    for (const job of pendingJobs) {
      try {
        await db.matchingQueue.update({
          where: { id: job.id },
          data: { status: "PROCESSING", attempts: { increment: 1 } },
        });

        await calculateAndPersistMatchesForBrief(job.briefId);
        processed.push(job.briefId);
      } catch (err) {
        console.error(`[Matching Cron Error] brief ${job.briefId}:`, err);
        errors.push({ briefId: job.briefId, error: err.message });
        await db.matchingQueue.update({
          where: { id: job.id },
          data: { status: "FAILED", error: err.message },
        });
      }
    }

    // 2. Also check published briefs without match results
    const uncomputedBriefs = await db.brief.findMany({
      where: {
        status: { in: ["PUBLISHED", "MATCHING"] },
        matchResults: { none: {} },
      },
      take: 5,
    });

    for (const b of uncomputedBriefs) {
      try {
        await calculateAndPersistMatchesForBrief(b.id);
        processed.push(b.id);
      } catch (err) {
        console.error(`[Matching Cron Uncomputed Brief Error] ${b.id}:`, err);
        errors.push({ briefId: b.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: processed.length,
      processedBriefIds: processed,
      errors,
    });
  } catch (error) {
    console.error("[Matching Cron Fatal Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
