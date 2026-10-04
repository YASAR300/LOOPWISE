"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Layers,
  Search,
  Star,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Bookmark,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ToolChipRow } from "@/components/ui/tool-chip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ClientProposalsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlJobId = searchParams.get("jobId");
  const urlProposalId = searchParams.get("proposalId");

  const [proposals, setProposals] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(urlJobId || "ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Side Drawer / Peek Panel
  const [activeProposal, setActiveProposal] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Action Modals
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declining, setDeclining] = useState(false);

  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [changesNotes, setChangesNotes] = useState("");
  const [requestingChanges, setRequestingChanges] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, [selectedJobId, statusFilter]);

  useEffect(() => {
    if (urlProposalId) {
      loadProposalDetail(urlProposalId);
    }
  }, [urlProposalId]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedJobId !== "ALL") params.set("jobId", selectedJobId);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/client/proposals?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load proposals");
      setProposals(data.proposals || []);
      setJobs(data.jobs || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProposalDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/client/proposals/${id}`);
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to load proposal details");
      setActiveProposal(data.proposal);

      // Update proposal status in list if it changed to VIEWED
      setProposals((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: data.proposal.status } : p
        )
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAction = async (action, extra = {}) => {
    if (!activeProposal) return;
    try {
      const res = await fetch(
        `/api/client/proposals/${activeProposal.id}/action`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...extra }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      toast.success(
        `Proposal status updated to ${data.proposal.status.toLowerCase()}`
      );
      setActiveProposal((prev) => ({ ...prev, ...data.proposal }));
      setProposals((prev) =>
        prev.map((p) =>
          p.id === activeProposal.id
            ? { ...p, status: data.proposal.status }
            : p
        )
      );

      if (action === "accept") {
        router.push(`/client/engagements`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeclineSubmit = async () => {
    setDeclining(true);
    try {
      await handleAction("decline", { reason: declineReason });
      setDeclineModalOpen(false);
      setDeclineReason("");
    } finally {
      setDeclining(false);
    }
  };

  const handleChangesSubmit = async () => {
    setRequestingChanges(true);
    try {
      await handleAction("request_changes", { notes: changesNotes });
      setChangesModalOpen(false);
      setChangesNotes("");
    } finally {
      setRequestingChanges(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.strategist.name.toLowerCase().includes(q) ||
      p.jobTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="border-brand-indigo/20 bg-brand-indigo/10 flex h-10 w-10 items-center justify-center rounded-xl border text-brand-indigo">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Client Proposal Inbox
            </h1>
            <p className="text-xs text-ink-3">
              Review and manage incoming scopes from vetted Heads of AI
            </p>
          </div>
        </div>

        <span className="rounded-full border border-line bg-panel-2 px-3 py-1 text-xs font-semibold text-ink">
          {filteredProposals.length} Proposals
        </span>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by strategist or role..."
            className="w-full rounded-xl border border-line bg-canvas py-2 pl-9 pr-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
          />
        </div>

        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
        >
          <option value="ALL">All Jobs & Briefs</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
        >
          <option value="ALL">All Statuses</option>
          <option value="SENT">Sent (Unviewed)</option>
          <option value="VIEWED">Viewed</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DECLINED">Declined</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>

      {/* Proposal Split View: List on Left, Detail Panel on Right */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column: Proposals List */}
        <div
          className={`${activeProposal ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}
        >
          {loading ? (
            <div className="p-16 text-center text-xs text-ink-3">
              Loading incoming proposals...
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="shadow-xs rounded-2xl border border-line bg-panel p-12 text-center">
              <Layers className="mx-auto mb-2 h-8 w-8 text-ink-3" />
              <h3 className="text-sm font-semibold text-ink">
                No proposals found
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-ink-3">
                Proposals submitted by candidates or invited strategists will
                show up here.
              </p>
            </div>
          ) : (
            filteredProposals.map((p) => {
              const isSelected = activeProposal?.id === p.id;
              const statusColor =
                p.status === "ACCEPTED"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : p.status === "SHORTLISTED"
                    ? "bg-brand-accent-soft text-brand-accent border-brand-accent/30"
                    : p.status === "DECLINED"
                      ? "bg-red-500/10 text-red-600 border-red-500/30"
                      : "bg-panel-2 text-ink-3 border-line";

              return (
                <div
                  key={p.id}
                  onClick={() => loadProposalDetail(p.id)}
                  className={`shadow-xs cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "bg-brand-indigo/2 border-brand-indigo ring-1 ring-brand-indigo"
                      : "border-line bg-panel hover:border-line-2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">
                          {p.strategist.name}
                        </span>
                        {p.matchScore && (
                          <span className="py-0.2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 font-mono text-[10px] font-bold text-emerald-600">
                            {Math.round(p.matchScore)}% match
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-1 text-xs text-ink-3">
                        {p.jobTitle}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider ${statusColor}`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="border-line/60 mt-3 flex items-center justify-between border-t pt-2 text-2xs text-ink-2">
                    <span className="font-mono font-bold text-ink">
                      ${p.proposedRate.toLocaleString()} (
                      {p.proposedModel.toLowerCase()})
                    </span>
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Active Proposal Peek Drawer */}
        {activeProposal && (
          <div className="animate-in fade-in space-y-6 rounded-2xl border border-line bg-panel p-6 shadow-sm lg:col-span-7">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="space-y-1">
                <span className="text-2xs font-bold uppercase tracking-wider text-ink-3">
                  Proposal for {activeProposal.job.title}
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">
                    {activeProposal.strategist.name}
                  </h2>
                  {activeProposal.matchScore && (
                    <span className="bg-brand-indigo/10 border-brand-indigo/30 rounded-full border px-2 py-0.5 font-mono text-xs font-bold text-brand-indigo">
                      {Math.round(activeProposal.matchScore)}% AI Fit
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveProposal(null)}
                className="rounded-lg p-1.5 text-ink-3 hover:bg-panel-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Commercials Summary Strip */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-panel-2 p-3 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase text-ink-3">
                  Model
                </p>
                <p className="mt-0.5 text-xs font-bold text-ink">
                  {activeProposal.proposedModel}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-ink-3">
                  Rate / Retainer
                </p>
                <p className="mt-0.5 font-mono text-xs font-bold text-ink">
                  ${activeProposal.proposedRate.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase text-ink-3">
                  Weekly Bandwidth
                </p>
                <p className="mt-0.5 text-xs font-bold text-ink">
                  {activeProposal.hoursPerWeek || 20} hrs/wk
                </p>
              </div>
            </div>

            {/* Cover Note Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Strategy & Cover Note
              </h3>
              <div className="whitespace-pre-wrap rounded-xl border border-line bg-canvas p-4 text-xs leading-relaxed text-ink">
                {activeProposal.coverLetter}
              </div>
            </div>

            {/* Milestone Plan (if present) */}
            {Array.isArray(activeProposal.milestones) &&
              activeProposal.milestones.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Proposed Milestones
                  </h3>
                  <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {activeProposal.milestones.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-panel p-3 text-xs"
                      >
                        <span className="font-medium text-ink">
                          {i + 1}. {m.title}
                        </span>
                        <span className="font-mono font-bold text-ink">
                          ${m.amount?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Screening Answers (if present) */}
            {activeProposal.screeningAnswers &&
              Object.keys(activeProposal.screeningAnswers).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3">
                    Screening Answers
                  </h3>
                  <div className="space-y-2 rounded-xl border border-line bg-panel-2 p-3 text-xs">
                    {Object.entries(activeProposal.screeningAnswers).map(
                      ([k, ans]) => (
                        <div key={k} className="space-y-0.5">
                          <p className="font-semibold text-ink-2">
                            Question {parseInt(k, 10) + 1}:
                          </p>
                          <p className="rounded-lg border border-line bg-panel p-2 text-ink">
                            {ans}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction("shortlist")}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-panel-2"
                >
                  <Bookmark className="h-3.5 w-3.5 text-brand-accent" />
                  <span>Shortlist</span>
                </button>

                <Link
                  href={`/app/messages`}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-panel-2"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-ink-3" />
                  <span>Message</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setChangesModalOpen(true)}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-panel-2"
                >
                  Request Changes
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeclineModalOpen(true)}
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Decline
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("accept")}
                  className="btn-primary-indigo shadow-xs flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Accept Proposal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decline Reason Modal */}
      <Dialog open={declineModalOpen} onOpenChange={setDeclineModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Proposal</DialogTitle>
            <DialogDescription>
              Provide constructive feedback to {activeProposal?.strategist.name}
              . An automated notification will be sent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="block text-xs font-semibold text-ink">
              Feedback / Reason:
            </label>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="We decided to pursue another candidate who had deeper NetSuite integration experience..."
              className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeclineModalOpen(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-3 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={declining}
              onClick={handleDeclineSubmit}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {declining ? "Declining..." : "Confirm Decline"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Changes Modal */}
      <Dialog open={changesModalOpen} onOpenChange={setChangesModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Proposal Changes</DialogTitle>
            <DialogDescription>
              Ask {activeProposal?.strategist.name} to adjust their commercial
              terms, timeline, or scope.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="block text-xs font-semibold text-ink">
              Adjustment Request:
            </label>
            <textarea
              rows={3}
              value={changesNotes}
              onChange={(e) => setChangesNotes(e.target.value)}
              placeholder="Can we adjust the hours to 15 hrs/week and push the start date back one week?"
              className="w-full rounded-xl border border-line bg-canvas p-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setChangesModalOpen(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-3 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={requestingChanges}
              onClick={handleChangesSubmit}
              className="btn-primary-indigo px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              {requestingChanges ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
