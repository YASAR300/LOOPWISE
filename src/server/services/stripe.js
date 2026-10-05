// src/server/services/stripe.js
import Stripe from "stripe";
import { db } from "@/lib/db";
import {
  calculateMilestoneFees,
  calculateRetainerFees,
  calculateHourlyFees,
} from "@/lib/fees";

const stripeApiKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_mock_loopwise_key";

export const stripe = new Stripe(stripeApiKey, {
  apiVersion: "2023-10-16",
});

/**
 * Retrieve or create a Stripe Customer for an Organization.
 */
export async function getOrCreateStripeCustomer({
  organizationId,
  email,
  name,
}) {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
  });

  if (!org) throw new Error("Organization not found");

  if (org.stripeCustomerId) {
    return org.stripeCustomerId;
  }

  // Create customer in Stripe if API key is real, otherwise generate mock customer ID
  let customerId = `cus_test_${org.id.slice(-8)}`;

  if (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("mock")
  ) {
    try {
      const customer = await stripe.customers.create({
        email: email || org.billingContactEmail || undefined,
        name: name || org.name,
        metadata: {
          organizationId: org.id,
          orgSlug: org.slug,
        },
      });
      customerId = customer.id;
    } catch (err) {
      console.warn("[Stripe Customer Create Fallback]:", err.message);
    }
  }

  await db.organization.update({
    where: { id: org.id },
    data: { stripeCustomerId: customerId },
  });

  return customerId;
}

/**
 * Creates a Stripe Checkout Session for funding a Milestone into Escrow.
 */
export async function createMilestoneCheckoutSession({
  milestoneId,
  organizationId,
  user,
  origin,
}) {
  const milestone = await db.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      engagement: {
        include: {
          organization: true,
          strategistProfile: { include: { user: true } },
        },
      },
    },
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.engagement.organizationId !== organizationId) {
    throw new Error(
      "Forbidden: Milestone does not belong to this organization"
    );
  }

  const baseAmountCents = Math.round(milestone.amount * 100);
  const fees = calculateMilestoneFees(baseAmountCents);

  const customerId = await getOrCreateStripeCustomer({
    organizationId,
    email: user?.email,
    name: milestone.engagement.organization.name,
  });

  const successUrl = `${origin}/client/engagements/${milestone.engagementId}?tab=money&funded=1&milestoneId=${milestone.id}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/client/engagements/${milestone.engagementId}?tab=money&canceled=1`;

  // Live or Mock checkout session creation
  if (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("mock")
  ) {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Milestone: ${milestone.title}`,
              description: `Held in Loopwise escrow until deliverable review & client approval.`,
            },
            unit_amount: fees.baseAmountCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Loopwise Escrow & Platform Protection Fee (8%)",
              description:
                "Covers escrow mediation, dispute guarantee, and delivery telemetry.",
            },
            unit_amount: fees.clientFeeCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: milestone.id,
      metadata: {
        type: "MILESTONE_ESCROW",
        milestoneId: milestone.id,
        engagementId: milestone.engagementId,
        organizationId: organizationId,
        baseAmountCents: String(fees.baseAmountCents),
        clientFeeCents: String(fees.clientFeeCents),
        totalChargedCents: String(fees.clientChargedCents),
      },
    });

    return { checkoutUrl: session.url, sessionId: session.id };
  }

  // Simulated Test-Mode Session
  const mockSessionId = `cs_test_${milestone.id.slice(-6)}_${Date.now()}`;
  const mockUrl = `${origin}/api/payments/test-checkout?sessionId=${mockSessionId}&milestoneId=${milestone.id}&type=MILESTONE_ESCROW&amount=${fees.clientChargedCents}`;

  return { checkoutUrl: mockUrl, sessionId: mockSessionId, mock: true };
}

/**
 * Creates a Stripe Checkout Session for paying a Retainer Invoice.
 */
export async function createRetainerCheckoutSession({
  invoiceId,
  organizationId,
  user,
  origin,
}) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      engagement: {
        include: {
          organization: true,
          strategistProfile: { include: { user: true } },
        },
      },
    },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.organizationId !== organizationId) {
    throw new Error("Forbidden: Invoice does not belong to this organization");
  }

  const baseAmountCents = Math.round(invoice.subtotal * 100);
  const fees = calculateRetainerFees(baseAmountCents);

  const customerId = await getOrCreateStripeCustomer({
    organizationId,
    email: user?.email,
    name: invoice.organization.name,
  });

  const successUrl = `${origin}/client/billing?paid=1&invoiceId=${invoice.id}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/client/billing?canceled=1`;

  if (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("mock")
  ) {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Retainer Invoice #${invoice.number}`,
              description: `Fractional AI & Automation Retainer Period`,
            },
            unit_amount: fees.baseAmountCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Platform Client Management Fee (8%)",
              description: "Platform orchestration and SLA telemetry fee.",
            },
            unit_amount: fees.clientFeeCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: invoice.id,
      metadata: {
        type: "RETAINER_PAYMENT",
        invoiceId: invoice.id,
        engagementId: invoice.engagementId || "",
        organizationId: organizationId,
        baseAmountCents: String(fees.baseAmountCents),
        totalChargedCents: String(fees.clientChargedCents),
      },
    });

    return { checkoutUrl: session.url, sessionId: session.id };
  }

  const mockSessionId = `cs_ret_${invoice.id.slice(-6)}_${Date.now()}`;
  const mockUrl = `${origin}/api/payments/test-checkout?sessionId=${mockSessionId}&invoiceId=${invoice.id}&type=RETAINER_PAYMENT&amount=${fees.clientChargedCents}`;

  return { checkoutUrl: mockUrl, sessionId: mockSessionId, mock: true };
}

