"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { ENGAGEMENT_MODELS, FEE_CONFIG } from "@/lib/fees";

export function PricingTeaser() {
  const models = [
    ENGAGEMENT_MODELS.RETAINER,
    ENGAGEMENT_MODELS.HOURLY,
    ENGAGEMENT_MODELS.FIXED,
  ];

  return (
    <section
      id="pricing"
      className="relative border-b border-line bg-canvas-2 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              TRANSPARENT ECONOMICS
            </span>
          </div>
          <h2 className="font-display text-h2 font-bold tracking-tight text-ink">
            Predictable fractional rates
          </h2>
          <p className="mt-3 text-base text-ink-2">
            No surprise subscription fees. Flat{" "}
            {FEE_CONFIG.CLIENT_FEE_PERCENTAGE}% client fee with complete
            milestone escrow protection.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {models.map((model) => {
            const isFeatured = model.id === "retainer";
            return (
              <div
                key={model.id}
                className={`warm-card relative flex flex-col justify-between p-6 sm:p-8 ${
                  isFeatured
                    ? "border-brand-accent/50 shadow-md ring-1 ring-brand-accent/20"
                    : ""
                }`}
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink">
                      {model.name}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-2xs font-semibold ${
                        isFeatured
                          ? "border border-brand-accent/30 bg-brand-accent-soft text-brand-accent"
                          : "border border-line bg-canvas-2 text-ink-3"
                      }`}
                    >
                      {model.badge}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-bold text-ink sm:text-4xl">
                        ${model.typicalRate.toLocaleString()}
                      </span>
                      <span className="text-xs text-ink-3">
                        / {model.ratePeriod}
                      </span>
                    </div>
                    <p className="mt-1 text-2xs font-medium text-ink-3">
                      {model.hoursPerWeek}
                    </p>
                  </div>

                  <p className="mb-6 text-xs leading-relaxed text-ink-2">
                    {model.description}
                  </p>

                  <div className="mb-8 space-y-2.5">
                    {model.features.slice(0, 4).map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-ink"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/signup?role=client&model=${model.id}`}
                  className={`flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all ${
                    isFeatured ? "btn-primary-orange" : "btn-secondary-outline"
                  }`}
                >
                  <span>Hire on {model.name}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-indigo hover:underline"
          >
            <span>Open live fee calculator & complete retainer breakdown</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
