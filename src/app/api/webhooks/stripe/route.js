// src/app/api/webhooks/stripe/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/server/services/stripe";
import { db } from "@/lib/db";
import {
  recordMilestoneFunding,
  recordRetainerPayment,
  recordRefund,
  LEDGER_ACCOUNTS,
  recordLedgerTransaction,
} from "@/server/services/ledger";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    let event;

    // 1. Verify webhook signature if secret configured
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && signature && !webhookSecret.includes("mock")) {
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.error("[Stripe Webhook Signature Failed]:", err.message);
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    } else {
      // In local dev/test or simulation mode without live signature header
      try {
        event = JSON.parse(rawBody);
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid JSON payload" },
          { status: 400 }
        );
      }
    }

    if (!event || !event.type) {
      return NextResponse.json({ error: "Malformed event" }, { status: 400 });
    }

    // 2. Strict Idempotency Check
    const eventId = event.id || `evt_${Date.now()}`;
    const existingEvent = await db.idempotencyRecord.findUnique({
      where: { key: `webhook_${eventId}` },
    });

    if (existingEvent) {
      return NextResponse.json({ received: true, replay: true });
    }

    // 3. Handle specific Stripe events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const { type, milestoneId, invoiceId, engagementId, hours } = metadata;
        const now = new Date();

        // Save Stripe customer ID to Organization if present
        if (session.customer && metadata.organizationId) {
          await db.organization.update({
            where: { id: metadata.organizationId },
            data: { stripeCustomerId: session.customer },
          });
        }

        // A. MILESTONE ESCROW FUNDING
        if (type === "MILESTONE_ESCROW" && milestoneId) {
          const milestone = await db.milestone.findUnique({
            where: { id: milestoneId },
            include: {
              engagement: {
                include: { strategistProfile: true, organization: true },
              },
            },
          });

          if (milestone) {
            // Update milestone to IN_ESCROW
            await db.milestone.update({
              where: { id: milestoneId },
              data: {
                status: "IN_ESCROW",
                fundedAt: now,
              },
            });

            // Write balanced ledger transaction
            const baseAmountCents = Math.round(milestone.amount * 100);
            await recordMilestoneFunding({
              milestoneId: milestone.id,
              engagementId: milestone.engagementId,
              organizationId: milestone.engagement.organizationId,
              strategistProfileId: milestone.engagement.strategistProfileId,
              baseAmountCents,
              idempotencyKey: `webhook_milestone_${milestone.id}`,
            });

            // Log ActivityEvent
            await db.activityEvent.create({
              data: {
                engagementId: milestone.engagementId,
                actorId: milestone.engagement.organizationId,
                type: "MILESTONE_FUNDED",
                title: `Milestone funded into escrow: "${milestone.title}" ($${milestone.amount.toLocaleString()})`,
                metadata: { milestoneId: milestone.id, sessionId: session.id },
              },
            });

            // Notify Strategist
            await db.notification.create({
              data: {
                userId: milestone.engagement.strategistProfile.userId,
                type: "ENGAGEMENT",
                title: "Milestone Funded & Protected in Escrow",
                body: `${milestone.engagement.organization.name} has funded the escrow for "${milestone.title}". You can begin work with confidence.`,
                actionUrl: `/strategist/engagements/${milestone.engagementId}`,
              },
            });
          }
        }

        // B. RETAINER INVOICE PAYMENT
        if (type === "RETAINER_PAYMENT" && invoiceId) {
          const invoice = await db.invoice.findUnique({
            where: { id: invoiceId },
            include: {
              engagement: {
                include: { strategistProfile: true, organization: true },
              },
            },
          });

          if (invoice) {
            await db.invoice.update({
              where: { id: invoice.id },
              data: {
                status: "PAID",
                paidAt: now,
                stripePaymentIntentId: session.payment_intent || null,
              },
            });

            const retainerCents = Math.round(invoice.subtotal * 100);
            if (invoice.engagement) {
              await recordRetainerPayment({
                invoiceId: invoice.id,
                engagementId: invoice.engagementId,
                organizationId: invoice.organizationId,
                strategistProfileId: invoice.engagement.strategistProfileId,
                retainerCents,
                idempotencyKey: `webhook_invoice_${invoice.id}`,
              });

              // If engagement was paused due to payment, auto-resume
              if (invoice.engagement.status === "PAUSED") {
                await db.engagement.update({
                  where: { id: invoice.engagement.id },
                  data: { status: "ACTIVE", pauseReason: null },
                });
              }

              await db.activityEvent.create({
                data: {
                  engagementId: invoice.engagement.id,
                  actorId: invoice.organizationId,
                  type: "RETAINER_PAID",
                  title: `Monthly retainer payment processed for Invoice #${invoice.number}`,
                  metadata: { invoiceId: invoice.id },
                },
              });

              await db.notification.create({
                data: {
                  userId: invoice.engagement.strategistProfile.userId,
                  type: "INVOICE",
                  title: "Monthly Retainer Paid",
                  body: `Retainer invoice #${invoice.number} ($${invoice.subtotal.toLocaleString()}) has been settled.`,
                  actionUrl: `/strategist/earnings`,
                },
              });
            }
          }
        }

        // C. HOURLY PREFUND
        if (type === "HOURLY_PREFUND" && engagementId) {
          const addedHours = Math.max(1, Number(hours) || 10);
          const engagement = await db.engagement.findUnique({
            where: { id: engagementId },
            include: { organization: true, strategistProfile: true },
          });

          if (engagement) {
            await db.engagement.update({
              where: { id: engagementId },
              data: {
                prepaidHoursBalance: { increment: addedHours },
              },
            });

            const amountCents = Math.round(addedHours * engagement.rate * 100);
            await recordLedgerTransaction({
              transactionId: `txn_prefund_${engagementId}_${Date.now()}`,
              idempotencyKey: `webhook_prefund_${session.id}`,
              refType: "HOURLY_PREFUND",
              refId: engagementId,
              description: `Prepaid ${addedHours} hours funded by client`,
              organizationId: engagement.organizationId,
              engagementId: engagement.id,
              strategistProfileId: engagement.strategistProfileId,
              entries: [
                {
                  account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
                  direction: "DEBIT",
                  amount: amountCents,
                  description: `Client payment for prepaid hours`,
                },
                {
                  account: LEDGER_ACCOUNTS.ESCROW,
                  direction: "CREDIT",
                  amount: amountCents,
                  description: `Prepaid hours held in escrow`,
                },
              ],
            });

            await db.activityEvent.create({
              data: {
                engagementId,
                actorId: engagement.organizationId,
                type: "PREFUND_ADDED",
                title: `Prepaid balance funded: +${addedHours} hours ($${(amountCents / 100).toLocaleString()})`,
              },
            });
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};

        if (metadata.engagementId) {
          // Pause engagement due to failed payment with clear reason
          await db.engagement.update({
            where: { id: metadata.engagementId },
            data: {
              status: "PAUSED",
              pauseReason:
                "Automated payment failed. 3-day grace period initiated.",
            },
          });

          const engagement = await db.engagement.findUnique({
            where: { id: metadata.engagementId },
            include: { organization: { include: { members: true } } },
          });

          if (engagement?.organization?.members) {
            for (const member of engagement.organization.members) {
              await db.notification.create({
                data: {
                  userId: member.userId,
                  type: "INVOICE",
                  title: "Payment Failed – Action Required",
                  body: `Your payment of $${((paymentIntent.amount || 0) / 100).toLocaleString()} failed. Engagement is paused pending updated billing information.`,
                  actionUrl: `/client/billing`,
                },
              });
            }
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const refundAmountCents = charge.amount_refunded || 0;
        if (charge.invoice) {
          await db.invoice.updateMany({
            where: { stripeInvoiceId: charge.invoice },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object;
        if (account.id) {
          const isReady = account.charges_enabled && account.payouts_enabled;
          await db.strategistProfile.updateMany({
            where: { stripeAccountId: account.id },
            data: {
              stripeOnboarded: isReady,
              stripeAccountStatus: isReady ? "ACTIVE" : "PENDING",
            },
          });
        }
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object;
        if (transfer.id) {
          await db.payout.updateMany({
            where: { stripeTransferId: transfer.id },
            data: { status: "PAID" },
          });
        }
        break;
      }

      default:
        // Other events ignored cleanly
        break;
    }

    // 4. Record idempotency log
    await db.idempotencyRecord.create({
      data: {
        key: `webhook_${eventId}`,
        action: `stripe_webhook_${event.type}`,
        response: { eventId, type: event.type },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day retention
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
