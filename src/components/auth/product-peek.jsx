"use client";

import React from "react";
import {
  Bot,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { ToolChipRow } from "@/components/ui/tool-chip";
import { StatusPill } from "@/components/ui/status-pill";

export function ProductPeek({
  stats = {
    approvedStrategists: 14,
    hoursAutomated: 32730,
    satisfactionPct: 99.4,
  },
  className = "",
}) {
  return (
    <div
      className={`bg-panel/95 p-4.5 shadow-warm select-none space-y-3.5 rounded-2xl border border-line backdrop-blur-md ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-accent/10 text-xs font-bold text-brand-accent">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight text-ink">
            Platform Production Status
          </span>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Live Telemetry
        </span>
      </div>

      {/* Real Stats Row */}
      <div className="grid grid-cols-2 gap-2 text-left">
        <div className="rounded-xl border border-line bg-panel-2 p-2.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
            Vetted Heads of AI
          </p>
          <p className="mt-0.5 font-mono text-base font-bold text-ink">
            {stats.approvedStrategists}+ approved
          </p>
        </div>
        <div className="rounded-xl border border-line bg-panel-2 p-2.5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
            Verified Net Hours
          </p>
          <p className="mt-0.5 font-mono text-base font-bold text-ink">
            {stats.hoursAutomated.toLocaleString()} hrs
          </p>
        </div>
      </div>

      {/* Example Scored Workflow Row */}
      <div className="bg-canvas/80 space-y-1.5 rounded-xl border border-line p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <IdentityTile name="AP Invoice Triage" id="ap-triage" size="sm" />
            <span className="truncate text-xs font-semibold text-ink">
              Accounts Payable Multi-Agent
            </span>
          </div>
          <StatusPill status="complete" showIcon={false} />
        </div>
        <div className="flex items-center justify-between pt-0.5 text-[11px] text-ink-3">
          <ToolChipRow
            tools={["n8n", "OpenAI", "Postgres"]}
            size="sm"
            max={3}
          />
          <span className="font-mono">99.8% uptime</span>
        </div>
      </div>
    </div>
  );
}
