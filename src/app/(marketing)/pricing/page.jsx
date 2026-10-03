"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Calculator,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import {
  ENGAGEMENT_MODELS,
  FEE_CONFIG,
  calculateEngagementFees,
} from "@/lib/fees";

export default function PricingPage() {
  const [selectedModel, setSelectedModel] = useState("retainer");
  const [baseAmount, setBaseAmount] = useState(14000);

  const fees = calculateEngagementFees(baseAmount);

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    if (modelId === "retainer") setBaseAmount(14000);
    else if (modelId === "hourly") setBaseAmount(240);
    else setBaseAmount(18500);
  };

  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              CLEAR, PREDICTABLE PRICING
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Transparent fractional rates with zero hidden fees
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            Direct contracts with senior enterprise AI leaders. All engagements
            include escrow protection, workflow mapping tools, and guaranteed
            talent replacement.
          </p>
        </div>

        {/* Interactive Fee Calculator */}
        <div className="mx-auto mb-20 max-w-4xl">
          <div className="warm-card shadow-soft p-6 sm:p-10">
            <div className="mb-6 flex items-center gap-3 border-b border-line pb-5">
              <div className="rounded-lg bg-brand-accent-soft p-2.5 text-brand-accent">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">
                  Live Engagement Fee Calculator
                </h2>
                <p className="text-xs text-ink-2">
                  Computed in real time using platform rules (
                  {FEE_CONFIG.CLIENT_FEE_PERCENTAGE}% client fee,{" "}
                  {FEE_CONFIG.STRATEGIST_FEE_PERCENTAGE}% strategist deduction).
                </p>
              </div>
            </div>

            {/* Model Tabs */}
            <div className="mb-8 grid grid-cols-3 gap-2 rounded-xl border border-line bg-canvas-2 p-1">
              {Object.values(ENGAGEMENT_MODELS).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModelChange(m.id)}
                  className={`rounded-lg px-3 py-2 text-xs transition-all ${
                    selectedModel === m.id
                      ? "shadow-2xs bg-panel font-bold text-ink"
                      : "font-medium text-ink-2 hover:text-ink"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Slider & Input */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-ink">
                  {selectedModel === "hourly"
                    ? "Hourly Rate ($/hr)"
                    : selectedModel === "retainer"
                      ? "Monthly Retainer Amount ($/mo)"
                      : "Project Milestone Amount ($)"}
                </label>
                <div className="flex items-center gap-1 rounded-lg border border-line bg-canvas-2 px-3 py-1 font-mono text-xl font-bold text-ink">
                  <span>$</span>
                  <input
                    type="number"
                    value={baseAmount}
                    onChange={(e) =>
                      setBaseAmount(Math.max(0, Number(e.target.value)))
                    }
                    className="w-28 bg-transparent text-right focus:outline-none"
                  />
                </div>
              </div>

              <input
                type="range"
                min={
                  selectedModel === "hourly"
                    ? 150
                    : selectedModel === "retainer"
                      ? 8000
                      : 5000
                }
                max={
                  selectedModel === "hourly"
                    ? 450
                    : selectedModel === "retainer"
                      ? 35000
                      : 60000
                }
                step={selectedModel === "hourly" ? 10 : 500}
                value={baseAmount}
                onChange={(e) => setBaseAmount(Number(e.target.value))}
                className="w-full cursor-pointer accent-brand-accent"
              />
            </div>

            {/* Fee Breakdown Display */}
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-line bg-canvas-2 p-5 md:grid-cols-3">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                  Agreement Base
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-ink">
                  ${fees.baseAmount.toLocaleString()}
                </p>
                <p className="mt-0.5 text-2xs text-ink-2">
                  Strategist base rate
                </p>
              </div>

              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                  Client Fee ({fees.clientFeePercent}%)
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-brand-accent">
                  +${fees.clientFee.toLocaleString()}
                </p>
                <p className="mt-0.5 text-2xs text-ink-2">
                  Escrow, tooling & guarantee
                </p>
              </div>

              <div className="border-t border-line pt-3 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                  Total Invoice Amount
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-ink">
                  ${fees.clientTotal.toLocaleString()}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-2xs font-semibold text-forest">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Protected in Escrow</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-line pt-4 sm:flex-row">
              <p className="text-xs text-ink-2">
                Strategist receives{" "}
                <strong>${fees.strategistNet.toLocaleString()}</strong> after
                verified milestone release.
              </p>
              <Link
                href={`/signup?role=client&model=${selectedModel}&amount=${baseAmount}`}
                className="btn-primary-orange flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold shadow-sm"
              >
                <span>Start with this model</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Model Feature Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {Object.values(ENGAGEMENT_MODELS).map((m) => (
            <div
              key={m.id}
              className="warm-card shadow-soft flex flex-col justify-between p-6 sm:p-8"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink">
                    {m.name}
                  </span>
                  <span className="rounded-full border border-line bg-canvas-2 px-2.5 py-0.5 text-2xs font-semibold text-ink-2">
                    {m.badge}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="font-mono text-3xl font-bold text-ink">
                    ${m.typicalRate.toLocaleString()}
                  </p>
                  <p className="mt-1 text-2xs text-ink-3">
                    per {m.ratePeriod} • {m.hoursPerWeek}
                  </p>
                </div>
                <p className="mb-6 text-xs leading-relaxed text-ink-2">
                  {m.description}
                </p>
                <div className="mb-8 space-y-2.5">
                  {m.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-ink-2"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-accent" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={`/signup?role=client&model=${m.id}`}
                className="btn-secondary-outline w-full py-2.5 text-center text-xs font-semibold"
              >
                Choose {m.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
