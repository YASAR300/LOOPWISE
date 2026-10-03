import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  UserCheck,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "How It Works | Loopwise",
  description:
    "Learn how Loopwise matches enterprise teams with vetted Fractional Heads of AI and deploys governed autonomous agents.",
};

const STAGES = [
  {
    num: "01",
    title: "Workflow Mapping & SOP Ingestion",
    icon: GitBranch,
    tileBg: "bg-tile-violet",
    textColor: "text-white",
    description:
      "Your Fractional Head of AI conducts discovery interviews and ingests existing Standard Operating Procedures into the Loopwise Workflow Mapper. Every manual touchpoint is scored for automation feasibility, token expenditure, and error vulnerability.",
    deliverable:
      "Scored Automation Opportunity Matrix & Target Agent Architecture",
  },
  {
    num: "02",
    title: "Technical Stack Matching within 48h",
    icon: UserCheck,
    tileBg: "bg-tile-mint",
    textColor: "text-ink",
    description:
      "We match your verified blueprint with specialized automation architects who have deployed similar multi-agent swarms (LangGraph, CrewAI, AutoGen) across your legacy tooling (SAP, Salesforce, Slack, Postgres).",
    deliverable:
      "Shortlist of 2-3 vetted leaders with architecture defense records",
  },
  {
    num: "03",
    title: "Escrow-Protected Sandbox Deployment",
    icon: ShieldAlert,
    tileBg: "bg-tile-coral",
    textColor: "text-white",
    description:
      "All milestones are held in escrow. Strategists build state machines, integrate PII masking proxies, and run red-team evaluation suites to ensure zero hallucination drift before production cutover.",
    deliverable:
      "Hardened agent repo, deterministic guardrails & kill-switches",
  },
  {
    num: "04",
    title: "Real-Time Telemetry & Executive ROI Proof",
    icon: TrendingUp,
    tileBg: "bg-tile-sun",
    textColor: "text-ink",
    description:
      "Once live, agents stream health telemetry directly into your Loopwise dashboard. Track cumulative hours saved, latency profiles, and compliance scorecards ready for internal risk and board audits.",
    deliverable: "Live executive dashboard & NIST AI RMF compliance scorecard",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              OPERATIONAL PLAYBOOK
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            How Loopwise delivers production autonomous agents
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            From fragmented documentation to hardened multi-agent swarms with
            board-ready ROI telemetry and guaranteed talent escrow.
          </p>
        </div>

        {/* 4 Stages */}
        <div className="mb-20 space-y-8">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div key={stage.num} className="warm-card shadow-soft p-6 sm:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div
                    className={`h-12 w-12 rounded-xl ${stage.tileBg} ${stage.textColor} shadow-2xs flex shrink-0 items-center justify-center font-mono text-base font-bold`}
                  >
                    {stage.num}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0 text-brand-accent" />
                      <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                        {stage.title}
                      </h2>
                    </div>

                    <p className="text-sm leading-relaxed text-ink-2 sm:text-base">
                      {stage.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-forest">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Deliverable: {stage.deliverable}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="shadow-soft rounded-[28px] border border-line bg-canvas-2 p-8 text-center sm:p-12">
          <h2 className="mb-3 font-display text-2xl font-bold text-ink sm:text-3xl">
            Ready to map your internal processes?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-ink-2 sm:text-base">
            Tell us about your team and get matched with top 3% Fractional Heads
            of AI in under 48 hours.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup?role=client"
              className="btn-primary-orange flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold shadow-sm"
            >
              <span>Hire an AI leader</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup?role=strategist"
              className="btn-secondary-outline flex items-center justify-center px-8 py-3.5 text-sm font-semibold"
            >
              <span>Apply as a strategist</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
