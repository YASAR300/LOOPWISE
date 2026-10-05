// src/app/api/strategist/payouts/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/server/services/stripe";
import {
  getStrategistPayableBalance,
  recordPayout,
} from "@/server/services/ledger";

export const dynamic = "force-dynamic";

const MINIMUM_PAYOUT_CENTS = 5000; // $50.00 minimum withdrawal threshold

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.strategistProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile)
      return NextResponse.json(
        { error: "Strategist profile not found" },
        { status: 404 }
      );

    const balanceInfo = await getStrategistPayableBalance(profile.id);

    const payouts = await db.payout.findMany({
      where: { strategistProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      balanceCents: balanceInfo.balanceCents,
      balanceFormatted: balanceInfo.balanceFormatted,
      minimumThresholdCents: MINIMUM_PAYOUT_CENTS,
      minimumThresholdFormatted: "$50.00",
      stripeAccountId: profile.stripeAccountId,
      stripeOnboarded: profile.stripeOnboarded,
      payouts,
    });
  } catch (error) {
    console.error("[Payouts GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.strategistProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!profile)
      return NextResponse.json(
        { error: "Strategist profile not found" },
        { status: 404 }
      );

    if (!profile.stripeOnboarded || !profile.stripeAccountId) {
      return NextResponse.json(
        {
          error:
            "Stripe Connect account must be connected and verified before withdrawing funds.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const requestedAmountCents = Math.round(Number(body.amountCents) || 0);

    if (requestedAmountCents < MINIMUM_PAYOUT_CENTS) {
      return NextResponse.json(
        {
          error: `Minimum withdrawal amount is $50.00 (requested: $${(requestedAmountCents / 100).toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // Server-side balance recomputation from immutable ledger
    const balanceInfo = await getStrategistPayableBalance(profile.id);

    if (requestedAmountCents > balanceInfo.balanceCents) {
      return NextResponse.json(
        {
          error: `Insufficient payable balance. Available: ${balanceInfo.balanceFormatted}`,
        },
        { status: 400 }
      );
    }

    // 1. Create Payout record in PENDING state
    const payout = await db.payout.create({
      data: {
        strategistProfileId: profile.id,
        amount: requestedAmountCents / 100,
        currency: "USD",
        status: "PROCESSING",
      },
    });

    let stripeTransferId = `tr_test_${payout.id.slice(-8)}`;

    // 2. Execute Stripe Connect transfer
    if (
      process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes("mock") &&
      !profile.stripeAccountId.startsWith("acct_test")
    ) {
      try {
        const transfer = await stripe.transfers.create({
          amount: requestedAmountCents,
          currency: "usd",
          destination: profile.stripeAccountId,
          description: `Loopwise earnings payout - ${profile.user.name}`,
          metadata: {
            payoutId: payout.id,
            strategistProfileId: profile.id,
          },
        });
        stripeTransferId = transfer.id;
      } catch (stripeErr) {
        console.error("[Stripe Transfer Error]:", stripeErr);
        await db.payout.update({
          where: { id: payout.id },
          data: {
            status: "FAILED",
            failureReason: stripeErr.message,
          },
        });
        return NextResponse.json(
          { error: `Stripe transfer failed: ${stripeErr.message}` },
          { status: 502 }
        );
      }
    }

    // 3. Record Payout in double-entry ledger (DEBIT STRATEGIST_PAYABLE, CREDIT PAYOUTS)
    await recordPayout({
      payoutId: payout.id,
      strategistProfileId: profile.id,
      amountCents: requestedAmountCents,
      stripeTransferId,
      idempotencyKey: `payout_withdraw_${payout.id}`,
    });

    // 4. Update payout status to PAID
    const updatedPayout = await db.payout.update({
      where: { id: payout.id },
      data: {
        status: "PAID",
        stripeTransferId,
      },
    });

    // 5. Notify strategist
    await db.notification.create({
      data: {
        userId: user.id,
        type: "INVOICE",
        title: "Payout Sent via Stripe Connect",
        body: `Your withdrawal of $${(requestedAmountCents / 100).toLocaleString()} has been transferred to your connected bank account.`,
        actionUrl: `/strategist/earnings`,
      },
    });

    const newBalance = await getStrategistPayableBalance(profile.id);

    return NextResponse.json({
      success: true,
      payout: updatedPayout,
      newBalanceFormatted: newBalance.balanceFormatted,
    });
  } catch (error) {
    console.error("[Payout POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
