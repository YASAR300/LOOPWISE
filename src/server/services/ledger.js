// src/server/services/ledger.js
import { db } from "@/lib/db";
import {
  calculateMilestoneFees,
  calculateRetainerFees,
  calculateHourlyFees,
} from "@/lib/fees";

/**
 * Standard Double-Entry Accounting Ledger for Loopwise.
 *
 * Accounts:
 * - CLIENT_FUNDS: Inbound gross receipts from client checkout/charges (Asset)
 * - ESCROW: Funds held in trust pending deliverable milestone completion (Liability)
 * - PLATFORM_REVENUE: Earned commission fees (client fee + strategist fee) (Revenue)
 * - STRATEGIST_PAYABLE: Verified, cleared balance ready for strategist payout (Liability)
 * - PAYOUTS: Settled external payouts via Stripe Connect (Asset/Contra)
 * - REFUNDS: Returned payments back to client card/bank (Asset/Contra)
 *
 * Invariant: Every transaction must satisfy SUM(DEBIT) === SUM(CREDIT).
 * Precision: All amounts stored in minor units (integer cents).
 */

export const LEDGER_ACCOUNTS = {
  CLIENT_FUNDS: "CLIENT_FUNDS",
  ESCROW: "ESCROW",
  PLATFORM_REVENUE: "PLATFORM_REVENUE",
  STRATEGIST_PAYABLE: "STRATEGIST_PAYABLE",
  PAYOUTS: "PAYOUTS",
  REFUNDS: "REFUNDS",
};

/**
 * Validates that an array of journal entries balances to zero.
 * @param {Array<{ account: string, direction: 'DEBIT' | 'CREDIT', amount: number }>} entries
 */
