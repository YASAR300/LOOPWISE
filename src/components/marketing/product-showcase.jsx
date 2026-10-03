"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Bot,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Check,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
  Sliders,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const TABS = [
  { id: "mapper", label: "Workflow Mapper" },
  { id: "registry", label: "Agent Registry" },
  { id: "escrow", label: "Escrow & Milestones" },
  { id: "roi", label: "ROI Dashboard" },
  { id: "governance", label: "Governance" },
];

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState("mapper");

  // Workflow Mapper Demo State
  const [sopText, setSopText] = useState(
    "Incoming vendor invoice arrives via email in PDF format. Staff downloads invoice, looks up Tax ID in SAP ERP, validates line items against Purchase Order, and routes to Finance VP if variance is under $50. Once signed, ACH payment is scheduled."
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  const handleAnalyze = async () => {
    if (!sopText.trim() || sopText.length < 10) {
      setAnalysisError(
        "Please enter at least 10 characters describing your process."
      );
      return;
    }
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/public/demo-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sopText, framework: "langgraph" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze workflow");
      setAnalysisResult(data.data);
    } catch (err) {
      setAnalysisError(err.message || "Failed to run analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section id="showcase" className="relative bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Centered Eyebrow with Small Orange Dot */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              YOUR COMPLETE OPERATING SYSTEM FOR AUTONOMOUS AI
            </span>
          </div>

          <h2 className="mx-auto max-w-2xl font-display text-h2 font-bold tracking-tight text-ink">
            From fragmented SOPs to hardened production agents
          </h2>
        </div>

        {/* Horizontal Tab Strip (bordered row with thin vertical dividers and 2px orange underline) */}
        <div className="mx-auto mb-10 max-w-4xl overflow-x-auto">
          <div className="flex min-w-max items-center justify-center divide-x divide-line rounded-lg border border-line bg-panel shadow-sm">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-5 py-3 text-xs font-medium transition-colors sm:text-sm ${
                    isActive
                      ? "font-semibold text-ink"
                      : "text-ink-2 hover:bg-canvas-2 hover:text-ink"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-brand-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Product Showcase Band (Soft peach fading to sage gradient + blurred motion streaks) */}
        <div className="warm-showcase-band relative overflow-hidden p-5 sm:p-8 lg:p-12">
          {/* Motion-blur background streaks on right side */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-40 blur-3xl filter"
            style={{
              background:
                "radial-gradient(circle, #FFA882 0%, #D4E5D8 70%, transparent 100%)",
            }}
          />

          {/* Floating Real App Window */}
          <div className="floating-app-window relative z-10 mx-auto max-w-5xl overflow-hidden">
            {/* App Chrome Top Bar */}
            <div className="bg-canvas-2/60 flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#EC6B4F]" />
                <span className="h-3 w-3 rounded-full bg-[#F7C35A]" />
                <span className="h-3 w-3 rounded-full bg-[#3FB28F]" />
                <span className="ml-3 font-mono text-2xs text-ink-3">
                  loopwise-app // pod-automation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success-border bg-status-success-bg px-2.5 py-0.5 text-2xs font-medium text-status-success-text">
                  <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  <span>Telemetry Live</span>
                </span>
              </div>
            </div>

            <div className="grid min-h-[480px] grid-cols-1 lg:grid-cols-12">
              {/* Rounded App Sidebar */}
              <div className="space-y-6 border-r border-line bg-canvas p-4 lg:col-span-3">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                      Pods & Teams
                    </span>
                    <span className="font-mono text-2xs text-ink-3">
                      3 Active
                    </span>
                  </div>

                  {/* Sidebar Identity Tile Items */}
                  <div className="space-y-1">
                    <div className="shadow-2xs flex items-center gap-2.5 rounded-lg border border-line bg-panel p-2 text-xs font-semibold text-ink">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-tile-violet text-[10px] font-bold text-white">
                        F
                      </span>
                      <span>Finance AP Pod</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-lg p-2 text-xs text-ink-2 transition-colors hover:bg-canvas-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-tile-mint text-[10px] font-bold text-ink">
                        H
                      </span>
                      <span>Healthcare EHR</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-lg p-2 text-xs text-ink-2 transition-colors hover:bg-canvas-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-tile-coral text-[10px] font-bold text-white">
                        S
                      </span>
                      <span>Sales Outreach</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-line pt-4">
                  <span className="block text-2xs font-semibold uppercase tracking-wider text-ink-3">
                    Assigned AI Leader
                  </span>
                  <div className="flex items-center gap-2.5 rounded-lg border border-line-2 bg-canvas-2 p-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-indigo text-xs font-bold text-white">
                      ER
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink">
                        Elena Rostova
                      </p>
                      <p className="text-[11px] text-ink-3">
                        Fractional CAIO • LangGraph
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area per Tab */}
              <div className="overflow-y-auto bg-panel p-5 sm:p-7 lg:col-span-9">
                {/* TAB 1: WORKFLOW MAPPER WITH LIVE ANALYZE TEXTBOX */}
                {activeTab === "mapper" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">
                        Workflow Mapper & Ingestion
                      </h3>
                      <p className="mt-0.5 text-xs text-ink-2">
                        Paste an internal SOP or department process to generate
                        an instant feasibility score and architecture plan.
                      </p>
                    </div>

                    {/* Prompt Box with thin orange-to-pink gradient border */}
                    <div className="shadow-xs rounded-xl bg-gradient-to-r from-brand-accent via-tile-pink to-brand-indigo p-[1px]">
                      <div className="space-y-3 rounded-[11px] bg-panel p-3.5">
                        <textarea
                          rows={3}
                          value={sopText}
                          onChange={(e) => setSopText(e.target.value)}
                          maxLength={2000}
                          placeholder="Paste team SOP here..."
                          className="w-full resize-none text-xs leading-relaxed text-ink placeholder:text-ink-3 focus:outline-none sm:text-sm"
                        />

                        <div className="flex items-center justify-between border-t border-line pt-2.5">
                          <span className="font-mono text-2xs text-ink-3">
                            {sopText.length} / 2,000 chars • Zero data retention
                          </span>

                          <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="btn-primary-orange flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold disabled:opacity-60"
                          >
                            {analyzing ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                <span>Analyzing SOP...</span>
                              </>
                            ) : (
                              <>
                                <span>Analyze SOP</span>
                                <Send className="h-3 w-3" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {analysisError && (
                      <div className="flex items-center gap-2 rounded-lg border border-status-needs-action-border bg-status-needs-action-bg p-3 text-xs text-status-needs-action-text">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{analysisError}</span>
                      </div>
                    )}

                    {/* Scored Results */}
                    {analysisResult ? (
                      <div className="animate-fade-in space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="rounded-lg border border-line bg-canvas-2 p-3 text-center">
                            <span className="text-2xs font-semibold uppercase text-ink-3">
                              Feasibility
                            </span>
                            <p className="mt-0.5 font-mono text-xl font-bold text-brand-accent">
                              {analysisResult.feasibilityScore}%
                            </p>
                          </div>
                          <div className="rounded-lg border border-line bg-canvas-2 p-3 text-center">
                            <span className="text-2xs font-semibold uppercase text-ink-3">
                              Hours Saved
                            </span>
                            <p className="mt-0.5 font-mono text-xl font-bold text-ink">
                              {analysisResult.roiHoursSavedPerMonth}h/mo
                            </p>
                          </div>
                          <div className="rounded-lg border border-line bg-canvas-2 p-3 text-center">
                            <span className="text-2xs font-semibold uppercase text-ink-3">
                              Deploy Window
                            </span>
                            <p className="mt-0.5 font-mono text-xl font-bold text-brand-indigo">
                              {analysisResult.estimatedWeeksToDeploy} wks
                            </p>
                          </div>
                          <div className="rounded-lg border border-line bg-canvas-2 p-3 text-center">
                            <span className="text-2xs font-semibold uppercase text-ink-3">
                              Compliance
                            </span>
                            <p className="mt-1 text-xs font-bold text-status-success-text">
                              NIST RMF 1.0
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-2xs font-semibold uppercase text-ink-3">
                            Extracted Execution Topology
                          </p>
                          {analysisResult.opportunities?.map((opp, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-lg border border-line bg-panel p-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="h-2 w-2 rounded-full bg-brand-accent" />
                                <div>
                                  <span className="font-semibold text-ink">
                                    {opp.stepName}
                                  </span>
                                  <span className="block text-2xs text-ink-3">
                                    Role: {opp.agentRole} •{" "}
                                    {opp.frameworkRecommendation}
                                  </span>
                                </div>
                              </div>
                              <span className="font-mono text-xs font-bold text-brand-indigo">
                                {opp.automationPotential}% Automatable
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Default Preview Rows */
                      <div className="space-y-3">
                        <p className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                          Standard Opportunity Pipeline
                        </p>
                        <div className="flex items-center justify-between rounded-lg border border-line bg-canvas-2 p-3.5 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded bg-tile-coral text-[10px] font-bold text-white">
                              1
                            </span>
                            <div>
                              <p className="font-semibold text-ink">
                                Vendor PDF Invoice Parser
                              </p>
                              <p className="text-2xs text-ink-3">
                                LangGraph agent extracting Tax ID & line items
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-status-success-border bg-status-success-bg px-2 py-0.5 text-2xs font-medium text-status-success-text">
                            94% Automatable
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-line bg-canvas-2 p-3.5 text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-4 w-4 items-center justify-center rounded bg-tile-violet text-[10px] font-bold text-white">
                              2
                            </span>
                            <div>
                              <p className="font-semibold text-ink">
                                SAP PO 3-Way Match Verification
                              </p>
                              <p className="text-2xs text-ink-3">
                                Deterministic ledger check under $50 variance
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-status-success-border bg-status-success-bg px-2 py-0.5 text-2xs font-medium text-status-success-text">
                            88% Automatable
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: AGENT REGISTRY */}
                {activeTab === "registry" && (
                  <div className="animate-fade-in space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink">
                          Agent Swarm Registry
                        </h3>
                        <p className="text-xs text-ink-2">
                          Live inventory of autonomous agents with deterministic
                          guardrails.
                        </p>
                      </div>
                      <button className="btn-primary-orange rounded-md px-3.5 py-1.5 text-xs font-semibold">
                        + Deploy Agent
                      </button>
                    </div>

                    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line text-xs">
                      {[
                        {
                          name: "Invoice Reconciliation Agent",
                          desc: "Autonomously matches vendor invoice PDFs against SAP ERP",
                          date: "Today at 9:15am",
                          app: "SAP + Gmail",
                          status: "Complete",
                          tileBg: "bg-tile-violet",
                          letter: "I",
                        },
                        {
                          name: "Contract Clause Extractor",
                          desc: "Audits master service agreements for non-standard liability",
                          date: "Yesterday at 4:30pm",
                          app: "Salesforce + DocuSign",
                          status: "Needs action",
                          tileBg: "bg-tile-coral",
                          letter: "C",
                        },
                        {
                          name: "Lead Qualification Sentinel",
                          desc: "Enriches inbound enterprise leads via LinkedIn & Crunchbase",
                          date: "Oct 2 at 11:00am",
                          app: "HubSpot + Slack",
                          status: "Complete",
                          tileBg: "bg-tile-teal",
                          letter: "L",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-4 p-3.5 transition-colors hover:bg-canvas-2"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-6 w-6 rounded ${item.tileBg} flex shrink-0 items-center justify-center text-xs font-bold text-white`}
                            >
                              {item.letter}
                            </span>
                            <div>
                              <p className="font-semibold text-ink">
                                {item.name}
                              </p>
                              <p className="text-2xs text-ink-3">{item.desc}</p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-4">
                            <span className="hidden font-mono text-2xs text-ink-3 sm:inline">
                              {item.app}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
                                item.status === "Complete"
                                  ? "border border-status-success-border bg-status-success-bg text-status-success-text"
                                  : "border border-status-needs-action-border bg-status-needs-action-bg text-status-needs-action-text"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: ESCROW & MILESTONES */}
                {activeTab === "escrow" && (
                  <div className="animate-fade-in space-y-5">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">
                        Escrow & Milestone Releases
                      </h3>
                      <p className="text-xs text-ink-2">
                        Retainer funds held securely in escrow until
                        deliverables are verified.
                      </p>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-line bg-canvas-2 p-4">
                      <div>
                        <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                          Active Escrow Balance
                        </span>
                        <p className="mt-0.5 font-mono text-2xl font-bold text-ink">
                          $14,000.00
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-status-success-border bg-status-success-bg px-3 py-1 text-xs font-semibold text-status-success-text">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Protected by Loopwise Guarantee</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-line bg-panel p-4 text-xs">
                        <div>
                          <p className="font-semibold text-ink">
                            Milestone 1: SOP Ingestion & Architecture Defense
                          </p>
                          <p className="mt-0.5 text-2xs text-ink-3">
                            Approved by client Alex Carter • $7,000 released
                          </p>
                        </div>
                        <span className="rounded-full border border-status-success-border bg-status-success-bg px-2.5 py-1 text-2xs font-semibold text-status-success-text">
                          Released
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-brand-accent/30 bg-brand-accent-soft/30 p-4 text-xs">
                        <div>
                          <p className="font-semibold text-ink">
                            Milestone 2: Production Multi-Agent Swarm Cutover
                          </p>
                          <p className="mt-0.5 text-2xs text-ink-3">
                            Verification test harness in progress • $7,000 in
                            escrow
                          </p>
                        </div>
                        <span className="rounded-full border border-status-warning-border bg-status-warning-bg px-2.5 py-1 text-2xs font-semibold text-status-warning-text">
                          Pending Client Sign-Off
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ROI DASHBOARD */}
                {activeTab === "roi" && (
                  <div className="animate-fade-in space-y-5">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">
                        Real-Time ROI Proof Engine
                      </h3>
                      <p className="text-xs text-ink-2">
                        Telemetry proving cumulative hours saved and direct
                        operational returns.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-line bg-panel p-4 text-center">
                        <span className="text-2xs font-semibold uppercase text-ink-3">
                          Cumulative Hours Automated
                        </span>
                        <p className="mt-1 font-mono text-3xl font-bold text-brand-accent">
                          32,730h
                        </p>
                      </div>
                      <div className="rounded-xl border border-line bg-panel p-4 text-center">
                        <span className="text-2xs font-semibold uppercase text-ink-3">
                          Net Cost Multiplier
                        </span>
                        <p className="mt-1 font-mono text-3xl font-bold text-brand-indigo">
                          4.8x ROI
                        </p>
                      </div>
                      <div className="rounded-xl border border-line bg-panel p-4 text-center">
                        <span className="text-2xs font-semibold uppercase text-ink-3">
                          Error Reduction
                        </span>
                        <p className="mt-1 font-mono text-3xl font-bold text-status-success-text">
                          -88%
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-line bg-canvas-2 p-4 text-xs leading-relaxed text-ink-2">
                      All metrics are computed directly from `MetricSnapshot`
                      event telemetry and mapped against executive milestone
                      sign-offs. Board-ready CSV and PDF export available.
                    </div>
                  </div>
                )}

                {/* TAB 5: GOVERNANCE */}
                {activeTab === "governance" && (
                  <div className="animate-fade-in space-y-5">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">
                        NIST AI RMF 1.0 & Governance Pack
                      </h3>
                      <p className="text-xs text-ink-2">
                        Audited deterministic guardrails, PII masking, and human
                        gates.
                      </p>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {[
                        {
                          title:
                            "NIST MAP-1.2: Boundary verification & output containment",
                          state: "Compliant",
                        },
                        {
                          title:
                            "NIST GOVERN-2.1: Human-in-the-loop review on transactions > $500",
                          state: "Enforced",
                        },
                        {
                          title:
                            "EU AI Act: Transparency & systematic error audit logs",
                          state: "Verified",
                        },
                        {
                          title:
                            "PII Anonymization: Zero customer credentials passed to prompts",
                          state: "Compliant",
                        },
                      ].map((gov, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-line bg-panel p-3"
                        >
                          <span className="font-medium text-ink">
                            {gov.title}
                          </span>
                          <span className="rounded border border-status-success-border bg-status-success-bg px-2 py-0.5 text-2xs font-semibold text-status-success-text">
                            {gov.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
