// src/app/api/cron/retainers/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateRetainerInvoice } from "@/server/services/invoicing";

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

    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find all active retainer engagements
    const engagements = await db.engagement.findMany({
      where: {
        status: "ACTIVE",
        model: "RETAINER",
      },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const generated = [];

    for (const eng of engagements) {
      const lastInvoice = eng.invoices[0];
      // Generate if no previous invoice exists or last invoice was > 28 days ago
      const needsInvoice =
        !lastInvoice || new Date(lastInvoice.createdAt) < thirtyDaysAgo;

      if (needsInvoice) {
        try {
          const inv = await generateRetainerInvoice({ engagementId: eng.id });
          generated.push({
            engagementId: eng.id,
            invoiceId: inv.id,
            number: inv.number,
          });
        } catch (genErr) {
          console.error(`[Retainer Cron Failed for ${eng.id}]:`, genErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      activeRetainersChecked: engagements.length,
      invoicesGenerated: generated.length,
      generated,
      executedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[Retainer Cron Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
