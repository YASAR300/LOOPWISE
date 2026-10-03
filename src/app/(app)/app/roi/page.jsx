import React from "react";
import {
  TrendingUp,
  Clock,
  DollarSign,
  Bot,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { WarmTelemetryChart } from "@/components/ui/warm-telemetry-chart";
import { StatusPill } from "@/components/ui/status-pill";
import { IdentityTile } from "@/components/ui/identity-tile";

export const metadata = {
  title: "ROI Telemetry & Autonomous Agent Savings",
  description:
    "Real-time cost savings, hours automated, and agent execution telemetry for Loopwise deployments.",
};

const TELEMETRY_METRICS = [
  {
    label: "Net Capital Saved",
    value: "$48,250",
    change: "+18.4% vs last mo",
    positive: true,
    icon: DollarSign,
    colorIndex: 0,
  },
  {
    label: "Hours Automated",
    value: "1,420 hrs",
    change: "+240 hrs this week",
    positive: true,
    icon: Clock,
    colorIndex: 1,
  },
  {
    label: "Active Agent Swarms",
    value: "8 Agents",
    change: "99.8% uptime SLA",
    positive: true,
    icon: Bot,
    colorIndex: 2,
  },
  {
    label: "Avg Execution Cost",
    value: "$0.042 / task",
    change: "-12% model token cost",
    positive: true,
    icon: Zap,
    colorIndex: 3,
  },
];

const AGENT_PERFORMANCE = [
  {
    id: "ag-1",
    name: "Prior Authorization Triage Swarm",
    department: "Clinical Ops",
    runs: "12,480",
    hoursSaved: "480 hrs",
    savedCost: "$18,200",
    status: "active",
  },
  {
    id: "ag-2",
    name: "Vendor Reconciliation & OCR",
    department: "Finance",
    runs: "8,920",
    hoursSaved: "340 hrs",
    savedCost: "$14,500",
    status: "active",
  },
  {
    id: "ag-3",
    name: "Enterprise RFQ Inbound Scraper",
    department: "Sales Ops",
    runs: "5,310",
    hoursSaved: "210 hrs",
    savedCost: "$8,900",
    status: "active",
  },
  {
    id: "ag-4",
    name: "SOC2 Compliance Evidence Collector",
    department: "InfoSec",
    runs: "3,110",
    hoursSaved: "390 hrs",
    savedCost: "$6,650",
    status: "active",
  },
];

export default function RoiTelemetryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            ROI Telemetry & Efficiency
          </h1>
          <p className="text-xs text-ink-3">
            Audited financial returns, automated labor hours, and autonomous
            workflow executions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill
            status="active"
            label="Telemetry Live"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TELEMETRY_METRICS.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="shadow-2xs rounded-xl border border-line bg-panel p-4 transition-all hover:border-line-2"
            >
              <div className="flex items-center justify-between">
                <IdentityTile
                  label={metric.label}
                  size="sm"
                  colorIndex={metric.colorIndex}
                />
                <span className="inline-flex items-center text-2xs font-semibold text-[#1E7A3C] dark:text-[#34D399]">
                  {metric.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xs font-medium uppercase tracking-wider text-ink-3">
                  {metric.label}
                </p>
                <p className="font-display text-xl font-bold text-ink">
                  {metric.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry Chart */}
      <div className="shadow-2xs rounded-xl border border-line bg-panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              Hours Saved & Cost Reduction (30 Days)
            </h2>
            <p className="text-2xs text-ink-3">
              Autonomous agent executions aggregated daily across all connected
              workflows
            </p>
          </div>
          <div className="flex items-center gap-2 text-2xs text-ink-3">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-accent" />
            <span>Actual Saved Hours</span>
          </div>
        </div>
        <WarmTelemetryChart />
      </div>

      {/* Per-Agent Breakdown */}
      <div className="shadow-2xs overflow-hidden rounded-xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="font-display text-sm font-bold text-ink">
            Workflow & Agent Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-canvas text-2xs font-semibold uppercase tracking-wider text-ink-3">
              <tr>
                <th className="px-5 py-3">Agent Swarm</th>
                <th className="px-4 py-3">Team / Dept</th>
                <th className="px-4 py-3 text-right">Executions</th>
                <th className="px-4 py-3 text-right">Hours Saved</th>
                <th className="px-4 py-3 text-right">Audited ROI</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {AGENT_PERFORMANCE.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-canvas/50 transition-colors"
                >
                  <td className="flex items-center gap-2 px-5 py-3.5 font-medium text-ink">
                    <IdentityTile label={item.name} size="xs" colorIndex={0} />
                    <span>{item.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-ink-2">{item.department}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-ink-2">
                    {item.runs}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-semibold text-ink">
                    {item.hoursSaved}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-[#1E7A3C] dark:text-[#34D399]">
                    {item.savedCost}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <StatusPill status="active" label="Running" />
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
