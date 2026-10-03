import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, Server, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Security & Governance Architecture | Loopwise",
  description:
    "Enterprise security architecture, zero data retention policies, and NIST AI RMF compliance at Loopwise.",
};

export default function SecurityPage() {
  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-forest" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              ENTERPRISE DEFENSE
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Enterprise security & responsible governance
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            Engineered from inception for regulated environments: banking,
            healthcare, and enterprise software.
          </p>
        </div>

        <div className="mb-16 space-y-6">
          <div className="warm-card shadow-soft flex items-start gap-5 p-8">
            <div className="shrink-0 rounded-xl bg-brand-accent-soft p-3 text-brand-accent">
              <EyeOff className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Zero Data Retention on LLM Queries
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                All prompt completions and SOP analyses executed via our
                Workflow Mapper route through enterprise zero-data retention
                APIs. Your proprietary business rules, customer PII, and
                financial ledgers are never stored or used to train third-party
                foundation models.
              </p>
            </div>
          </div>

          <div className="warm-card shadow-soft flex items-start gap-5 p-8">
            <div className="shrink-0 rounded-xl border border-line bg-canvas-2 p-3 text-ink">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                NIST AI RMF 1.0 & EU AI Act Audits
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                Every agent blueprint generated in Loopwise includes
                deterministic boundary checks: prompt injection red-teaming,
                output validation filters, and human-in-the-loop fallback gates.
              </p>
            </div>
          </div>

          <div className="warm-card shadow-soft flex items-start gap-5 p-8">
            <div className="shrink-0 rounded-xl border border-line bg-canvas-2 p-3 text-forest">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Encrypted Escrow Infrastructure
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">
                All client funds are held in encrypted, FDIC-insured Stripe
                escrow accounts. Disbursements require explicit cryptographic
                sign-off on delivered code repositories and telemetry logs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="shadow-soft rounded-[28px] border border-line bg-canvas-2 p-8 text-center sm:p-10">
          <h2 className="mb-3 font-display text-2xl font-bold text-ink">
            Request our Security Whitepaper
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-sm text-ink-2">
            Detailed architecture documentation, threat models, and SOC 2 Type
            II readiness reports available for enterprise compliance teams.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="btn-primary-orange flex items-center gap-2 px-8 py-3 text-sm font-semibold shadow-sm"
            >
              <span>Contact security desk</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="btn-secondary-outline px-8 py-3 text-sm font-semibold"
            >
              <span>Review pricing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
