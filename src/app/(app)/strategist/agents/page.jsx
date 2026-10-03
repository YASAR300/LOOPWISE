import React from "react";
import Link from "next/link";
import { Bot, Plus, TrendingUp, CheckCircle } from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = {
  title: "Managed Agent Swarms | Loopwise",
  description:
    "Monitor autonomous agent swarms you have architected and deployed for clients.",
};

const AGENTS = [
  {
    id: "ag-strat-1",
    name: "CareWave Prior Auth Parser",
    client: "CareWave Health",
    runtime: "LangGraph + Claude 3.5 Sonnet",
    tasksCompleted: "14,210",
    uptime: "99.9%",
    status: "active",
  },
  {
    id: "ag-strat-2",
    name: "Apex Due Diligence Contract Classifier",
    client: "Apex Advisory Partners",
    runtime: "LlamaIndex + GPT-4o",
    tasksCompleted: "8,450",
    uptime: "99.6%",
    status: "active",
  },
];

export default function StrategistAgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Deployed Autonomous Agents
          </h1>
          <p className="text-xs text-ink-3">
            Autonomous agent workflows under your active governance and SLA
            maintenance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="shadow-2xs space-y-4 rounded-xl border border-line bg-panel p-5 transition-all hover:border-line-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <IdentityTile label={agent.name} size="md" colorIndex={0} />
                <div>
                  <h3 className="font-display text-sm font-bold text-ink">
                    {agent.name}
                  </h3>
                  <p className="text-2xs text-ink-3">{agent.client}</p>
                </div>
              </div>
              <StatusPill status="active" label="Running" />
            </div>

            <div className="space-y-1.5 rounded-lg bg-canvas p-3 text-xs">
              <div className="flex justify-between text-2xs text-ink-3">
                <span>Architecture</span>
                <span className="font-mono text-ink">{agent.runtime}</span>
              </div>
              <div className="flex justify-between text-2xs text-ink-3">
                <span>Total Executions</span>
                <span className="font-mono font-semibold text-ink">
                  {agent.tasksCompleted}
                </span>
              </div>
              <div className="flex justify-between text-2xs text-ink-3">
                <span>SLA Uptime</span>
                <span className="font-mono font-semibold text-[#1E7A3C] dark:text-[#34D399]">
                  {agent.uptime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
