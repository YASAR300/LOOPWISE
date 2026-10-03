import React from "react";
import {
  DollarSign,
  ShieldCheck,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = {
  title: "Earnings & Escrow Payouts | Loopwise",
  description:
    "Track your fractional CAIO earnings, pending milestone escrow releases, and bank payouts.",
};

const PAYOUTS = [
  {
    id: "pay-1",
    client: "CareWave Health",
    milestone: "Phase 1: SOP Discovery & LangGraph Scaffold",
    amount: "$7,000.00",
    paidAt: "2026-09-25",
    status: "paid",
  },
  {
    id: "pay-2",
    client: "Apex Advisory Partners",
    milestone: "Phase 1: Dataroom OCR Pipeline",
    amount: "$8,500.00",
    paidAt: "2026-09-15",
    status: "paid",
  },
];

export default function StrategistEarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Earnings & Escrow Payouts
        </h1>
        <p className="text-xs text-ink-3">
          All client payments are held in insured milestone escrow and disbursed
          automatically upon approval.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="shadow-2xs rounded-xl border border-line bg-panel p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
            Total Earned
          </span>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            $29,500.00
          </p>
          <p className="mt-1 text-2xs text-[#1E7A3C] dark:text-[#34D399]">
            100% verified release rate
          </p>
        </div>
        <div className="shadow-2xs rounded-xl border border-line bg-panel p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
            In Escrow (Pending Review)
          </span>
          <p className="mt-2 font-display text-2xl font-bold text-brand-indigo">
            $15,500.00
          </p>
          <p className="mt-1 text-2xs text-ink-3">
            Protected under client sign-off
          </p>
        </div>
        <div className="shadow-2xs rounded-xl border border-line bg-panel p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
            Next Scheduled Payout
          </span>
          <p className="mt-2 font-display text-2xl font-bold text-ink">
            $7,000.00
          </p>
          <p className="mt-1 text-2xs text-ink-3">Est. release: Oct 15, 2026</p>
        </div>
      </div>

      <div className="shadow-2xs overflow-hidden rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-ink">
            Disbursement History
          </h2>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-canvas text-2xs font-semibold uppercase tracking-wider text-ink-3">
            <tr>
              <th className="px-5 py-3">Client</th>
              <th className="px-4 py-3">Milestone Deliverable</th>
              <th className="px-4 py-3">Disbursed Date</th>
              <th className="px-4 py-3 text-right">Net Amount</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PAYOUTS.map((p) => (
              <tr key={p.id} className="hover:bg-canvas/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-ink">{p.client}</td>
                <td className="px-4 py-3.5 text-ink-2">{p.milestone}</td>
                <td className="px-4 py-3.5 font-mono text-2xs text-ink-3">
                  {p.paidAt}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-ink">
                  {p.amount}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <StatusPill status="success" label="Transferred" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
