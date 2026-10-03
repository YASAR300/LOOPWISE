import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Target, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "About Loopwise | The Autonomous AI Leadership Marketplace",
  description:
    "Learn about Loopwise's mission to bridge executive AI strategy with deterministic engineering and verified ROI.",
};

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              OUR MISSION
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Building the operating system for fractional AI leadership
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            We believe enterprise AI fails not from model limitations, but from
            the gap between strategy and execution. Loopwise pairs world-class
            leaders with deterministic workflow tooling.
          </p>
        </div>

        <div className="warm-card shadow-soft mb-12 space-y-8 p-8 text-sm leading-relaxed text-ink-2 sm:p-12 sm:text-base">
          <div>
            <h2 className="mb-3 font-display text-xl font-bold text-ink sm:text-2xl">
              Why We Founded Loopwise
            </h2>
            <p>
              In 2026, enterprise companies are overwhelmed by AI hype.
              Generalist consulting firms charge hundreds of thousands of
              dollars to produce slides, while freelance directories offer
              junior developers without enterprise context.
            </p>
            <p className="mt-3">
              Loopwise was designed from the ground up as a new model: elite
              Fractional Heads of AI who don&apos;t just advise—they ingest SOPs
              into our proprietary Workflow Mapper, configure multi-agent state
              machines, install deterministic guardrails, and prove hard ROI
              before escrow release.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3">
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent-soft text-brand-accent">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-bold text-ink">
                Execution-First
              </h3>
              <p className="mt-1 text-xs text-ink-3">
                We measure success in hours automated and error reduction, not
                billable hours logged.
              </p>
            </div>
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas-2 text-forest">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-bold text-ink">
                Governed Safety
              </h3>
              <p className="mt-1 text-xs text-ink-3">
                NIST AI RMF 1.0 and EU AI Act compliance are built into every
                agent contract.
              </p>
            </div>
            <div>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas-2 text-ink">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h3 className="font-display text-sm font-bold text-ink">
                Zero-Risk Escrow
              </h3>
              <p className="mt-1 text-xs text-ink-3">
                Client milestone funds stay locked until verified code and
                telemetry are delivered.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="shadow-soft rounded-[28px] border border-line bg-canvas-2 p-8 text-center sm:p-10">
          <h2 className="mb-3 font-display text-2xl font-bold text-ink">
            Partner with an enterprise AI leader
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-sm text-ink-2">
            Review vetted Fractional Heads of AI ready to deploy to your team
            within 48 hours.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup?role=client"
              className="btn-primary-orange flex items-center gap-2 px-8 py-3 text-sm font-semibold shadow-sm"
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="btn-secondary-outline px-8 py-3 text-sm font-semibold"
            >
              <span>Contact our team</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
