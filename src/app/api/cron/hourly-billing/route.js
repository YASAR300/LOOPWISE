// src/app/api/cron/hourly-billing/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateHourlyInvoice } from "@/server/services/invoicing";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Unauthorized cron trigger" },
          { status: 401 }
        );
      }
    }

    const engagements = await db.engagement.findMany({
      where: {
        status: "ACTIVE",
        model: "HOURLY",
        timeEntries: {
          some: {
            billable: true,
            invoiced: false,
            status: "APPROVED",
          },
        },
      },
      select: { id: true, title: true },
    });

    const generated = [];

    for (const eng of engagements) {
      try {
        const inv = await generateHourlyInvoice({ engagementId: eng.id });
        if (inv) {
          generated.push({
            engagementId: eng.id,
            invoiceId: inv.id,
            number: inv.number,
          });
        }
      } catch (err) {
        console.error(`[Hourly Billing Cron Failed for ${eng.id}]:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      eligibleEngagements: engagements.length,
      invoicesGenerated: generated.length,
      generated,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Hourly Billing Cron Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
