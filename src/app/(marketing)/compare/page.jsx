import React from "react";
import Link from "next/link";
import { ArrowRight, Check, X, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Compare Loopwise | Marketplace for Fractional Heads of AI",
  description:
    "An honest comparison of Loopwise vs Upwork, Toptal, Catalant, Go Fractional, and boutique CAIO consulting firms.",
};

const COMPARISON_ROWS = [
  {
    feature: "Specialization",
    loopwise: "100% Fractional AI & Automation Only",
    goFractional: "Generalist Executives (CMO, CFO, CTO)",
    toptal: "Generalist Freelance Engineers",
    boutique: "General Management Consultants",
  },
  {
    feature: "Workflow Tooling & SOP Ingestion",
    loopwise: true,
    goFractional: false,
    toptal: false,
    boutique: false,
  },
  {
    feature: "Agent Swarm Registry & Telemetry",
    loopwise: true,
    goFractional: false,
    toptal: false,
    boutique: false,
  },
  {
    feature: "NIST AI RMF 1.0 & Governance Pack",
    loopwise: true,
    goFractional: false,
    toptal: false,
    boutique: "Manual Word Docs",
  },
  {
    feature: "Turnaround to Qualified Match",
    loopwise: "48 Hours",
    goFractional: "3–5 Days",
    toptal: "1–2 Weeks",
    boutique: "3–6 Weeks",
  },
  {
    feature: "Client Platform Fee",
    loopwise: "8% Flat Fee",
    goFractional: "10–15% Mark-up",
    toptal: "20–40% Built-in Margin",
    boutique: "$40k–$80k/mo Minimums",
  },
  {
    feature: "Escrow Milestone Guarantee",
    loopwise: true,
    goFractional: false,
    toptal: false,
    boutique: false,
  },
  {
    feature: "Free Talent Replacement",
    loopwise: true,
    goFractional: "Subject to renegotiation",
    toptal: "Subject to account manager",
    boutique: "Change order fees",
  },
];

export default function ComparePage() {
  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              MARKET COMPARISON
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            How Loopwise compares to generic talent alternatives
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            Built from day one for enterprise AI orchestration—not general staff
            augmentation or slide-deck consulting.
          </p>
        </div>

        {/* Clean Comparison Table (No repeating grid pattern) */}
        <div className="warm-card shadow-soft mb-16 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-canvas-2">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink">
                    Capability
                  </th>
                  <th className="bg-brand-accent-soft/40 px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-accent">
                    Loopwise
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                    Go Fractional
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                    Toptal / Upwork
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                    Boutique Consultancies
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-canvas-2/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-ink">
                      {row.feature}
                    </td>

                    {/* Loopwise column */}
                    <td className="bg-brand-accent-soft/20 px-6 py-4 font-semibold text-ink">
                      {typeof row.loopwise === "boolean" ? (
                        <div className="flex items-center gap-1.5 text-forest">
                          <Check className="h-4 w-4" />
                          <span>Included</span>
                        </div>
                      ) : (
                        <span>{row.loopwise}</span>
                      )}
                    </td>

                    {/* Go Fractional */}
                    <td className="px-6 py-4 text-ink-2">
                      {typeof row.goFractional === "boolean" ? (
                        row.goFractional ? (
                          <Check className="h-4 w-4 text-forest" />
                        ) : (
                          <X className="h-4 w-4 text-ink-3" />
                        )
                      ) : (
                        <span>{row.goFractional}</span>
                      )}
                    </td>

                    {/* Toptal */}
                    <td className="px-6 py-4 text-ink-2">
                      {typeof row.toptal === "boolean" ? (
                        row.toptal ? (
                          <Check className="h-4 w-4 text-forest" />
                        ) : (
                          <X className="h-4 w-4 text-ink-3" />
                        )
                      ) : (
                        <span>{row.toptal}</span>
                      )}
                    </td>

                    {/* Boutique */}
                    <td className="px-6 py-4 text-ink-2">
                      {typeof row.boutique === "boolean" ? (
                        row.boutique ? (
                          <Check className="h-4 w-4 text-forest" />
                        ) : (
                          <X className="h-4 w-4 text-ink-3" />
                        )
                      ) : (
                        <span>{row.boutique}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="shadow-soft rounded-[28px] border border-line bg-canvas-2 p-8 text-center sm:p-12">
          <h2 className="mb-3 font-display text-2xl font-bold text-ink sm:text-3xl">
            Deploy your first autonomous agent with proven leaders
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-ink-2 sm:text-base">
            Get matched with an experienced Fractional Head of AI in under 48
            hours with full escrow milestone protection.
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
              href="/strategists"
              className="btn-secondary-outline flex items-center justify-center px-8 py-3.5 text-sm font-semibold"
            >
              <span>Browse AI leaders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
