import React from "react";
import Link from "next/link";
import { Layers, Plus, ArrowUpRight } from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = {
  title: "My Submitted Proposals | Loopwise",
  description: "Track status of your submitted client automation proposals.",
};

const PROPOSALS = [
  {
    id: "prop-1",
    client: "CareWave Health",
    title: "Prior Auth Agentic Workflow & HIPAA Architecture",
    bid: "$22,000",
    status: "in_review",
    submittedAt: "2026-10-01",
  },
  {
    id: "prop-2",
    client: "Apex Advisory Partners",
    title: "M&A Dataroom Document Extraction Swarm",
    bid: "$18,500",
    status: "accepted",
    submittedAt: "2026-09-28",
  },
];

export default function StrategistProposalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Proposals
          </h1>
          <p className="text-xs text-ink-3">
            Review your outstanding bids, terms, and client responses.
          </p>
        </div>
        <Link
          href="/strategist/proposals/new"
          className="btn-primary-orange inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Proposal</span>
        </Link>
      </div>

      <div className="shadow-2xs overflow-hidden rounded-xl border border-line bg-panel">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line bg-canvas text-2xs font-semibold uppercase tracking-wider text-ink-3">
            <tr>
              <th className="px-5 py-3">Client</th>
              <th className="px-4 py-3">Proposal Title</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">Proposed Escrow</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PROPOSALS.map((p) => (
              <tr key={p.id} className="hover:bg-canvas/50 transition-colors">
                <td className="flex items-center gap-2 px-5 py-3.5 font-medium text-ink">
                  <IdentityTile label={p.client} size="xs" colorIndex={1} />
                  <span>{p.client}</span>
                </td>
                <td className="px-4 py-3.5 font-medium text-ink-2">
                  {p.title}
                </td>
                <td className="px-4 py-3.5 font-mono text-2xs text-ink-3">
                  {p.submittedAt}
                </td>
                <td className="px-4 py-3.5 text-right font-mono font-bold text-ink">
                  {p.bid}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <StatusPill
                    status={p.status === "accepted" ? "success" : "warning"}
                    label={p.status === "accepted" ? "Accepted" : "In Review"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
