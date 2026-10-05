// src/lib/fees.js
/**
 * Fee computation rules for Loopwise fractional leadership engagements.
 * Transparent, deterministic pricing with minor-unit (cents) precision.
 * Client Fee: 8% default (env-overridable via CLIENT_FEE_PCT)
 * Strategist Fee: 10% default (env-overridable via STRATEGIST_FEE_PCT)
 */

export const DEFAULT_CLIENT_FEE_PCT = 0.08; // 8%
export const DEFAULT_STRATEGIST_FEE_PCT = 0.1; // 10%

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
