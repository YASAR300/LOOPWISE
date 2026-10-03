"use client";

import React from "react";
import {
  GitBranch,
  Bot,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";

export function FeatureSection() {
  return (
    <section id="features" className="bg-bg-0 relative py-24 sm:py-32">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center sm:mb-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
            <Layers className="h-3.5 w-3.5 text-brand-cyan" />
            <span className="text-text-hero text-xs font-medium">
              Built for AI operations
            </span>
          </div>
          <h2 className="text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Everything needed to move from{" "}
            <span className="hero-headline-gradient">
              SOPs to autonomous execution
            </span>
          </h2>
          <p className="text-text-muted-landing mt-4 text-sm leading-relaxed sm:text-base">
            Loopwise pairs senior Fractional Heads of AI with proprietary
            workflow infrastructure, verified escrow contracts, and enterprise
            compliance telemetry.
          </p>
        </div>

        {/* 2x2 Grid of Glowing Visual Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {/* Card 1: Workflow Mapper */}
          <div className="glass-card group flex flex-col justify-between overflow-hidden">
            {/* Top Light Composition & UI Fragment */}
            <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-t-[19px] bg-[#05070E] p-6">
              {/* Glowing gradient wash */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-screen blur-[50px] filter transition-opacity duration-300 group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 30% 40%, rgba(31, 200, 255, 0.7) 0%, rgba(43, 89, 255, 0.4) 40%, transparent 75%)",
                }}
              />
              {/* UI Fragment: Interactive Node Blueprint */}
              <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/[0.14] bg-[#0A0E1A]/85 p-4 shadow-xl backdrop-blur-md">
                <div className="text-text-muted-landing flex items-center justify-between border-b border-white/[0.08] pb-2 text-2xs">
                  <div className="text-text-hero flex items-center gap-1.5 font-medium">
                    <GitBranch className="h-3.5 w-3.5 text-brand-cyan" />
                    <span>StateGraph: InvoiceTriage</span>
                  </div>
                  <span className="font-mono text-brand-cyan">
                    3 Steps Active
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-center">
                    <p className="text-text-faint-landing text-[10px] uppercase">
                      Node 1
                    </p>
                    <p className="text-text-hero text-xs font-semibold">
                      OCR Ingestion
                    </p>
                  </div>
                  <span className="text-xs text-brand-cyan">→</span>
                  <div className="flex-1 rounded-lg border border-brand-cyan/30 bg-brand-cyan/10 px-2.5 py-1.5 text-center">
                    <p className="text-[10px] uppercase text-brand-cyan">
                      Node 2
                    </p>
                    <p className="text-xs font-semibold text-white">
                      SAP 3-Way Match
                    </p>
                  </div>
                  <span className="text-xs text-brand-cyan">→</span>
                  <div className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-center">
                    <p className="text-text-faint-landing text-[10px] uppercase">
                      Node 3
                    </p>
                    <p className="text-text-hero text-xs font-semibold">
                      ACH Release
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="border-t border-white/[0.06] p-6 sm:p-7">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Workflow Mapper
              </h3>
              <p className="text-text-muted-landing mt-2 text-xs leading-relaxed sm:text-sm">
                Transforms unstructured company SOPs and interviews into
                deterministic, scored multi-agent blueprints with calculated
                feasibility.
              </p>
            </div>
          </div>

          {/* Card 2: Agent Registry */}
          <div className="glass-card group flex flex-col justify-between overflow-hidden">
            {/* Top Light Composition & UI Fragment */}
            <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-t-[19px] bg-[#05070E] p-6">
              {/* Glowing gradient wash in Orange/Peach */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-screen blur-[50px] filter transition-opacity duration-300 group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 70% 35%, rgba(255, 106, 43, 0.7) 0%, rgba(255, 180, 138, 0.35) 45%, transparent 75%)",
                }}
              />
              {/* UI Fragment: Agent Health Telemetry Fragment */}
              <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/[0.14] bg-[#0A0E1A]/85 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-2xs">
                  <div className="text-text-hero flex items-center gap-1.5 font-medium">
                    <Bot className="text-brand-orange h-3.5 w-3.5" />
                    <span>agt_sap_recon_v3</span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-semantic-success">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-semantic-success" />
                    99.8% Uptime
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-2xs">
                  <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2">
                    <span className="text-text-faint-landing block text-[10px]">
                      Latency
                    </span>
                    <span className="text-text-hero font-mono font-semibold">
                      320ms
                    </span>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2">
                    <span className="text-text-faint-landing block text-[10px]">
                      Token Cost
                    </span>
                    <span className="font-mono font-semibold text-brand-cyan">
                      $0.004/run
                    </span>
                  </div>
                  <div className="rounded-lg border border-white/[0.06] bg-black/40 p-2">
                    <span className="text-text-faint-landing block text-[10px]">
                      Guardrail Drift
                    </span>
                    <span className="font-mono font-semibold text-semantic-success">
                      0.0%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="border-t border-white/[0.06] p-6 sm:p-7">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Agent Registry & Telemetry
              </h3>
              <p className="text-text-muted-landing mt-2 text-xs leading-relaxed sm:text-sm">
                Centralized registry for every deployed enterprise agent, with
                deterministic kill-switches, error logging, and latency tracing.
              </p>
            </div>
          </div>

          {/* Card 3: Escrow & Milestones */}
          <div className="glass-card group flex flex-col justify-between overflow-hidden">
            {/* Top Light Composition & UI Fragment */}
            <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-t-[19px] bg-[#05070E] p-6">
              {/* Glowing gradient wash in Deep Electric & Lavender */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-screen blur-[50px] filter transition-opacity duration-300 group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 45% 60%, rgba(43, 89, 255, 0.65) 0%, rgba(207, 203, 255, 0.3) 45%, transparent 75%)",
                }}
              />
              {/* UI Fragment: Escrow Milestone Stepper */}
              <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/[0.14] bg-[#0A0E1A]/85 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-2xs">
                  <div className="text-text-hero flex items-center gap-1.5 font-medium">
                    <DollarSign className="h-3.5 w-3.5 text-brand-peach" />
                    <span>Protected Retainer Escrow</span>
                  </div>
                  <span className="font-mono font-semibold text-semantic-success">
                    $14,000 HELD
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-hero flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-semantic-success" />
                      <span>Stage 1: Architecture Review</span>
                    </span>
                    <span className="text-text-muted-landing text-2xs">
                      Approved
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-brand-cyan">
                      <Activity className="h-3.5 w-3.5 animate-spin text-brand-cyan" />
                      <span>Stage 2: Pilot Swarm Deploy</span>
                    </span>
                    <span className="font-mono text-2xs text-brand-cyan">
                      In Review
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="border-t border-white/[0.06] p-6 sm:p-7">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Enterprise Escrow & Milestones
              </h3>
              <p className="text-text-muted-landing mt-2 text-xs leading-relaxed sm:text-sm">
                Funds are held in secure escrow and released only upon explicit
                client approval of verified deliverables and test suites.
              </p>
            </div>
          </div>

          {/* Card 4: ROI & Governance */}
          <div className="glass-card group flex flex-col justify-between overflow-hidden">
            {/* Top Light Composition & UI Fragment */}
            <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-t-[19px] bg-[#05070E] p-6">
              {/* Glowing gradient wash in Peach and Cyan */}
              <div
                className="absolute inset-0 opacity-40 mix-blend-screen blur-[50px] filter transition-opacity duration-300 group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 60% 45%, rgba(255, 180, 138, 0.6) 0%, rgba(31, 200, 255, 0.4) 50%, transparent 80%)",
                }}
              />
              {/* UI Fragment: Governance Checklist & ROI metrics */}
              <div className="relative z-10 w-full max-w-sm rounded-xl border border-white/[0.14] bg-[#0A0E1A]/85 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-2xs">
                  <div className="text-text-hero flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-semantic-success" />
                    <span>NIST AI RMF 1.0 Audit</span>
                  </div>
                  <span className="font-semibold text-semantic-success">
                    100% PASS
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex-1 rounded-lg border border-white/[0.06] bg-black/40 p-2">
                    <div className="text-text-faint-landing flex items-center gap-1 text-[11px]">
                      <TrendingUp className="h-3 w-3 text-semantic-success" />
                      <span>Net ROI Multiplier</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-white">
                      4.8x Return
                    </p>
                  </div>
                  <div className="flex-1 rounded-lg border border-white/[0.06] bg-black/40 p-2">
                    <div className="text-text-faint-landing flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="h-3 w-3 text-brand-cyan" />
                      <span>PII Redaction</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-white">
                      Zero Leakage
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="border-t border-white/[0.06] p-6 sm:p-7">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Measurable ROI & Governance Pack
              </h3>
              <p className="text-text-muted-landing mt-2 text-xs leading-relaxed sm:text-sm">
                Board-ready compliance scorecards and telemetry proving hours
                automated, error rate reductions, and hard dollar savings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
