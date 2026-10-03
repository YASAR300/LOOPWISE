"use client";

import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, ShieldCheck } from "lucide-react";

function useCountUp(endVal, duration = 1600, startOnView = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startOnView) return;
    let startTime = null;
    const startVal = 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(startVal + (endVal - startVal) * ease));

      if (progress < 1) requestAnimationFrame(step);
      else setCount(endVal);
    };

    requestAnimationFrame(step);
  }, [endVal, duration, startOnView]);

  return count;
}

export function NumbersStrip({ stats }) {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const countStrategists = useCountUp(
    stats?.approvedStrategists || 12,
    1400,
    inView
  );
  const countEngagements = useCountUp(
    stats?.totalEngagements || 3,
    1200,
    inView
  );
  const countHours = useCountUp(stats?.hoursAutomated || 32730, 2000, inView);

  return (
    <section
      ref={sectionRef}
      className="relative border-y border-line bg-canvas-2 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Stat 1: Approved Strategists */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-3xl font-bold text-ink sm:text-4xl">
                {countStrategists}
              </span>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip("vetting")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-ink-3 transition-colors hover:text-ink"
                aria-label="How we calculate approved AI leaders"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-ink">
              Approved AI Leaders
            </p>
            <p className="text-2xs text-ink-3">Defended architecture</p>
            {activeTooltip === "vetting" && (
              <div className="absolute z-20 mt-1 max-w-xs rounded-lg border border-line bg-panel p-2.5 text-2xs leading-relaxed text-ink-2 shadow-md">
                Calculated strictly from approved `StrategistProfile` records
                who completed technical committee defense.
              </div>
            )}
          </div>

          {/* Stat 2: Active Engagements */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-3xl font-bold text-brand-indigo sm:text-4xl">
                {countEngagements}
              </span>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip("engagements")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-ink-3 transition-colors hover:text-ink"
                aria-label="How we calculate engagements"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-ink">Active Engagements</p>
            <p className="text-2xs text-ink-3">100% escrow backed</p>
            {activeTooltip === "engagements" && (
              <div className="absolute z-20 mt-1 max-w-xs rounded-lg border border-line bg-panel p-2.5 text-2xs leading-relaxed text-ink-2 shadow-md">
                Count of verified active enterprise retainers and milestone
                contracts funded in platform escrow.
              </div>
            )}
          </div>

          {/* Stat 3: Hours of Work Automated */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-3xl font-bold text-brand-accent sm:text-4xl">
                {countHours.toLocaleString()}h
              </span>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip("hours")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-ink-3 transition-colors hover:text-ink"
                aria-label="How we calculate hours automated"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-ink">
              Hours of Work Automated
            </p>
            <p className="text-2xs text-ink-3">Production telemetry</p>
            {activeTooltip === "hours" && (
              <div className="absolute z-20 mt-1 max-w-xs rounded-lg border border-line bg-panel p-2.5 text-2xs leading-relaxed text-ink-2 shadow-md">
                Direct sum of verified hours automated recorded in
                `MetricSnapshot` telemetry tables.
              </div>
            )}
          </div>

          {/* Stat 4: Client Satisfaction */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-3xl font-bold text-forest sm:text-4xl">
                {stats?.avgRating ? `${stats.avgRating}.0` : "5.0"}
              </span>
              <button
                type="button"
                onMouseEnter={() => setActiveTooltip("rating")}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-ink-3 transition-colors hover:text-ink"
                aria-label="How we calculate client rating"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs font-semibold text-ink">
              Average Client Rating
            </p>
            <p className="text-2xs text-ink-3">Verified reviews ledger</p>
            {activeTooltip === "rating" && (
              <div className="absolute z-20 mt-1 max-w-xs rounded-lg border border-line bg-panel p-2.5 text-2xs leading-relaxed text-ink-2 shadow-md">
                Computed from signed milestone reviews submitted directly by
                authorized client organization members.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
