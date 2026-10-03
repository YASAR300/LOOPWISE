import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  DollarSign,
  GitBranch,
  Users,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "For Strategists | Loopwise",
  description:
    "Apply as a vetted Fractional Head of AI & Automation. Partner with pre-qualified enterprise sponsors with guaranteed escrow disbursements.",
};

export default function ForStrategistsPage() {
  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              ELITE TECHNICAL BENCH
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Lead enterprise AI transformation on your own terms
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            Loopwise connects senior automation architects and Fractional CAIOs
            with enterprise leaders who have committed budgets and real
            engineering buy-in.
          </p>
          <div className="mt-8">
            <Link
              href="/signup?role=strategist"
              className="btn-primary-orange inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold shadow-sm"
            >
              <span>Apply to join the bench</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="warm-card shadow-soft p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent-soft text-brand-accent">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">
              Guaranteed Escrow Payouts
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Client funds are locked in Stripe-backed escrow before your first
              kickoff call. Never chase unpaid invoices or deal with 90-day net
              terms.
            </p>
          </div>

          <div className="warm-card shadow-soft p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas-2 text-ink">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">
              Proprietary Workflow Tooling
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Use the Loopwise Workflow Mapper, prompt benchmarks, and automated
              NIST AI RMF scorecards to conduct enterprise discovery 4x faster.
            </p>
          </div>

          <div className="warm-card shadow-soft p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas-2 text-forest">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">
              Pre-Qualified Enterprise Budgets
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Every client engagement has approved executive backing, typically
              between $10,000/mo and $25,000/mo retainer structures.
            </p>
          </div>

          <div className="warm-card shadow-soft p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent-soft text-brand-accent">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">
              Private Peer Community
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              Collaborate with fellow Fractional Heads of AI in our private
              council. Share agent harnesses, evaluation datasets, and vendor
              benchmarks.
            </p>
          </div>
        </div>

        {/* Vetting Criteria */}
        <div className="shadow-soft rounded-[28px] border border-line bg-canvas-2 p-8 sm:p-12">
          <h2 className="mb-4 font-display text-2xl font-bold text-ink">
            Our Acceptance Standards
          </h2>
          <p className="mb-6 text-sm text-ink-2">
            We approve fewer than 3% of applicants. Here is what our technical
            committee evaluates:
          </p>
          <div className="space-y-3">
            {[
              "Demonstrated track record shipping multi-agent workflows into production (LangGraph, CrewAI, AutoGen, or custom orchestrators).",
              "Ability to defend architecture choices and risk mitigation strategies before our technical review board.",
              "Experience with enterprise compliance standards (SOC 2, HIPAA, NIST AI RMF, or GDPR data handling).",
              "Verifiable executive references from past sponsors or enterprise clients.",
            ].map((criterion, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-xs text-ink-2 sm:text-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                <span>{criterion}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
            <span className="text-xs text-ink-3">
              Applications are reviewed weekly. Decisions delivered in 5
              business days.
            </span>
            <Link
              href="/signup?role=strategist"
              className="btn-primary-orange flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold shadow-sm"
            >
              <span>Submit your portfolio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
