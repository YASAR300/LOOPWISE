import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        stripeAccountId: true,
        stripeOnboarded: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Optional simulation link for test environment
    if (action === "simulate_complete") {
      const updated = await db.strategistProfile.update({
        where: { id: profile.id },
        data: {
          stripeAccountId:
            profile.stripeAccountId || `acct_test_${profile.id.slice(-8)}`,
          stripeOnboarded: true,
        },
      });

      await writeAuditLog({
        userId: session.user.id,
        action: "STRIPE_CONNECT_ONBOARDED",
        entityType: "StrategistProfile",
        entityId: profile.id,
        metadata: { simulated: true, stripeAccountId: updated.stripeAccountId },
      });

      return NextResponse.redirect(
        new URL("/strategist/dashboard?stripe_connected=1", request.url)
      );
    }

    return NextResponse.json({
      stripeAccountId: profile.stripeAccountId,
      stripeOnboarded: profile.stripeOnboarded,
    });
  } catch (error) {
    console.error("[Stripe Connect GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    let accountId = profile.stripeAccountId;

    if (!accountId) {
      accountId = `acct_express_${profile.id.slice(-8)}`;
      await db.strategistProfile.update({
        where: { id: profile.id },
        data: { stripeAccountId: accountId },
      });
    }

    // In local development or test mode without external stripe network call
    const simulatedOnboardingUrl = `/api/strategist/stripe-connect?action=simulate_complete`;

    return NextResponse.json({
      url: simulatedOnboardingUrl,
      stripeAccountId: accountId,
      stripeOnboarded: profile.stripeOnboarded,
    });
  } catch (error) {
    console.error("[Stripe Connect POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
