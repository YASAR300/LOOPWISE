// src/components/engagements/cadence-tab.jsx
"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  Plus,
  Send,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Heart,
  Eye,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function CadenceTab({
  engagementId,
  weeklyUpdates = [],
  userRole = "CLIENT",
  isClosed = false,
  onRefresh,
}) {
  const isClient = userRole === "CLIENT";
  const isStrategist = userRole === "STRATEGIST";

  const [isPosting, setIsPosting] = useState(false);
  const [done, setDone] = useState("");
  const [next, setNext] = useState("");
  const [risks, setRisks] = useState("");
  const [decisionsNeeded, setDecisionsNeeded] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [acknowledgingId, setAcknowledgingId] = useState(null);
  const [clientReaction, setClientReaction] = useState("THUMBS_UP");
  const [clientNotes, setClientNotes] = useState("");

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!done.trim() || !next.trim()) {
      toast.error("Please fill in both Done and Next sections.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/engagements/${engagementId}/cadence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          done: done.trim(),
          next: next.trim(),
          risks: risks.trim(),
          decisionsNeeded: decisionsNeeded.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to post weekly update");

      toast.success("Weekly update published to engagement timeline! 🚀");
      setIsPosting(false);
      setDone("");
      setNext("");
      setRisks("");
      setDecisionsNeeded("");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcknowledge = async (updateId) => {
    try {
      const res = await fetch(
        `/api/engagements/${engagementId}/cadence/${updateId}/acknowledge`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientReaction, clientNotes }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to acknowledge");

      toast.success("Weekly update acknowledged!");
      setAcknowledgingId(null);
      setClientNotes("");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">
            Weekly Rhythm & Cadence
          </h3>
          <p className="text-2xs text-ink-3">
            Structured operating rhythm: Done, Next, Risks, and Decisions
            Needed.
          </p>
        </div>

        {isStrategist && !isClosed && (
          <button
            onClick={() => setIsPosting(true)}
            className="btn-primary-orange inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post Weekly Update</span>
          </button>
        )}
      </div>

      {/* Post Modal / Expandable Form */}
      {isPosting && (
        <form
          onSubmit={handlePostUpdate}
          className="border-brand-indigo/30 space-y-4 rounded-2xl border bg-panel p-6 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h4 className="text-xs font-bold text-ink">
              Publish Weekly Progress Report
            </h4>
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="text-xs text-ink-3 hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Done (What was completed this week)</span>
              </label>
              <textarea
                rows={4}
                required
                value={done}
                onChange={(e) => setDone(e.target.value)}
                placeholder="• Deployed LangGraph supervisor node&#10;• Integrated Salesforce OAuth credential"
                className="input-base w-full text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-brand-indigo">
                <Clock className="h-3.5 w-3.5" />
                <span>Next (Priorities for next week)</span>
              </label>
              <textarea
                rows={4}
                required
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="• Run eval harness across 500 edge tickets&#10;• Deliver board-level ROI report"
                className="input-base w-full text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Risks & Blockers (Optional)</span>
              </label>
              <textarea
                rows={3}
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                placeholder="Any technical or infrastructure friction..."
                className="input-base w-full text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-semibold text-tile-coral">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Decisions Needed from Client (Optional)</span>
              </label>
              <textarea
                rows={3}
                value={decisionsNeeded}
                onChange={(e) => setDecisionsNeeded(e.target.value)}
                placeholder="Approve sandbox API keys or confirm staging URL..."
                className="input-base w-full text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-2">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="btn-outline px-3 py-1.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-orange px-4 py-1.5 text-xs font-semibold"
            >
              {isSubmitting ? "Publishing..." : "Publish Update"}
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      <div className="space-y-4">
        {weeklyUpdates.length === 0 ? (
          <div className="rounded-2xl border border-line bg-panel p-12 text-center text-xs text-ink-3">
            No weekly updates published yet. Operating rhythm updates will
            appear here chronologically.
          </div>
        ) : (
          weeklyUpdates.map((update) => (
            <div
              key={update.id}
              className="shadow-xs space-y-4 rounded-2xl border border-line bg-panel p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-indigo/10 rounded-lg px-2.5 py-1 font-mono text-xs font-bold text-brand-indigo">
                    Week {update.weekNumber}
                  </span>
                  <span className="text-xs text-ink-3">
                    {new Date(update.startDate).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    –{" "}
                    {new Date(update.endDate).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {update.acknowledgedAt ? (
                  <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-2xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Acknowledged by Client</span>
                  </div>
                ) : isClient && !isClosed ? (
                  <button
                    onClick={() => setAcknowledgingId(update.id)}
                    className="btn-outline px-3 py-1 text-xs font-semibold"
                  >
                    Acknowledge Update
                  </button>
                ) : (
                  <span className="text-ink-4 text-2xs">
                    Awaiting Client Review
                  </span>
                )}
              </div>

              {/* 4 Quadrants */}
              <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                {/* Done */}
                <div className="border-line/60 bg-panel-2/50 space-y-1.5 rounded-xl border p-3.5">
                  <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Done</span>
                  </div>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-2">
                    {update.done}
                  </p>
                </div>

                {/* Next */}
                <div className="border-line/60 bg-panel-2/50 space-y-1.5 rounded-xl border p-3.5">
                  <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-brand-indigo">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Next Up</span>
                  </div>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-2">
                    {update.next}
                  </p>
                </div>

                {/* Risks */}
                {update.risks && (
                  <div className="border-line/60 bg-panel-2/50 space-y-1.5 rounded-xl border p-3.5">
                    <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Risks & Blockers</span>
                    </div>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-2">
                      {update.risks}
                    </p>
                  </div>
                )}

                {/* Decisions Needed */}
                {update.decisionsNeeded && (
                  <div className="border-line/60 bg-panel-2/50 space-y-1.5 rounded-xl border p-3.5">
                    <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-tile-coral">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Decisions Needed</span>
                    </div>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-2">
                      {update.decisionsNeeded}
                    </p>
                  </div>
                )}
              </div>

              {/* Client Notes / Feedback */}
              {update.clientNotes && (
                <div className="border-line/50 border-t pt-2 text-2xs text-ink-3">
                  <span className="font-semibold text-ink">
                    Client Feedback:{" "}
                  </span>
                  &ldquo;{update.clientNotes}&rdquo;
                </div>
              )}

              {/* Inline Acknowledgment Modal */}
              {acknowledgingId === update.id && (
                <div className="border-brand-indigo/30 bg-brand-indigo/5 mt-3 space-y-3 rounded-xl border p-4 text-xs">
                  <span className="font-bold text-brand-indigo">
                    Acknowledge Week {update.weekNumber} Report
                  </span>
                  <input
                    type="text"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Optional feedback (e.g. Great progress, API keys sent)..."
                    className="input-base w-full py-1.5 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setAcknowledgingId(null)}
                      className="btn-outline px-3 py-1 text-2xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAcknowledge(update.id)}
                      className="btn-primary-orange px-3 py-1 text-2xs font-semibold"
                    >
                      Confirm Acknowledgment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
