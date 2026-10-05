// src/server/__tests__/ledger.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  LEDGER_ACCOUNTS,
  validateBalancedEntries,
  recordLedgerTransaction,
  recordMilestoneFunding,
  recordMilestoneRelease,
  recordRetainerPayment,
  recordHourlyPayment,
  recordPayout,
  recordRefund,
  recordDisputeResolution,
} from "../services/ledger";
import {
  calculateMilestoneFees,
  calculateRetainerFees,
  calculateHourlyFees,
  getClientFeePct,
  getStrategistFeePct,
} from "@/lib/fees";

describe("Double-Entry Ledger & Fee Accounting Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Fee Computation & Balance Invariants", () => {
    it("applies default 8% client fee and 10% strategist fee", () => {
      const clientPct = getClientFeePct();
      const stratPct = getStrategistFeePct();
      expect(clientPct).toBe(0.08);
      expect(stratPct).toBe(0.1);
    });

    it("ensures exact zero-cent drift for milestone fees (clientCharged === payout + platformRevenue)", () => {
      // Test across multiple odd and even amounts
      const testAmounts = [10000, 25000, 33333, 99999, 150000, 789456];

      for (const baseAmountCents of testAmounts) {
        const fees = calculateMilestoneFees(baseAmountCents);

        expect(fees.clientChargedCents).toBe(
          fees.baseAmountCents + fees.clientFeeCents
        );
        expect(fees.strategistPayoutCents).toBe(
          fees.baseAmountCents - fees.strategistFeeCents
        );
        expect(fees.platformRevenueCents).toBe(
          fees.clientFeeCents + fees.strategistFeeCents
        );

        // Core Accounting Invariant
        expect(fees.clientChargedCents).toBe(
          fees.strategistPayoutCents + fees.platformRevenueCents
        );
      }
    });

    it("computes hourly fees accurately based on hours and hourly rate", () => {
      const fees = calculateHourlyFees(15.5, 20000); // 15.5 hours @ $200/hr ($3,100 base = 310,000 cents)
      expect(fees.baseAmountCents).toBe(310000);
      expect(fees.clientFeeCents).toBe(Math.round(310000 * 0.08)); // 24800 cents = $248
      expect(fees.strategistFeeCents).toBe(Math.round(310000 * 0.1)); // 31000 cents = $310
      expect(fees.clientChargedCents).toBe(
        fees.strategistPayoutCents + fees.platformRevenueCents
      );
    });
  });

  describe("Ledger Entry Balancing Validator", () => {
    it("accepts valid balanced entries where sum(DEBIT) === sum(CREDIT)", () => {
      const entries = [
        {
          account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
          direction: "DEBIT",
          amount: 108000,
        },
        {
          account: LEDGER_ACCOUNTS.ESCROW,
          direction: "CREDIT",
          amount: 100000,
        },
        {
          account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
          direction: "CREDIT",
          amount: 8000,
        },
      ];

      const result = validateBalancedEntries(entries);
      expect(result.isBalanced).toBe(true);
      expect(result.totalDebits).toBe(108000);
      expect(result.totalCredits).toBe(108000);
    });

    it("rejects unbalanced entries with an error", () => {
      const unbalanced = [
        {
          account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
          direction: "DEBIT",
          amount: 108000,
        },
        {
          account: LEDGER_ACCOUNTS.ESCROW,
          direction: "CREDIT",
          amount: 100000,
        },
      ];

      expect(() => validateBalancedEntries(unbalanced)).toThrow(/unbalanced/i);
    });

    it("rejects entries with fewer than 2 records", () => {
      expect(() =>
        validateBalancedEntries([
          {
            account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
            direction: "DEBIT",
            amount: 100,
          },
        ])
      ).toThrow(/at least two entries/i);
    });

    it("rejects entries with invalid accounts or directions", () => {
      expect(() =>
        validateBalancedEntries([
          { account: "INVALID_ACCOUNT", direction: "DEBIT", amount: 100 },
          {
            account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
            direction: "CREDIT",
            amount: 100,
          },
        ])
      ).toThrow(/invalid ledger account/i);

      expect(() =>
        validateBalancedEntries([
          {
            account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
            direction: "INVALID_DIR",
            amount: 100,
          },
          { account: LEDGER_ACCOUNTS.ESCROW, direction: "CREDIT", amount: 100 },
        ])
      ).toThrow(/invalid ledger direction/i);
    });

    it("rejects entries with non-positive amounts", () => {
      expect(() =>
        validateBalancedEntries([
          {
            account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
            direction: "DEBIT",
            amount: -50,
          },
          { account: LEDGER_ACCOUNTS.ESCROW, direction: "CREDIT", amount: -50 },
        ])
      ).toThrow(/positive integer/i);
    });
  });

  describe("Pre-Built Ledger Flows Balance Invariants", () => {
    it("milestone funding flow balances to zero", () => {
      const fees = calculateMilestoneFees(250000); // $2,500 milestone
      const entries = [
        {
          account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
          direction: "DEBIT",
          amount: fees.clientChargedCents,
        },
        {
          account: LEDGER_ACCOUNTS.ESCROW,
          direction: "CREDIT",
          amount: fees.baseAmountCents,
        },
        {
          account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
          direction: "CREDIT",
          amount: fees.clientFeeCents,
        },
      ];
      expect(validateBalancedEntries(entries).isBalanced).toBe(true);
    });

    it("escrow release flow balances to zero", () => {
      const fees = calculateMilestoneFees(250000);
      const entries = [
        {
          account: LEDGER_ACCOUNTS.ESCROW,
          direction: "DEBIT",
          amount: fees.baseAmountCents,
        },
        {
          account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
          direction: "CREDIT",
          amount: fees.strategistPayoutCents,
        },
        {
          account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
          direction: "CREDIT",
          amount: fees.strategistFeeCents,
        },
      ];
      expect(validateBalancedEntries(entries).isBalanced).toBe(true);
    });

    it("retainer payment flow balances to zero", () => {
      const fees = calculateRetainerFees(800000); // $8,000 monthly retainer
      const entries = [
        {
          account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
          direction: "DEBIT",
          amount: fees.clientChargedCents,
        },
        {
          account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
          direction: "CREDIT",
          amount: fees.strategistPayoutCents,
        },
        {
          account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
          direction: "CREDIT",
          amount: fees.platformRevenueCents,
        },
      ];
      expect(validateBalancedEntries(entries).isBalanced).toBe(true);
    });

    it("hourly payment flow balances to zero", () => {
      const fees = calculateHourlyFees(20, 25000); // 20 hours @ $250
      const entries = [
        {
          account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
          direction: "DEBIT",
          amount: fees.clientChargedCents,
        },
        {
          account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
          direction: "CREDIT",
          amount: fees.strategistPayoutCents,
        },
        {
          account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
          direction: "CREDIT",
          amount: fees.platformRevenueCents,
        },
      ];
      expect(validateBalancedEntries(entries).isBalanced).toBe(true);
    });

    it("strategist payout flow balances to zero", () => {
      const payoutAmount = 450000; // $4,500 withdrawal
      const entries = [
        {
          account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
          direction: "DEBIT",
          amount: payoutAmount,
        },
        {
          account: LEDGER_ACCOUNTS.PAYOUTS,
          direction: "CREDIT",
          amount: payoutAmount,
        },
      ];
      expect(validateBalancedEntries(entries).isBalanced).toBe(true);
    });

    it("refund flow balances to zero", () => {
      const fees = calculateMilestoneFees(100000);
      const entries = [
        {
          account: LEDGER_ACCOUNTS.ESCROW,
          direction: "DEBIT",
          amount: fees.baseAmountCents,
        },
        {
          account: LEDGER_ACCOUNTS.PLATFORM_REVENUE,
          direction: "DEBIT",
          amount: fees.clientFeeCents,
        },
        {
          account: LEDGER_ACCOUNTS.REFUNDS,
          direction: "CREDIT",
          amount: fees.clientChargedCents,
        },
      ];
      expect(validateBalancedEntries(entries).isBalanced).toBe(true);
    });

    it("dispute resolution split flow balances to zero", () => {
      const escrowBase = 200000; // $2,000 in escrow
      const clientRefund = 120000; // 60% to client ($1,200)
      const strategistPayout = 80000; // 40% to strategist ($800)

      const entries = [
        {
          account: LEDGER_ACCOUNTS.ESCROW,
          direction: "DEBIT",
          amount: escrowBase,
        },
        {
          account: LEDGER_ACCOUNTS.REFUNDS,
          direction: "CREDIT",
          amount: clientRefund,
        },
        {
          account: LEDGER_ACCOUNTS.STRATEGIST_PAYABLE,
          direction: "CREDIT",
          amount: strategistPayout,
        },
      ];
      expect(validateBalancedEntries(entries).isBalanced).toBe(true);
    });
  });

  describe("Idempotency Execution Rules", () => {
    it("avoids duplicate execution when idempotency key is already recorded", async () => {
      const mockExistingEntries = [
        {
          id: "le-1",
          transactionId: "txn-1",
          idempotencyKey: "test-idem-key-1",
        },
        {
          id: "le-2",
          transactionId: "txn-1",
          idempotencyKey: "test-idem-key-1",
        },
      ];

      const mockTx = {
        ledgerEntry: {
          findMany: vi.fn().mockResolvedValue(mockExistingEntries),
          create: vi.fn(),
        },
      };

      const result = await recordLedgerTransaction({
        transactionId: "txn-new",
        idempotencyKey: "test-idem-key-1",
        refType: "TEST",
        entries: [
          {
            account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
            direction: "DEBIT",
            amount: 100,
          },
          { account: LEDGER_ACCOUNTS.ESCROW, direction: "CREDIT", amount: 100 },
        ],
        prismaClient: mockTx,
      });

      expect(result.idempotentReplay).toBe(true);
      expect(result.transactionId).toBe("txn-1");
      expect(mockTx.ledgerEntry.create).not.toHaveBeenCalled();
    });

    it("inserts entries when idempotency key is new", async () => {
      const mockTx = {
        ledgerEntry: {
          findMany: vi.fn().mockResolvedValue([]),
          create: vi
            .fn()
            .mockImplementation(({ data }) =>
              Promise.resolve({ id: `le-${Math.random()}`, ...data })
            ),
        },
        engagement: {
          update: vi.fn(),
        },
      };

      const result = await recordLedgerTransaction({
        transactionId: "txn-new-999",
        idempotencyKey: "test-idem-key-fresh",
        refType: "TEST",
        entries: [
          {
            account: LEDGER_ACCOUNTS.CLIENT_FUNDS,
            direction: "DEBIT",
            amount: 500,
          },
          { account: LEDGER_ACCOUNTS.ESCROW, direction: "CREDIT", amount: 500 },
        ],
        prismaClient: mockTx,
      });

      expect(result.idempotentReplay).toBe(false);
      expect(result.transactionId).toBe("txn-new-999");
      expect(mockTx.ledgerEntry.create).toHaveBeenCalledTimes(2);
    });
  });
});
