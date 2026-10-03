"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck } from "lucide-react";
import { SpotIllustration } from "./illustrations/spot-illustration";

export function FinalCta() {
  return (
    <section className="relative bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="shadow-soft relative overflow-hidden rounded-[28px] border border-line bg-canvas-2 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Content */}
            <div className="space-y-6 text-left lg:col-span-8">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                  ACCELERATE YOUR AI ROADMAP
                </span>
              </div>

              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
                Ready to deploy governed autonomous workflows?
              </h2>

              <p className="max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">
                Skip 6-month recruiting cycles. Partner with a pre-screened
                Fractional Head of AI & Automation who maps your SOPs and
                deploys tested agent swarms with guaranteed replacement.
              </p>

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

              <div className="flex items-center gap-2 pt-2 text-xs text-ink-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-forest" />
                <span>
                  Zero upfront retainer until your strategist delivers the
                  signed SOP architecture blueprint.
                </span>
              </div>
            </div>

            {/* Right Risograph Spot Illustration */}
            <div className="flex justify-center lg:col-span-4 lg:justify-end">
              <SpotIllustration
                variant="cta"
                className="h-36 w-36 sm:h-44 sm:w-44"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
