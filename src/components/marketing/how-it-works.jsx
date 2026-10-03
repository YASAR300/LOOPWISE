"use client";

import React from "react";
import { SpotIllustration } from "./illustrations/spot-illustration";

const STEPS = [
  {
    num: 1,
    title: "Map Your Internal Workflows",
    variant: "map",
    tileBg: "bg-tile-violet",
    textColor: "text-white",
    description:
      "Your Fractional Head of AI ingests department SOPs, interviews team owners, and scores every step for automation feasibility, token budgets, and risk.",
    highlight: "SOP Ingestion & Scoring",
  },
  {
    num: 2,
    title: "Match with a Vetted CAIO",
    variant: "match",
    tileBg: "bg-tile-mint",
    textColor: "text-ink",
    description:
      "We match your technical stack (LangGraph, CrewAI, SAP, Salesforce) with top 3% vetted automation architects in under 48 hours.",
    highlight: "Double-Vetted Shortlist in 48h",
  },
  {
    num: 3,
    title: "Deploy Agents with Guardrails",
    variant: "deploy",
    tileBg: "bg-tile-coral",
    textColor: "text-white",
    description:
      "Multi-agent swarms are built in sandbox harnesses under strict NIST AI RMF governance, deterministic output verification, and human gates.",
    highlight: "Escrow-Protected Milestones",
  },
  {
    num: 4,
    title: "Prove Continuous ROI",
    variant: "prove",
    tileBg: "bg-tile-sun",
    textColor: "text-ink",
    description:
      "Track live telemetry: cumulative hours saved, latency profiles, token expenditure, and error reduction directly in your executive dashboard.",
    highlight: "Live Board-Ready Telemetry",
  },
];

export function HowItWorksTimeline() {
  return (
    <section
      id="how-it-works"
      className="relative border-b border-line bg-canvas-2 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              THE LOOPWISE PLAYBOOK
            </span>
          </div>

          <h2 className="font-display text-h2 font-bold tracking-tight text-ink">
            How Loopwise delivers production AI
          </h2>
          <p className="mt-3 text-base text-ink-2">
            Four disciplined stages from initial SOP discovery to governed
            autonomous execution.
          </p>
        </div>

        {/* 4 Large Friendly Cards with Spot Illustrations & Identity Tile Numbers */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="warm-card group flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-1"
            >
              <div>
                {/* Top: Identity Tile Number + Spot Illustration */}
                <div className="mb-6 flex items-center justify-between">
                  <span
                    className={`h-7 w-7 rounded-md ${step.tileBg} ${step.textColor} shadow-xs flex items-center justify-center font-mono text-xs font-bold`}
                  >
                    {step.num}
                  </span>
                  <SpotIllustration
                    variant={step.variant}
                    className="h-16 w-16"
                  />
                </div>

                <h3 className="font-display text-base font-bold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-ink-2">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 border-t border-line pt-4">
                <span className="rounded-full bg-brand-accent-soft px-2.5 py-1 text-2xs font-semibold text-brand-accent">
                  {step.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