/**
 * Creates a Stripe Checkout Session for funding prepaid hourly balance.
 */
export async function createHourlyPrefundCheckoutSession({
  engagementId,
  hours,
  organizationId,
  user,
  origin,
}) {
  const engagement = await db.engagement.findUnique({
    where: { id: engagementId },
    include: { organization: true, strategistProfile: true },
  });

  if (!engagement) throw new Error("Engagement not found");
  if (engagement.organizationId !== organizationId) {
    throw new Error(
      "Forbidden: Engagement does not belong to this organization"
    );
  }

  const h = Math.max(1, Number(hours) || 10);
  const hourlyRateCents = Math.round(engagement.rate * 100);
  const fees = calculateHourlyFees(h, hourlyRateCents);

  const customerId = await getOrCreateStripeCustomer({
    organizationId,
    email: user?.email,
    name: engagement.organization.name,
  });

  const successUrl = `${origin}/client/engagements/${engagement.id}?tab=money&prefunded=1&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/client/engagements/${engagement.id}?tab=money`;

  if (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("mock")
  ) {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Prepaid Balance: ${h} Hours @ $${engagement.rate}/hr`,
              description: `Dedicated hourly time allocation held in verified escrow.`,
            },
            unit_amount: fees.baseAmountCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Platform Client Fee (8%)",
              description: "Telemetry and time tracking verification fee.",
            },
            unit_amount: fees.clientFeeCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: engagement.id,
      metadata: {
        type: "HOURLY_PREFUND",
        engagementId: engagement.id,
        organizationId: organizationId,
        hours: String(h),
        baseAmountCents: String(fees.baseAmountCents),
        totalChargedCents: String(fees.clientChargedCents),
      },
    });

    return { checkoutUrl: session.url, sessionId: session.id };
  }

  const mockSessionId = `cs_hr_${engagement.id.slice(-6)}_${Date.now()}`;
  const mockUrl = `${origin}/api/payments/test-checkout?sessionId=${mockSessionId}&engagementId=${engagement.id}&hours=${h}&type=HOURLY_PREFUND&amount=${fees.clientChargedCents}`;

  return { checkoutUrl: mockUrl, sessionId: mockSessionId, mock: true };
}
