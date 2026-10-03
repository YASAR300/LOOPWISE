/**
 * Loopwise Shared Fee Rules & Engagement Model Calculations
 * Configurable via environment variables with strict platform defaults.
 */

export const FEE_CONFIG = {
  CLIENT_FEE_PERCENTAGE: Number(
    process.env.NEXT_PUBLIC_CLIENT_FEE_PCT || process.env.CLIENT_FEE_PCT || 8
  ), // 8% client-side platform fee
  STRATEGIST_FEE_PERCENTAGE: Number(
    process.env.NEXT_PUBLIC_STRATEGIST_FEE_PCT ||
      process.env.STRATEGIST_FEE_PCT ||
      10
  ), // 10% strategist payout deduction
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
 * Calculate client total and strategist payout based on base agreement amount.
 * @param {number} baseAmount
 * @returns {{ baseAmount: number, clientFee: number, clientTotal: number, strategistFee: number, strategistNet: number }}
 */
export function calculateEngagementFees(baseAmount) {
  const amount = Number(baseAmount) || 0;
  const clientFeeRate = FEE_CONFIG.CLIENT_FEE_PERCENTAGE / 100;
  const strategistFeeRate = FEE_CONFIG.STRATEGIST_FEE_PERCENTAGE / 100;

  const clientFee = Math.round(amount * clientFeeRate * 100) / 100;
  const clientTotal = Math.round((amount + clientFee) * 100) / 100;
  const strategistFee = Math.round(amount * strategistFeeRate * 100) / 100;
  const strategistNet = Math.round((amount - strategistFee) * 100) / 100;

  return {
    baseAmount: amount,
    clientFeePercent: FEE_CONFIG.CLIENT_FEE_PERCENTAGE,
    clientFee,
    clientTotal,
    strategistFeePercent: FEE_CONFIG.STRATEGIST_FEE_PERCENTAGE,
    strategistFee,
    strategistNet,
  };
}
