"use client";

import React from "react";
import { SpotIllustration } from "@/components/marketing/illustrations/spot-illustration";
import { ProductPeek } from "./product-peek";
import {
  GitBranch,
  Clock,
  ShieldCheck,
  Briefcase,
  Award,
  CreditCard,
} from "lucide-react";

export function AuthSidePanel({
  mode = "login", // "login" | "signup" | "reset" | "verify" | "invite"
  role = "CLIENT", // "CLIENT" | "STRATEGIST"
  headline = null,
  stats = null,
}) {
  const getEyebrow = () => {
    if (mode === "login") return "Autonomous Operations";
    if (mode === "signup")
      return role === "CLIENT" ? "Enterprise AI" : "Strategist Network";
    if (mode === "reset") return "Security & Access";
    return "Fractional AI Leadership";
  };

  const getHeadline = () => {
    if (headline) return headline;
    if (mode === "login") return "Welcome back to your autonomous workforce.";
    if (mode === "reset")
      return "Calm, verified access recovery for your team.";
    if (mode === "verify")
      return "Verifying your identity on the Loopwise ledger.";
    if (mode === "invite")
      return "Join an enterprise organization on Loopwise.";

    // Signup mode
    if (role === "STRATEGIST") {
      return "High-impact fractional roles with escrow certainty.";
    }
    return "Scale your company with vetted fractional Heads of AI.";
  };

  const clientBenefits = [
    {
      title: "Map workflows",
      desc: "Decompose internal SOPs into deterministic state machines.",
      icon: GitBranch,
      bg: "bg-[#A9A4F0]/20 text-[#4B3FD6] border-[#A9A4F0]/40",
    },
    {
      title: "Matched in 48 hours",
      desc: "Handpicked from the top 3% verified practitioners.",
      icon: Clock,
      bg: "bg-[#9BE59B]/20 text-[#1E7A3C] border-[#9BE59B]/40",
    },
    {
      title: "Escrow-protected payments",
      desc: "Funds released only upon verified milestone delivery.",
      icon: ShieldCheck,
      bg: "bg-[#EC6B4F]/20 text-[#D94A12] border-[#EC6B4F]/40",
    },
  ];

  const strategistBenefits = [
    {
      title: "Vetted enterprise work",
      desc: "Direct access to funded companies with clear mandates.",
      icon: Briefcase,
      bg: "bg-[#3FB28F]/20 text-[#0E7052] border-[#3FB28F]/40",
    },
    {
      title: "Fractional engagements",
      desc: "10-25 hrs/wk retainers designed for autonomous leaders.",
      icon: Award,
      bg: "bg-[#F7C35A]/20 text-[#8A6A00] border-[#F7C35A]/40",
    },
    {
      title: "Paid via escrow",
      desc: "Guaranteed payouts via Stripe Connect milestone contracts.",
      icon: CreditCard,
      bg: "bg-[#F27BB3]/20 text-[#B81965] border-[#F27BB3]/40",
    },
  ];

  const benefits = role === "STRATEGIST" ? strategistBenefits : clientBenefits;

  return (
    <div className="relative flex h-full w-full select-none flex-col justify-between overflow-hidden rounded-[28px] border border-line bg-gradient-to-br from-[#FFE7DC] via-[#F5EFEB] to-[#E7EFE9] p-8 dark:from-[#2B1812] dark:via-[#1E1B17] dark:to-[#17221C] lg:p-12">
      {/* Soft Blurred Glows Inside Right Panel (NO GRID) */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-brand-accent/15 blur-[90px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-brand-indigo/10 blur-[90px]"
        aria-hidden="true"
      />

      {/* Top Header & Headline */}
      <div className="relative z-10 max-w-md space-y-4">
        <div className="bg-panel/80 backdrop-blur-xs inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
          <span>{getEyebrow()}</span>
        </div>

        <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink transition-all duration-200 lg:text-3xl">
          {getHeadline()}
        </h2>

        {/* Spot Illustration */}
        <div className="pt-2">
          <SpotIllustration
            variant={role === "STRATEGIST" ? "match" : "deploy"}
            className="h-20 w-20"
          />
        </div>
      </div>

      {/* Middle: Benefit Rows (Crossfades 200ms on role change) */}
      <div className="relative z-10 my-6 max-w-md space-y-3.5 transition-opacity duration-200">
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="bg-panel/75 backdrop-blur-xs border-line/80 flex items-start gap-3.5 rounded-2xl border p-3 transition-colors hover:bg-panel"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${b.bg}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold leading-tight text-ink">
                  {b.title}
                </h4>
                <p className="mt-0.5 text-[11px] leading-snug text-ink-2">
                  {b.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Real Product Peek Card */}
      <div className="relative z-10 max-w-md pt-2">
        <ProductPeek stats={stats || undefined} />
      </div>
    </div>
  );
}
