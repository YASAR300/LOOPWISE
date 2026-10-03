import React from "react";
import { AlertTriangle, ShieldCheck, Check, X } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = {
  title: "Content & Audit Moderation | Loopwise Admin",
  description:
    "Platform audit log, flagged messages, and escrow dispute triage.",
};

const FLAGGED_ITEMS = [
  {
    id: "flag-1",
    type: "Off-platform payment mention",
    source: "Direct Message",
    flaggedUser: "guest_buyer_89",
    reason: "Attempted to share personal wire info before milestone funded.",
    timestamp: "10 mins ago",
    status: "pending",
  },
  {
    id: "flag-2",
    type: "Unverified credentials",
    source: "Strategist Profile",
    flaggedUser: "dr_ai_consulting",
    reason: "Claimed ISO 42001 certification pending document verification.",
    timestamp: "2 hours ago",
    status: "investigating",
  },
];

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Moderation & Platform Safety
        </h1>
        <p className="text-xs text-ink-3">
          Automated heuristic safety triggers and flagged interactions across
          messages and briefs.
        </p>
      </div>

      <div className="shadow-2xs overflow-hidden rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-ink">
            Flagged Activity Queue
          </h2>
        </div>
        <div className="divide-y divide-line">
          {FLAGGED_ITEMS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink">
                    {item.type}
                  </span>
                  <span className="rounded bg-canvas px-2 py-0.5 text-2xs text-ink-3">
                    {item.source}
                  </span>
                  <StatusPill
                    status={item.status === "pending" ? "warning" : "neutral"}
                    label={item.status}
                  />
                </div>
                <p className="text-xs text-ink-2">{item.reason}</p>
                <p className="font-mono text-2xs text-ink-3">
                  Account: {item.flaggedUser} · {item.timestamp}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink hover:border-line-2"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-accent-hover"
                >
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
