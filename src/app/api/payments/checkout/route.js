// src/app/api/payments/checkout/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createMilestoneCheckoutSession,
  createRetainerCheckoutSession,
  createHourlyPrefundCheckoutSession,
} from "@/server/services/stripe";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await db.orgMember.findFirst({
      where: { userId: user.id },
    });

    if (!membership?.organizationId) {
      return NextResponse.json(
        { error: "Forbidden: No client organization found" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, milestoneId, invoiceId, engagementId, hours } = body;
    const origin = request.nextUrl.origin;

    if (type === "MILESTONE") {
      if (!milestoneId) {
        return NextResponse.json(
          { error: "milestoneId is required" },
          { status: 400 }
        );
      }
      const result = await createMilestoneCheckoutSession({
        milestoneId,
        organizationId: membership.organizationId,
        user,
        origin,
      });
      return NextResponse.json(result);
    }

    if (type === "RETAINER") {
      if (!invoiceId) {
        return NextResponse.json(
          { error: "invoiceId is required" },
          { status: 400 }
        );
      }
      const result = await createRetainerCheckoutSession({
        invoiceId,
        organizationId: membership.organizationId,
        user,
        origin,
      });
      return NextResponse.json(result);
    }

    if (type === "HOURLY_PREFUND") {
      if (!engagementId) {
        return NextResponse.json(
          { error: "engagementId is required" },
          { status: 400 }
        );
      }
      const result = await createHourlyPrefundCheckoutSession({
        engagementId,
        hours: hours || 10,
        organizationId: membership.organizationId,
        user,
        origin,
      });
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid payment type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Payments Checkout Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
