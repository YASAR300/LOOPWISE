import React from "react";
import Link from "next/link";
import { GitBranch, CheckCircle2, Clock } from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = {
  title: "Active Engagements | Loopwise",
  description:
    "Manage client contracts, milestone reviews, and agent deliverables.",
};

const ENGAGEMENTS = [
  {
    id: "eng-1",
    client: "CareWave Health",
    title: "Prior Auth Clinical NLP Swarm",
    retainer: "$14,000 / mo",
    status: "active",
    nextMilestone: "SOP Signoff & EHR Test (Oct 15)",
  },
  {
    id: "eng-2",
    client: "Apex Advisory Partners",
    title: "M&A Dataroom Document Extraction",
    retainer: "$15,000 / mo",
    status: "active",
    nextMilestone: "Multi-Agent Evaluation Audit (Oct 22)",
  },
];

export default function StrategistEngagementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Active Engagements
        </h1>
        <p className="text-xs text-ink-3">
          Manage your ongoing fractional engagements and milestone deliveries.
        </p>
      </div>

      <div className="space-y-4">
        {ENGAGEMENTS.map((eng) => (
          <div
            key={eng.id}
            className="shadow-2xs space-y-3 rounded-xl border border-line bg-panel p-5 transition-all hover:border-line-2"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <IdentityTile label={eng.client} size="md" colorIndex={1} />
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    {eng.title}
                  </h3>
                  <p className="text-xs text-ink-3">{eng.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-ink">
                  {eng.retainer}
                </span>
                <StatusPill status="active" label="In Progress" />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-canvas px-3.5 py-2 text-xs text-ink-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
              <span>
                Upcoming Milestone:{" "}
                <strong className="text-ink">{eng.nextMilestone}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
