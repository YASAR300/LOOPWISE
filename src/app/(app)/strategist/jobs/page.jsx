import React from "react";
import Link from "next/link";
import { Briefcase, ArrowRight, DollarSign, Clock, MapPin } from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { ToolChip } from "@/components/ui/tool-chip";
import { StatusPill } from "@/components/ui/status-pill";

export const metadata = {
  title: "Client Automation Opportunities | Loopwise",
  description:
    "Browse high-intent client workflow briefs matching your fractional CAIO skill set.",
};

const JOBS = [
  {
    id: "job-1",
    title: "Healthcare EHR Prior Auth & Clinical NLP Pipeline",
    client: "CareWave Health",
    budget: "$18,000 - $25,000",
    timeline: "6 weeks",
    skills: ["Healthcare & HIPAA EHR", "Claude 3.5 Sonnet", "LlamaIndex"],
    postedAt: "2 hours ago",
    proposalsCount: 2,
  },
  {
    id: "job-2",
    title: "Autonomous Legal M&A Due Diligence Dataroom Triage",
    client: "Apex Advisory Partners",
    budget: "$15,000 - $22,000",
    timeline: "4 weeks",
    skills: ["Legal Document Discovery", "LangGraph", "Claude 3.7 Sonnet"],
    postedAt: "5 hours ago",
    proposalsCount: 4,
  },
  {
    id: "job-3",
    title: "Global Supply Chain Automated Inventory Reconciliation",
    client: "Logix Portals Inc",
    budget: "$12,000 - $18,000",
    timeline: "8 weeks",
    skills: ["Supply Chain & Logistics", "AutoGen", "n8n"],
    postedAt: "1 day ago",
    proposalsCount: 1,
  },
];

export default function StrategistJobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Client Brief Opportunities
          </h1>
          <p className="text-xs text-ink-3">
            Vetted enterprises looking for Fractional Heads of AI & Automation.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {JOBS.map((job) => (
          <div
            key={job.id}
            className="shadow-2xs space-y-4 rounded-xl border border-line bg-panel p-5 transition-all hover:border-line-2"
          >
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3">
                <IdentityTile label={job.client} size="md" colorIndex={0} />
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    {job.title}
                  </h3>
                  <p className="text-xs text-ink-3">
                    {job.client} · Posted {job.postedAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill
                  status="neutral"
                  label={`${job.proposalsCount} proposals`}
                />
                <Link
                  href={`/strategist/proposals/new?jobId=${job.id}`}
                  className="btn-primary-orange inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                >
                  <span>Submit proposal</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-2">
              <span className="font-mono font-semibold text-ink">
                {job.budget}
              </span>
              <span>·</span>
              <span>{job.timeline}</span>
              <span>·</span>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded bg-canvas px-2 py-0.5 text-2xs font-medium text-ink-2"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
