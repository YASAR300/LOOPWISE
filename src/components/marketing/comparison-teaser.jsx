"use client";

import React from "react";
import Link from "next/link";
import { Check, X, ArrowRight, ShieldCheck } from "lucide-react";

const COMPARISON_ROWS = [
  {
    criteria: "Domain Focus",
    loopwise: "100% Fractional AI & Automation Only",
    freelance: "Generalist Freelance Engineers",
    agencies: "General Management Consultants",
  },
  {
    criteria: "SOP Workflow Mapping Tooling",
    loopwise: true,
    freelance: false,
    agencies: false,
  },
  {
    criteria: "Agent Swarm Registry & Telemetry",
    loopwise: true,
    freelance: false,
    agencies: false,
  },
  {
    criteria: "NIST AI RMF 1.0 Governance Built In",
    loopwise: true,
    freelance: false,
    agencies: "Manual Word Docs",
  },
  {
    criteria: "Escrow Protected Milestones",
    loopwise: true,
    freelance: false,
    agencies: false,
  },
  {
    criteria: "Free Strategist Replacement",
    loopwise: true,
    freelance: false,
    agencies: false,
  },
];

export function ComparisonTeaser() {
  return (
    <section className="relative bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              MARKET COMPARISON
            </span>
          </div>
          <h2 className="font-display text-h2 font-bold tracking-tight text-ink">
            Why enterprise teams choose Loopwise
          </h2>
          <p className="mt-3 text-base text-ink-2">
            Traditional networks stop at introductions. We provide vetted
            leadership backed by proprietary runtime tooling.
          </p>
        </div>

        {/* Clean Table (no grid pattern) */}
        <div className="warm-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-canvas-2 text-xs">
                  <th className="p-4 font-semibold text-ink-3 sm:p-5">
                    Evaluation Criteria
                  </th>
                  <th className="bg-brand-accent-soft/30 p-4 font-bold text-brand-accent sm:p-5">
                    Loopwise
                  </th>
                  <th className="p-4 font-semibold text-ink-2 sm:p-5">
                    Freelance Marketplaces
                  </th>
                  <th className="p-4 font-semibold text-ink-2 sm:p-5">
                    Boutique CAIO Agencies
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-canvas-2/50 transition-colors"
                  >
                    <td className="p-4 font-semibold text-ink sm:p-5">
                      {row.criteria}
                    </td>

                    {/* Loopwise */}
                    <td className="bg-brand-accent-soft/10 p-4 font-bold text-ink sm:p-5">
                      {typeof row.loopwise === "boolean" ? (
                        <div className="flex items-center gap-1.5 font-semibold text-forest">
                          <Check className="h-4 w-4 stroke-[2.5]" />
                          <span>Included</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-brand-accent">
                          {row.loopwise}
                        </span>
                      )}
                    </td>

                    {/* Freelance */}
                    <td className="p-4 text-ink-3 sm:p-5">
                      {typeof row.freelance === "boolean" ? (
                        row.freelance ? (
                          <Check className="h-4 w-4 text-forest" />
                        ) : (
                          <X className="h-4 w-4 text-ink-3" />
                        )
                      ) : (
                        row.freelance
                      )}
                    </td>

                    {/* Agencies */}
                    <td className="p-4 text-ink-3 sm:p-5">
                      {typeof row.agencies === "boolean" ? (
                        row.agencies ? (
                          <Check className="h-4 w-4 text-forest" />
                        ) : (
                          <X className="h-4 w-4 text-ink-3" />
                        )
                      ) : (
                        row.agencies
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:underline"
          >
            <span>
              Read full benchmarking report vs Upwork, Toptal, and Catalant
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
