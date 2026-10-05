// src/lib/fees.js
/**
 * Fee computation rules for Loopwise fractional leadership engagements.
 * Transparent, deterministic pricing with minor-unit (cents) precision.
 * Client Fee: 8% default (env-overridable via CLIENT_FEE_PCT)
 * Strategist Fee: 10% default (env-overridable via STRATEGIST_FEE_PCT)
 */

export const DEFAULT_CLIENT_FEE_PCT = 0.08; // 8%
export const DEFAULT_STRATEGIST_FEE_PCT = 0.1; // 10%

export const FEE_CONFIG = {
  get CLIENT_FEE_PERCENTAGE() {
    return Math.round(getClientFeePct() * 100);
  },
  get STRATEGIST_FEE_PERCENTAGE() {
    return Math.round(getStrategistFeePct() * 100);
  },
};

export const ENGAGEMENT_MODELS = {
  RETAINER: {
    id: "retainer",
    name: "Fractional Retainer",
    badge: "Most Popular",
    headline: "Dedicated Strategic Leadership",
    typicalRate: 14000,
    ratePeriod: "month",
    hoursPerWeek: "15-20 hrs/week",
    description:
      "A dedicated Fractional Head of AI embedded with your leadership. Maps enterprise workflows, leads vendor RFP decisions, and directs agent deployments.",
    features: [
      "Dedicated senior AI strategist (15-20 hrs/wk)",
      "Weekly executive steering committee & roadmapping",
      "Full workflow mapping & autonomous agent architecture",
      "Bi-weekly escrow release with milestone approval",
      "NIST AI RMF governance audit pack included",
      "Free strategist replacement guarantee within 14 days",
    ],
  },
  HOURLY: {
    id: "hourly",
    name: "Advisory & Deep Dive",
    badge: "Flexible",
    headline: "Targeted Technical Architecture",
    typicalRate: 240,
    ratePeriod: "hour",
    hoursPerWeek: "5-15 hrs/week",
    description:
      "On-demand architectural review, red-teaming, model fine-tuning guidance, or hands-on agent runtime troubleshooting with verified experts.",
    features: [
      "Pay strictly for verified tracked advisory hours",
      "Direct code & architecture reviews (LangGraph, CrewAI, etc.)",
      "Incident triage & guardrail breach forensic audits",
      "Weekly verified timesheets with automated escrow hold",
      "Full access to Loopwise agent registry & telemetry",
      "Zero minimum commitment after initial onboarding",
    ],
  },
  FIXED: {
    id: "fixed",
    name: "Fixed Milestone",
    badge: "Outcome-Driven",
    headline: "Scored Production Deployments",
    typicalRate: 18500,
    ratePeriod: "project",
    hoursPerWeek: "Milestone-based",
    description:
      "Fixed-scope, outcome-guaranteed delivery. From initial SOP workflow mapping to a hardened, monitored autonomous agent in production.",
    features: [
      "100% milestone-based escrow: pay upon verified acceptance",
      "Structured 4-stage delivery (Map, Design, Build, Telemetry)",
      "Deterministic test suites with custom evaluation rubrics",
      "Complete documentation, runbooks, and staff handoff",
      "30-day post-launch warranty & error drift monitoring",
      "Guaranteed dispute arbitration & escrow refund protection",
    ],
  },
};

/**
 * Calculate client total and strategist payout based on base agreement amount (in dollars).
 * @param {number} baseAmount
 * @returns {{ baseAmount: number, clientFee: number, clientTotal: number, strategistFee: number, strategistNet: number, clientFeePercent: number, strategistFeePercent: number }}
 */
export function calculateEngagementFees(baseAmount) {
  const amount = Number(baseAmount) || 0;
  const clientFeeRate = getClientFeePct();
  const strategistFeeRate = getStrategistFeePct();

  const clientFee = Math.round(amount * clientFeeRate * 100) / 100;
  const clientTotal = Math.round((amount + clientFee) * 100) / 100;
  const strategistFee = Math.round(amount * strategistFeeRate * 100) / 100;
  const strategistNet = Math.round((amount - strategistFee) * 100) / 100;

  return {
    baseAmount: amount,
    clientFeePercent: Math.round(clientFeeRate * 100),
    clientFee,
    clientTotal,
    strategistFeePercent: Math.round(strategistFeeRate * 100),
    strategistFee,
    strategistNet,
  };
}

/**
 * Get active client fee rate (percentage as decimal)
 */
export function getClientFeePct() {
  const envVal = process.env.CLIENT_FEE_PCT;
  if (envVal !== undefined && !isNaN(parseFloat(envVal))) {
    return parseFloat(envVal);
  }
  return DEFAULT_CLIENT_FEE_PCT;
}

/**
 * Get active strategist fee rate (percentage as decimal)
 */
export function getStrategistFeePct() {
  const envVal = process.env.STRATEGIST_FEE_PCT;
  if (envVal !== undefined && !isNaN(parseFloat(envVal))) {
    return parseFloat(envVal);
  }
  return DEFAULT_STRATEGIST_FEE_PCT;
}

/**
 * Calculate complete fee breakdown for milestone billing in minor units (cents).
 * Guarantees zero-cent drift:
 * clientChargedCents === strategistPayoutCents + platformRevenueCents
 *
 * @param {number} baseAmountCents - Agreed milestone value in cents
 * @param {object} [options]
 * @param {number} [options.clientFeePct]
 * @param {number} [options.strategistFeePct]
 */
export function calculateMilestoneFees(baseAmountCents, options = {}) {
  const base = Math.max(0, Math.round(Number(baseAmountCents) || 0));
  const clientPct =
    options.clientFeePct !== undefined
      ? options.clientFeePct
      : getClientFeePct();
  const stratPct =
    options.strategistFeePct !== undefined
      ? options.strategistFeePct
      : getStrategistFeePct();

  const clientFeeCents = Math.round(base * clientPct);
  const strategistFeeCents = Math.round(base * stratPct);

  const clientChargedCents = base + clientFeeCents;
  const strategistPayoutCents = base - strategistFeeCents;
  const platformRevenueCents = clientFeeCents + strategistFeeCents;

  return {
    baseAmountCents: base,
    clientFeePct: clientPct,
    strategistFeePct: stratPct,
    clientFeeCents,
    strategistFeeCents,
    clientChargedCents,
    strategistPayoutCents,
    platformRevenueCents,
  };
}

/**
 * Calculate complete fee breakdown for retainer billing in minor units (cents).
 */
export function calculateRetainerFees(retainerAmountCents, options = {}) {
  return calculateMilestoneFees(retainerAmountCents, options);
}

/**
 * Calculate complete fee breakdown for hourly timesheet billing in minor units (cents).
 */
export function calculateHourlyFees(hours, hourlyRateCents, options = {}) {
  const h = Math.max(0, Number(hours) || 0);
  const rate = Math.max(0, Math.round(Number(hourlyRateCents) || 0));
  const baseAmountCents = Math.round(h * rate);
  return {
    hours: h,
    hourlyRateCents: rate,
    ...calculateMilestoneFees(baseAmountCents, options),
  };
}

/**
 * Format cents to USD currency string (e.g. 108000 -> "$1,080.00")
 */
export function formatCentsToCurrency(cents, currency = "USD") {
  const dollars = (Number(cents) || 0) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(dollars);
}
