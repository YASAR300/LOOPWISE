"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck } from "lucide-react";
import { HeroIllustration } from "./illustrations/hero-illustration";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-canvas pb-16 pt-12 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Text & CTAs (Left-aligned) */}
          <div className="space-y-6 text-left lg:col-span-7">
            {/* Small UPPERCASE Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                SCALE ENTERPRISE AUTOMATION WITH VETTED CAIOS
              </span>
            </div>

            {/* Very large, heavy, tight grotesk headline in near-black (2 lines) */}
            <h1 className="font-display text-h1 font-bold tracking-tight text-ink">
              The most trusted fractional AI leadership platform
            </h1>

            {/* Short two-line paragraph */}
            <p className="max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">
              Build and ship governed autonomous agent workflows in weeks—no
              executive hiring friction, zero vendor lock-in. Just verified ROI.
            </p>

            {/* Two Buttons Side by Side */}
            <div className="flex flex-col items-stretch gap-3.5 pt-2 sm:flex-row sm:items-center">
              <Link
                href="/signup?role=client"
                className="btn-primary-orange flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold shadow-sm"
              >
                <span>Hire an AI leader</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/signup?role=strategist"
                className="btn-secondary-outline flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold shadow-sm"
              >
                <Bot className="h-4 w-4 text-brand-accent" />
                <span>Apply as a strategist</span>
              </Link>
            </div>

            {/* Subtle trust signals */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-medium text-ink-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-forest" />
                <span className="font-medium text-ink-2">
                  Top 3% Technical Acceptance
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
                <span>Escrow Milestone Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                <span>48-Hour Matching</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hand-made flat risograph illustration */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
