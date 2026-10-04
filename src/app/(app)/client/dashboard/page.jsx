"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Briefcase,
  Zap,
  ArrowRight,
  ChevronRight,
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Activity,
  Layers,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromptBox } from "@/components/home/prompt-box";
import { QuickStartRow } from "@/components/home/quick-start-card";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function ClientDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await fetch("/api/client/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load client dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <LogoLoader />
        <p className="text-sm font-medium text-ink-3">
          Loading company automation dashboard...
        </p>
      </div>
    );
  }

  const briefs = data?.briefs || [];
  const proposals = data?.proposals || [];
  const engagements = data?.engagements || [];
  const shortlists = data?.shortlists || [];
  const activityFeed = data?.activityFeed || [];
  const quota = data?.quota || { quota: 50, used: 0, remaining: 50 };
  const org = data?.organization;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* 1. Prompt Box */}
      <section>
        <PromptBox
          role="CLIENT"
          headline="What would you like to automate next?"
          placeholder="Describe your process (e.g., triage 4,000 monthly Zendesk tickets with LangGraph supervisor)..."
        />
      </section>

      {/* 2. Top Stats & Quota Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-surface shadow-xs space-y-1 rounded-2xl border border-line p-5">
          <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
            Active Briefs
          </span>
          <div className="text-2xl font-bold text-ink">{briefs.length}</div>
          <p className="text-2xs text-ink-3">Open demand specifications</p>
        </div>

        <div className="bg-surface shadow-xs space-y-1 rounded-2xl border border-line p-5">
          <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
            Proposals Received
          </span>
          <div className="text-2xl font-bold text-brand-indigo">
            {proposals.length}
          </div>
          <p className="text-2xs text-ink-3">
            From vetted top 3% fractional leaders
          </p>
        </div>

        <div className="bg-surface shadow-xs space-y-1 rounded-2xl border border-line p-5">
          <span className="text-ink-4 text-2xs font-semibold uppercase tracking-wider">
            Active Engagements
          </span>
          <div className="text-2xl font-bold text-emerald-600">
            {engagements.length}
          </div>
          <p className="text-2xs text-ink-3">Autonomous agent deployments</p>
        </div>

        {/* AI Analysis Quota Meter */}
        <div className="border-brand-indigo/20 bg-brand-indigo/5 shadow-xs space-y-2 rounded-2xl border p-5">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-wider text-brand-indigo">
              AI Analysis Quota
            </span>
            <Sparkles className="h-3.5 w-3.5 text-brand-indigo" />
          </div>
          <div className="text-xl font-bold text-ink">
            {quota.used} / {quota.quota}{" "}
            <span className="text-xs font-normal text-ink-3">used</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-indigo transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((quota.used / quota.quota) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <section>
        <QuickStartRow role="CLIENT" />
      </section>

      {/* 4. Active Briefs & Mapped Workflows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Briefs & Workflows (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-indigo" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Active Automation Briefs
              </h2>
            </div>
            <Link href="/client/briefs/new">
              <Button
                size="sm"
                className="hover:bg-brand-indigo/90 bg-brand-indigo"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" /> New Brief
              </Button>
            </Link>
          </div>

          {briefs.length === 0 ? (
            <div className="bg-surface shadow-xs space-y-3 rounded-2xl border border-line p-10 text-center">
              <FileText className="text-ink-4 mx-auto h-8 w-8" />
              <h3 className="text-sm font-semibold text-ink">
                No briefs created yet
              </h3>
              <p className="mx-auto max-w-sm text-xs text-ink-3">
                Turn your messy operating procedures into a scored automation
                map and hire a vetted Fractional Head of AI.
              </p>
              <Link href="/client/briefs/new">
                <Button size="sm" className="mt-2 bg-brand-indigo text-white">
                  Create Your First Brief
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {briefs.map((brief) => {
                const workflowCount = brief.workflows?.length || 0;
                return (
                  <div
                    key={brief.id}
                    className="bg-surface shadow-xs flex flex-col gap-3 rounded-2xl border border-line p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/client/briefs/${brief.id}/workflows`}
                          className="text-sm font-bold text-ink transition-colors hover:text-brand-indigo"
                        >
                          {brief.title}
                        </Link>
                        <Badge
                          variant="outline"
                          className={
                            brief.status === "PUBLISHED"
                              ? "border-emerald-300 bg-emerald-50 text-2xs text-emerald-700"
                              : "border-line text-2xs text-ink-3"
                          }
                        >
                          {brief.status}
                        </Badge>
                      </div>
                      <p className="line-clamp-1 text-2xs text-ink-3">
                        {brief.problemDescription || "No description provided"}
                      </p>
                      <div className="text-ink-4 flex items-center gap-3 pt-1 text-2xs">
                        <span>
                          Budget: ${brief.budgetMin?.toLocaleString()} - $
                          {brief.budgetMax?.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-brand-indigo">
                          <Layers className="h-3 w-3" /> {workflowCount}{" "}
                          Workflows Mapped
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link href={`/client/briefs/${brief.id}/workflows`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-line bg-canvas"
                        >
                          <Zap className="text-brand-orange h-3.5 w-3.5" />{" "}
                          Workflow Mapper
                        </Button>
                      </Link>
                      <Link href={`/client/briefs/${brief.id}/edit`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-ink-3"
                        >
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Proposals Section */}
          {proposals.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Briefcase className="text-brand-orange h-4 w-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                  Pending Strategist Proposals ({proposals.length})
                </h3>
              </div>

              <div className="space-y-2">
                {proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-surface shadow-xs flex items-center justify-between rounded-xl border border-line p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-brand-indigo/10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-brand-indigo">
                        {prop.strategistProfile?.user?.name?.[0] || "S"}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink">
                          {prop.strategistProfile?.user?.name}
                        </div>
                        <div className="text-2xs text-ink-3">
                          Proposed: ${prop.proposedRate}/mo • {prop.job?.title}
                        </div>
                      </div>
                    </div>

                    <Link href="/client/proposals">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-brand-indigo"
                      >
                        Review Proposal{" "}
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Activity Feed & Team (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
              Recent Activity Feed
            </h2>
          </div>

          <div className="bg-surface shadow-xs space-y-4 rounded-2xl border border-line p-5">
            {activityFeed.length === 0 ? (
              <div className="py-6 text-center text-xs text-ink-3">
                No recent activity events recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((act) => (
                  <div
                    key={act.id}
                    className="border-b border-line pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-xs font-semibold text-ink">
                      {act.title}
                    </p>
                    <span className="text-ink-4 text-2xs">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Team Invite Box */}
          <div className="shadow-xs space-y-3 rounded-2xl border border-line bg-canvas p-5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-brand-indigo" />
              <h3 className="text-xs font-bold text-ink">Team Collaboration</h3>
            </div>
            <p className="text-2xs leading-relaxed text-ink-3">
              Invite colleagues to review automation maps and interview
              candidates.
            </p>
            <Link href="/client/onboarding">
              <Button
                size="sm"
                variant="outline"
                className="bg-surface w-full border-line text-xs"
              >
                Manage Organization & Invites
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
