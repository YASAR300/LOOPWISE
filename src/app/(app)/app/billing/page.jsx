import React from "react";
import {
  CreditCard,
  ShieldCheck,
  DollarSign,
  ArrowUpRight,
  Download,
  Plus,
} from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import { IdentityTile } from "@/components/ui/identity-tile";

export const metadata = {
  title: "Billing & Milestone Escrow",
  description:
    "Manage funded escrow milestones, payment methods, and automated billing invoices on Loopwise.",
};

const ESCROW_MILESTONES = [
  {
    id: "esc-101",
    engagement: "Healthcare Clinical Triage Pipeline",
    strategist: "Maya Patel",
    amount: "$7,000",
    status: "funded",
    fundedAt: "2026-09-18",
    dueAt: "2026-10-15",
  },
  {
    id: "esc-102",
    engagement: "Autonomous Legal Discovery Agent Swarm",
    strategist: "Tariq Al-Mansoor",
    amount: "$8,500",
    status: "funded",
    fundedAt: "2026-09-22",
    dueAt: "2026-10-30",
  },
  {
    id: "esc-103",
    engagement: "Supply Chain Reconciliation Bots",
    strategist: "Kenji Sato",
    amount: "$6,000",
    status: "released",
    fundedAt: "2026-08-10",
    dueAt: "2026-09-10",
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Billing & Milestone Escrow
          </h1>
          <p className="text-xs text-ink-3">
            Milestone payments are locked securely in escrow and released only
            upon your signed sign-off.
          </p>
        </div>
        <button
          type="button"
          className="shadow-2xs inline-flex items-center gap-1.5 rounded-lg bg-brand-indigo px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-indigo-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Fund Milestone</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="shadow-2xs rounded-xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-2xs font-semibold uppercase tracking-wider">
              Locked in Escrow
            </span>
            <ShieldCheck className="h-4 w-4 text-[#1E7A3C] dark:text-[#34D399]" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            $15,500.00
          </p>
          <p className="mt-1 text-2xs text-ink-3">
            Protected across 2 active engagements
          </p>
        </div>

        <div className="shadow-2xs rounded-xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-2xs font-semibold uppercase tracking-wider">
              Lifetime Disbursed
            </span>
            <DollarSign className="h-4 w-4 text-brand-accent" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            $42,000.00
          </p>
          <p className="mt-1 text-2xs text-ink-3">
            4 approved completed milestones
          </p>
        </div>

        <div className="shadow-2xs rounded-xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between text-ink-3">
            <span className="text-2xs font-semibold uppercase tracking-wider">
              Default Payment Method
            </span>
            <CreditCard className="h-4 w-4 text-brand-indigo" />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">
            Mastercard ending in •••• 4821
          </p>
          <p className="mt-1 text-2xs text-ink-3">
            Expires 09/2028 · Stripe Verified
          </p>
        </div>
      </div>

      {/* Escrow Ledger */}
      <div className="shadow-2xs overflow-hidden rounded-xl border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-ink">
            Escrow Contracts & Milestones
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-2xs font-medium text-ink-3 hover:text-ink"
          >
            <Download className="h-3 w-3" />
            <span>Export CSV</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-canvas text-2xs font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-5 py-3">Engagement</th>
                <th className="px-4 py-3">Strategist</th>
                <th className="px-4 py-3">Funded Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-right">Escrow Amount</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ESCROW_MILESTONES.map((m) => (
                <tr key={m.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="flex items-center gap-2 px-5 py-3.5 font-medium text-ink">
                    <IdentityTile
                      label={m.engagement}
                      size="xs"
                      colorIndex={1}
                    />
                    <span>{m.engagement}</span>
                  </td>
                  <td className="px-4 py-3.5 text-ink-2">{m.strategist}</td>
                  <td className="px-4 py-3.5 font-mono text-2xs text-ink-3">
                    {m.fundedAt}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-2xs text-ink-3">
                    {m.dueAt}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-ink">
                    {m.amount}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <StatusPill
                      status={m.status === "funded" ? "active" : "success"}
                      label={
                        m.status === "funded" ? "Locked in Escrow" : "Disbursed"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
