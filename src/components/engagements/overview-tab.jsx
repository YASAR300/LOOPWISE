// src/components/engagements/overview-tab.jsx
"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Calendar,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileText,
  User,
  Zap,
} from "lucide-react";

export function OverviewTab({
  engagement,
  metrics,
  userRole = "CLIENT",
  onOpenContract,
  onOpenControls,
}) {
  const isClient = userRole === "CLIENT";
  const org = engagement.organization;
  const strategist = engagement.strategistProfile;

  const milestones = engagement.milestones || [];
  const nextMilestone = milestones.find((m) => m.status === "PENDING");
  const deliverables = engagement.deliverables || [];
  const approvedCount = deliverables.filter(
    (d) => d.stage === "APPROVED"
  ).length;
  const inProgressCount = deliverables.filter(
    (d) => d.stage === "IN_PROGRESS"
  ).length;
  const inReviewCount = deliverables.filter(
    (d) => d.stage === "IN_REVIEW"
  ).length;

  const hoursThisWeek = metrics?.hoursThisWeek || 0;
  const weeklyCap = metrics?.weeklyCap || engagement.hourlyWeeklyCap || 20;
  const percentUsed = Math.min(
    100,
    Math.round((hoursThisWeek / weeklyCap) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Top Health & Commercial Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* Health Status */}
        <div className="shadow-xs space-y-2 rounded-2xl border border-line bg-panel p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
            Engagement Health
          </span>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                engagement.healthStatus === "ON_TRACK"
                  ? "bg-emerald-500 ring-4 ring-emerald-500/20"
                  : engagement.healthStatus === "AT_RISK"
                    ? "bg-amber-500 ring-4 ring-amber-500/20"
                    : "bg-red-500 ring-4 ring-red-500/20"
              }`}
            />
            <span className="text-base font-bold text-ink">
              {engagement.healthStatus.replace("_", " ")}
            </span>
          </div>
          <p className="text-2xs text-ink-3">
            Active for {metrics?.daysActive || 1} days • {engagement.status}
          </p>
        </div>

        {/* Weekly Hours vs. Cap */}
        <div className="shadow-xs space-y-2 rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Weekly Allocation
            </span>
            <Clock className="h-3.5 w-3.5 text-brand-indigo" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-ink">
              {hoursThisWeek}h
            </span>
            <span className="text-xs text-ink-3">/ {weeklyCap}h cap</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-indigo transition-all duration-300"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* Deliverables Progress */}
        <div className="shadow-xs space-y-2 rounded-2xl border border-line bg-panel p-5">
          <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
            Deliverables Completed
          </span>
          <div className="text-2xl font-bold text-ink">
            {approvedCount}{" "}
            <span className="text-xs font-normal text-ink-3">
              / {deliverables.length} total
            </span>
          </div>
          <div className="flex gap-2 text-2xs text-ink-3">
            <span className="text-brand-orange">{inReviewCount} in review</span>
            <span>•</span>
            <span>{inProgressCount} in progress</span>
          </div>
        </div>

        {/* Contract Status Card */}
        <div className="shadow-xs space-y-2 rounded-2xl border border-line bg-panel p-5">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Agreement & Escrow
            </span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-ink">
            {engagement.contract?.status || "Pending"}
          </div>
          <button
            onClick={onOpenContract}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-indigo hover:underline"
          >
            <span>View Agreement</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 14-Day Trial Guarantee Alert (if active) */}
      {metrics?.isWithinTrialGuarantee && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-ink">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                Loopwise 14-Day Trial Fit Guarantee Active
              </span>
              <p className="mt-0.5 text-2xs text-ink-3">
                You are in Day {metrics.daysActive} of your 14-day evaluation
                window. If this engagement isn&apos;t the right fit, you can
                request a dedicated strategist replacement.
              </p>
            </div>
          </div>
          {isClient && (
            <button
              onClick={() => onOpenControls("REPLACEMENT")}
              className="btn-outline shrink-0 px-3 py-1 text-2xs font-semibold"
            >
              Request Replacement
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Next Milestone & Workflow Context */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Next Milestone & Deliverables (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink">Next Milestone</h3>
              {nextMilestone?.dueDate && (
                <span className="text-2xs text-ink-3">
                  Target: {new Date(nextMilestone.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {nextMilestone ? (
              <div className="bg-panel-2/50 space-y-2 rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-ink">
                    {nextMilestone.title}
                  </div>
                  <span className="font-mono text-xs font-bold text-brand-indigo">
                    ${nextMilestone.amount.toLocaleString()}
                  </span>
                </div>
                {nextMilestone.description && (
                  <p className="text-xs text-ink-2">
                    {nextMilestone.description}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-ink-3">
                No pending milestones. Retainer is billed on a regular monthly
                cadence.
              </p>
            )}
          </div>

          {/* Quick Scope of Work */}
          <div className="shadow-xs space-y-3 rounded-2xl border border-line bg-panel p-6">
            <h3 className="text-sm font-bold text-ink">Scope of Automation</h3>
            <p className="text-xs leading-relaxed text-ink-2">
              {engagement.contract?.scopeOfWork ||
                "Deploying fractional architecture, system integrations, and agent workflows."}
            </p>
          </div>
        </div>

        {/* Right Column: Collaborator & Quick Links (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Party Card */}
          <div className="shadow-xs space-y-3 rounded-2xl border border-line bg-panel p-5">
            <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              {isClient ? "Appointed Fractional Strategist" : "Client Sponsor"}
            </span>

            <div className="flex items-center gap-3">
              <div className="bg-brand-indigo/10 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-brand-indigo">
                {isClient
                  ? strategist?.user?.name?.[0] || "S"
                  : org?.name?.[0] || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-ink">
                  {isClient ? strategist?.user?.name : org?.name}
                </div>
                <div className="truncate text-2xs text-ink-3">
                  {isClient
                    ? strategist?.headline || strategist?.user?.email
                    : "Enterprise Account"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-line pt-3 text-2xs">
              <Link
                href="/app/messages"
                className="font-semibold text-brand-indigo hover:underline"
              >
                Send Direct Message
              </Link>
              <button
                onClick={onOpenContract}
                className="font-medium text-ink-3 hover:text-ink"
              >
                Contract Details
              </button>
            </div>
          </div>

          {/* Quick Controls Card */}
          <div className="shadow-xs space-y-2 rounded-2xl border border-line bg-panel p-5">
            <span className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
              Engagement Lifecycle
            </span>
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() =>
                  onOpenControls(
                    engagement.status === "PAUSED" ? "RESUME" : "PAUSE"
                  )
                }
                className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs font-semibold text-ink transition-colors hover:bg-panel-2"
              >
                <span>
                  {engagement.status === "PAUSED"
                    ? "Resume Engagement"
                    : "Pause Engagement"}
                </span>
                <Clock className="h-3.5 w-3.5 text-ink-3" />
              </button>

              <button
                onClick={() => onOpenControls("SCOPE_CHANGE")}
                className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs font-semibold text-ink transition-colors hover:bg-panel-2"
              >
                <span>Amend Scope of Work</span>
                <FileText className="h-3.5 w-3.5 text-ink-3" />
              </button>

              <button
                onClick={() => onOpenControls("END")}
                className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10"
              >
                <span>Conclude Engagement</span>
                <AlertTriangle className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
