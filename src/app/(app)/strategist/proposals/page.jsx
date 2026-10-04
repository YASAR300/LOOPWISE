"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export default function StrategistProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/strategist/proposals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load proposals");
      setProposals(data.proposals || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (proposalId, title) => {
    if (
      !confirm(
        `Are you sure you want to withdraw your proposal for "${title}"?`
      )
    )
      return;

    try {
      const res = await fetch(
        `/api/strategist/proposals/${proposalId}/withdraw`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to withdraw");

      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "WITHDRAWN" } : p
        )
      );
      toast.info("Proposal withdrawn");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">
            My Submitted Proposals
          </h1>
          <p className="text-xs text-ink-3">
            Track real-time client review statuses, feedback, and active bids
          </p>
        </div>

        <Link
          href="/strategist/jobs"
          className="btn-primary-orange shadow-xs flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Browse Opportunities</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-ink-3">
          Loading your proposals...
        </div>
      ) : proposals.length === 0 ? (
        <div className="shadow-xs rounded-2xl border border-line bg-panel p-12 text-center">
          <Layers className="mx-auto mb-2 h-8 w-8 text-ink-3" />
          <h3 className="text-sm font-semibold text-ink">
            No proposals submitted yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
            Browse open client workflow opportunities and apply with your custom
            scope.
          </p>
          <Link
            href="/strategist/jobs"
            className="btn-primary-orange mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            <span>Explore Open Jobs</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const statusConfig = {
              SENT: {
                label: "Sent (Unviewed)",
                color: "border-line bg-panel-2 text-ink-3",
              },
              VIEWED: {
                label: "Viewed by Client",
                color:
                  "border-brand-indigo/30 bg-brand-indigo/10 text-brand-indigo",
              },
              SHORTLISTED: {
                label: "Shortlisted",
                color:
                  "border-brand-accent/30 bg-brand-accent-soft text-brand-accent",
              },
              ACCEPTED: {
                label: "Accepted 🎉",
                color:
                  "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
              },
              DECLINED: {
                label: "Declined",
                color: "border-red-500/30 bg-red-500/10 text-red-600",
              },
              WITHDRAWN: {
                label: "Withdrawn",
                color: "border-line bg-panel-2 text-ink-3 opacity-60",
              },
            }[p.status] || {
              label: p.status,
              color: "border-line bg-panel-2 text-ink-3",
            };

            return (
              <div
                key={p.id}
                className="shadow-xs space-y-3 rounded-2xl border border-line bg-panel p-5 transition-all hover:border-line-2"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                        {p.organizationName}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold leading-tight text-ink">
                      {p.jobTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-ink-2">
                      <span className="font-mono font-bold text-ink">
                        ${p.proposedRate?.toLocaleString()} (
                        {p.proposedModel?.toLowerCase()})
                      </span>
                      <span>·</span>
                      <span>{p.hoursPerWeek || 20} hrs/week</span>
                      <span>·</span>
                      <span className="text-ink-3">
                        Submitted {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    {p.status !== "WITHDRAWN" && p.status !== "ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => handleWithdraw(p.id, p.jobTitle)}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:border-red-200 hover:text-red-600"
                      >
                        Withdraw
                      </button>
                    )}

                    {p.status === "ACCEPTED" && (
                      <Link
                        href="/strategist/engagements"
                        className="btn-primary-indigo shadow-xs px-3.5 py-1.5 text-xs font-semibold"
                      >
                        View Engagement
                      </Link>
                    )}
                  </div>
                </div>

                {/* Status Telemetry Note */}
                <div className="border-line/60 flex items-center justify-between border-t pt-2.5 text-2xs text-ink-3">
                  <div className="flex items-center gap-1.5">
                    {p.viewedAt ? (
                      <>
                        <Eye className="h-3 w-3 text-brand-indigo" />
                        <span>
                          Client reviewed this proposal on{" "}
                          {new Date(p.viewedAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>Awaiting client review</span>
                      </>
                    )}
                  </div>

                  {p.declineReason && (
                    <span className="max-w-sm truncate font-medium text-red-500">
                      Feedback: {p.declineReason}
                    </span>
                  )}
                  {p.changeRequestNotes && (
                    <span className="max-w-sm truncate font-medium text-amber-600">
                      Changes requested: {p.changeRequestNotes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