export function validateBalancedEntries(entries) {
  if (!Array.isArray(entries) || entries.length < 2) {
    throw new Error("A ledger transaction must contain at least two entries");
  }

  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of entries) {
    if (!Object.values(LEDGER_ACCOUNTS).includes(entry.account)) {
      throw new Error(`Invalid ledger account: ${entry.account}`);
    }
    if (entry.direction !== "DEBIT" && entry.direction !== "CREDIT") {
      throw new Error(`Invalid ledger direction: ${entry.direction}`);
    }
    const amt = Math.round(Number(entry.amount));
    if (isNaN(amt) || amt <= 0) {
      throw new Error(
        `Ledger entry amount must be a positive integer, received: ${entry.amount}`
      );
    }

    if (entry.direction === "DEBIT") {
      totalDebits += amt;
    } else {
      totalCredits += amt;
    }
  }

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Ledger transaction unbalanced! Total debits: ${totalDebits} cents, total credits: ${totalCredits} cents. Difference: ${totalDebits - totalCredits}`
    );
  }

  return { totalDebits, totalCredits, isBalanced: true };
}

/**
 * Execute a balanced ledger transaction inside a Prisma transaction with strict idempotency.
 *
 * @param {object} params
 * @param {string} params.transactionId - Unique UUID / reference for this journal batch
 * @param {string} [params.idempotencyKey] - Unique key preventing double execution
 * @param {string} params.refType - Business reference type (e.g. MILESTONE_FUNDING, ESCROW_RELEASE)
 * @param {string} [params.refId] - Entity ID (e.g. milestoneId, invoiceId, payoutId)
 * @param {string} [params.description] - Description of the transaction
 * @param {string} [params.organizationId]
 * @param {string} [params.engagementId]
 * @param {string} [params.strategistProfileId]
 * @param {object} [params.metadata]
 * @param {Array<{ account: string, direction: 'DEBIT'|'CREDIT', amount: number, description?: string }>} params.entries
 * @param {object} [params.prismaClient] - Optional active transaction client
 */
export async function recordLedgerTransaction(params) {
  const {
    transactionId,
    idempotencyKey,
    refType,
    refId,
    description,
    organizationId,
    engagementId,
    strategistProfileId,
    metadata,
    entries,
    prismaClient,
  } = params;

  if (!transactionId) {
    throw new Error("transactionId is required for ledger mutations");
  }

  // 1. Verify balancing invariant
  validateBalancedEntries(entries);

  const runner = async (tx) => {
    // 2. Check IdempotencyKey if provided
    if (idempotencyKey) {
      const existing = await tx.ledgerEntry.findMany({
        where: { idempotencyKey },
      });
      if (existing.length > 0) {
        return {
          idempotentReplay: true,
          transactionId: existing[0].transactionId,
          entries: existing,
        };
      }
    }

    // 3. Insert all balanced entries atomically
    const createdEntries = await Promise.all(
      entries.map((entry) =>
        tx.ledgerEntry.create({
          data: {
            transactionId,
            account: entry.account,
            direction: entry.direction,
            amount: Math.round(Number(entry.amount)),
            currency: entry.currency || "USD",
            idempotencyKey: idempotencyKey || null,
            refType,
            refId: refId || null,
            description: entry.description || description || null,
            organizationId: organizationId || null,
            engagementId: engagementId || null,
            strategistProfileId: strategistProfileId || null,
            metadata: metadata || null,
          },
        })
      )
    );

    // 4. Update engagement escrowBalance or prepaid balance if applicable
    if (engagementId) {
      const escrowDelta = entries
        .filter((e) => e.account === LEDGER_ACCOUNTS.ESCROW)
        .reduce(
          (sum, e) =>
            e.direction === "CREDIT" ? sum + e.amount : sum - e.amount,
          0
        );

      if (escrowDelta !== 0) {
        await tx.engagement.update({
          where: { id: engagementId },
          data: {
            escrowBalance: { increment: escrowDelta / 100 },
          },
        });
      }
    }

    return {
      idempotentReplay: false,
      transactionId,
      entries: createdEntries,
    };
  };

  if (prismaClient) {
    return await runner(prismaClient);
  }

  return await db.$transaction(runner);
}

// ==============================================================================
// PRE-BUILT BALANCED LEDGER FLOWS
// ==============================================================================

/**
 * 1. MILESTONE FUNDING (Into Escrow)
 * Client pays gross amount (base + client fee). Base moves to Escrow, fee to Platform Revenue.
 * DEBIT CLIENT_FUNDS (base + clientFee)
 * CREDIT ESCROW (base)
 * CREDIT PLATFORM_REVENUE (clientFee)
 */
export async function recordMilestoneFunding({
  milestoneId,
  engagementId,
  organizationId,
  strategistProfileId,
  baseAmountCents,
  idempotencyKey,
  metadata = {},
  prismaClient,
}) {
  const fees = calculateMilestoneFees(baseAmountCents);
  const transactionId = `txn_fund_${milestoneId}_${Date.now()}`;

  const entries = [
    {
      account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
      direction: "DEBIT",
      amount: fees.clientChargedCents,
      description: `Client payment for milestone funding`,
    },
    {
      account: LEDGER_ACCOUNTS.ESCROW,
      direction: "CREDIT",
      amount: fees.baseAmountCents,
      description: `Milestone funds locked in escrow`,
    },
    {
      account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
      direction: "CREDIT",
      amount: fees.clientFeeCents,
      description: `Platform client fee (${(fees.clientFeePct * 100).toFixed(1)}%)`,
    },
  ];

  return await recordLedgerTransaction({
    transactionId,
    idempotencyKey: idempotencyKey || `idem_fund_${milestoneId}`,
    refType: "MILESTONE_FUNDING",
    refId: milestoneId,
    description: `Milestone funded into escrow (${fees.baseAmountCents} base + ${fees.clientFeeCents} fee)`,
    organizationId,
    engagementId,
    strategistProfileId,
    metadata: { ...metadata, fees },
    entries,
    prismaClient,
  });
}

/**
 * 2. ESCROW RELEASE (Milestone Approved by Client)
 * Funds leave Escrow. Strategist fee deducted, net to Strategist Payable, fee to Platform Revenue.
 * DEBIT ESCROW (base)
 * CREDIT STRATEGIST_PAYABLE (base - stratFee)
 * CREDIT PLATFORM_REVENUE (stratFee)
 */
export async function recordMilestoneRelease({
  milestoneId,
  engagementId,
  organizationId,
  strategistProfileId,
  baseAmountCents,
  idempotencyKey,
  metadata = {},
  prismaClient,
}) {
  const fees = calculateMilestoneFees(baseAmountCents);
  const transactionId = `txn_rel_${milestoneId}_${Date.now()}`;

  const entries = [
    {
      account: LEDGER_ACCOUNTS.ESCROW,
      direction: "DEBIT",
      amount: fees.baseAmountCents,
      description: `Milestone approved: release from escrow`,
    },
    {
      account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
      direction: "CREDIT",
      amount: fees.strategistPayoutCents,
      description: `Net milestone earnings payable to strategist`,
    },
    {
      account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
      direction: "CREDIT",
      amount: fees.strategistFeeCents,
      description: `Platform strategist fee (${(fees.strategistFeePct * 100).toFixed(1)}%)`,
    },
  ];

  return await recordLedgerTransaction({
    transactionId,
    idempotencyKey: idempotencyKey || `idem_rel_${milestoneId}`,
    refType: "ESCROW_RELEASE",
    refId: milestoneId,
    description: `Escrow released for milestone ${milestoneId}`,
    organizationId,
    engagementId,
    strategistProfileId,
    metadata: { ...metadata, fees },
    entries,
    prismaClient,
  });
}

/**
 * 3. RETAINER PAYMENT
 * Client pays monthly retainer.
 * DEBIT CLIENT_FUNDS (retainer + clientFee)
 * CREDIT STRATEGIST_PAYABLE (retainer - stratFee)
 * CREDIT PLATFORM_REVENUE (clientFee + stratFee)
 */
export async function recordRetainerPayment({
  invoiceId,
  engagementId,
  organizationId,
  strategistProfileId,
  retainerCents,
  idempotencyKey,
  metadata = {},
  prismaClient,
}) {
  const fees = calculateRetainerFees(retainerCents);
  const transactionId = `txn_ret_${invoiceId}_${Date.now()}`;

  const entries = [
    {
      account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
      direction: "DEBIT",
      amount: fees.clientChargedCents,
      description: `Client payment for retainer invoice`,
    },
    {
      account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
      direction: "CREDIT",
      amount: fees.strategistPayoutCents,
      description: `Net retainer payable to strategist`,
    },
    {
      account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
      direction: "CREDIT",
      amount: fees.platformRevenueCents,
      description: `Total platform revenue (client fee + strategist fee)`,
    },
  ];

  return await recordLedgerTransaction({
    transactionId,
    idempotencyKey: idempotencyKey || `idem_ret_${invoiceId}`,
    refType: "RETAINER_PAYMENT",
    refId: invoiceId,
    description: `Retainer payment recorded for invoice ${invoiceId}`,
    organizationId,
    engagementId,
    strategistProfileId,
    metadata: { ...metadata, fees },
    entries,
    prismaClient,
  });
}

/**
 * 4. HOURLY TIMESHEET PAYMENT
 * Client pays weekly approved hours.
 * DEBIT CLIENT_FUNDS (base + clientFee)
 * CREDIT STRATEGIST_PAYABLE (base - stratFee)
 * CREDIT PLATFORM_REVENUE (clientFee + stratFee)
 */
export async function recordHourlyPayment({
  invoiceId,
  engagementId,
  organizationId,
  strategistProfileId,
  hours,
  hourlyRateCents,
  idempotencyKey,
  metadata = {},
  prismaClient,
}) {
  const fees = calculateHourlyFees(hours, hourlyRateCents);
  const transactionId = `txn_hr_${invoiceId}_${Date.now()}`;

  const entries = [
    {
      account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
      direction: "DEBIT",
      amount: fees.clientChargedCents,
      description: `Client payment for ${hours} approved hours`,
    },
    {
      account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
      direction: "CREDIT",
      amount: fees.strategistPayoutCents,
      description: `Net hourly earnings payable to strategist`,
    },
    {
      account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
      direction: "CREDIT",
      amount: fees.platformRevenueCents,
      description: `Total platform fee on hourly billing`,
    },
  ];

  return await recordLedgerTransaction({
    transactionId,
    idempotencyKey: idempotencyKey || `idem_hr_${invoiceId}`,
    refType: "HOURLY_PAYMENT",
    refId: invoiceId,
    description: `Hourly payment recorded for invoice ${invoiceId}`,
    organizationId,
    engagementId,
    strategistProfileId,
    metadata: { ...metadata, fees },
    entries,
    prismaClient,
  });
}

/**
 * 5. STRATEGIST PAYOUT (Withdrawal via Stripe Connect)
 * Money moves from payable liability to external payout asset.
 * DEBIT STRATEGIST_PAYABLE (amountCents)
 * CREDIT PAYOUTS (amountCents)
 */
export async function recordPayout({
  payoutId,
  strategistProfileId,
  amountCents,
  stripeTransferId,
  idempotencyKey,
  metadata = {},
  prismaClient,
}) {
  const amt = Math.round(Number(amountCents));
  const transactionId = `txn_payout_${payoutId}_${Date.now()}`;

  const entries = [
    {
      account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
      direction: "DEBIT",
      amount: amt,
      description: `Strategist payout withdrawal`,
    },
    {
      account: LEDGER_ACCOUNTS.PAYOUTS,
      direction: "CREDIT",
      amount: amt,
      description: `Stripe Connect transfer ${stripeTransferId || ""}`,
    },
  ];

  return await recordLedgerTransaction({
    transactionId,
    idempotencyKey: idempotencyKey || `idem_payout_${payoutId}`,
    refType: "PAYOUT",
    refId: payoutId,
    description: `Payout processed for strategist (${amt} cents)`,
    strategistProfileId,
    metadata: { ...metadata, stripeTransferId },
    entries,
    prismaClient,
  });
}

/**
 * 6. REFUND (Milestone / Invoice refund to client)
 * Returns escrowed or unearned funds back to client card.
 * DEBIT ESCROW (baseAmountCents)
 * DEBIT PLATFORM_REVENUE (clientFeeCents)
 * CREDIT REFUNDS (clientChargedCents)
 */
export async function recordRefund({
  refId,
  refType = "REFUND",
  organizationId,
  engagementId,
  strategistProfileId,
  baseAmountCents,
  refundFee = true,
  idempotencyKey,
  metadata = {},
  prismaClient,
}) {
  const fees = calculateMilestoneFees(baseAmountCents);
  const transactionId = `txn_ref_${refId}_${Date.now()}`;

  const feePortion = refundFee ? fees.clientFeeCents : 0;
  const totalRefundCents = fees.baseAmountCents + feePortion;

  const entries = [
    {
      account: LEDGER_ACCOUNTS.ESCROW,
      direction: "DEBIT",
      amount: fees.baseAmountCents,
      description: `Escrow returned upon refund`,
    },
  ];

  if (feePortion > 0) {
    entries.push({
      account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
      direction: "DEBIT",
      amount: feePortion,
      description: `Platform fee reversed on refund`,
    });
  }

  entries.push({
    account: LEDGER_ACCOUNTS.REFUNDS,
    direction: "CREDIT",
    amount: totalRefundCents,
    description: `Refund issued to client`,
  });

  return await recordLedgerTransaction({
    transactionId,
    idempotencyKey: idempotencyKey || `idem_refund_${refId}`,
    refType,
    refId,
    description: `Refund of ${totalRefundCents} cents processed`,
    organizationId,
    engagementId,
    strategistProfileId,
    metadata: { ...metadata, totalRefundCents },
    entries,
    prismaClient,
  });
}

/**
 * 7. DISPUTE RESOLUTION
 * Resolves a disputed escrow amount by splitting between client refund and strategist payout.
 * DEBIT ESCROW (escrowBaseCents)
 * CREDIT REFUNDS (clientRefundCents)
 * CREDIT STRATEGIST_PAYABLE (strategistPayoutCents)
 * CREDIT PLATFORM_REVENUE (platformFeeCents)
 */
export async function recordDisputeResolution({
  disputeId,
  engagementId,
  organizationId,
  strategistProfileId,
  escrowBaseCents,
  clientRefundCents,
  strategistPayoutCents,
  platformFeeCents = 0,
  idempotencyKey,
  metadata = {},
  prismaClient,
}) {
  const transactionId = `txn_disp_${disputeId}_${Date.now()}`;
  const totalCredits =
    clientRefundCents + strategistPayoutCents + platformFeeCents;

  if (totalCredits !== escrowBaseCents) {
    throw new Error(
      `Dispute resolution amounts must equal escrow base: ${escrowBaseCents} cents != ${totalCredits} sum of credits`
    );
  }

  const entries = [
    {
      account: LEDGER_ACCOUNTS.ESCROW,
      direction: "DEBIT",
      amount: escrowBaseCents,
      description: `Disputed escrow released per admin adjudication`,
    },
  ];

  if (clientRefundCents > 0) {
    entries.push({
      account: LEDGER_ACCOUNTS.REFUNDS,
      direction: "CREDIT",
      amount: clientRefundCents,
      description: `Dispute settlement: client refund`,
    });
  }

  if (strategistPayoutCents > 0) {
    entries.push({
      account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
      direction: "CREDIT",
      amount: strategistPayoutCents,
      description: `Dispute settlement: strategist payout`,
    });
  }

  if (platformFeeCents > 0) {
    entries.push({
      account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
      direction: "CREDIT",
      amount: platformFeeCents,
      description: `Dispute settlement: platform fee`,
    });
  }

  return await recordLedgerTransaction({
    transactionId,
    idempotencyKey: idempotencyKey || `idem_disp_${disputeId}`,
    refType: "DISPUTE_RESOLUTION",
    refId: disputeId,
    description: `Dispute ${disputeId} resolved: ${clientRefundCents} refund, ${strategistPayoutCents} payout`,
    organizationId,
    engagementId,
    strategistProfileId,
    metadata,
    entries,
    prismaClient,
  });
}

// ==============================================================================
// LEDGER BALANCE QUERY HELPERS
// ==============================================================================

/**
 * Computes the real-time available balance for a strategist in cents.
 * Available = Credits to STRATEGIST_PAYABLE - Debits from STRATEGIST_PAYABLE (e.g. past payouts).
 */
export async function getStrategistPayableBalance(strategistProfileId) {
  if (!strategistProfileId)
    return { balanceCents: 0, balanceFormatted: "$0.00" };

  const entries = await db.ledgerEntry.findMany({
    where: {
      strategistProfileId,
      account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
    },
    select: { direction: true, amount: true },
  });

  let balanceCents = 0;
  for (const e of entries) {
    if (e.direction === "CREDIT") {
      balanceCents += e.amount;
    } else if (e.direction === "DEBIT") {
      balanceCents -= e.amount;
    }
  }

  return {
    balanceCents: Math.max(0, balanceCents),
    balanceFormatted: `$${(Math.max(0, balanceCents) / 100).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`,
  };
}

/**
 * Computes active escrow balance for an engagement in cents.
 */
export async function getEngagementEscrowBalance(engagementId) {
  if (!engagementId) return { escrowCents: 0, escrowFormatted: "$0.00" };

  const entries = await db.ledgerEntry.findMany({
    where: {
      engagementId,
      account: LEDGER_ACCOUNTS.ESCROW,
    },
    select: { direction: true, amount: true },
  });

  let escrowCents = 0;
  for (const e of entries) {
    if (e.direction === "CREDIT") {
      escrowCents += e.amount;
    } else if (e.direction === "DEBIT") {
      escrowCents -= e.amount;
    }
  }

  return {
    escrowCents: Math.max(0, escrowCents),
    escrowFormatted: `$${(Math.max(0, escrowCents) / 100).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`,
  };
}
