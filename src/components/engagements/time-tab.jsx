// src/components/engagements/time-tab.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Square,
  Clock,
  Download,
  Plus,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  Layers,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

export function TimeTab({
  engagementId,
  timeEntries = [],
  deliverables = [],
  weeklyCap = 20,
  userRole = "CLIENT",
  isClosed = false,
  onRefresh,
}) {
  const isClient = userRole === "CLIENT";
  const isStrategist = userRole === "STRATEGIST";

  const [activeTimer, setActiveTimer] = useState(
    timeEntries.find((t) => t.isRunning) || null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDate, setManualDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [manualHours, setManualHours] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualDeliverableId, setManualDeliverableId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer ticker
  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      const startMs = new Date(
        activeTimer.startTime || activeTimer.createdAt
      ).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        setElapsedSeconds(Math.max(0, Math.floor((now - startMs) / 1000)));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = async () => {
    try {
      const res = await fetch(`/api/engagements/${engagementId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "START_TIMER" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start timer");

      setActiveTimer(data.entry);
      toast.success("Timer started! Working session active.");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      const desc = window.prompt(
        "Session summary / work notes:",
        activeTimer.description
      );
      const res = await fetch(`/api/engagements/${engagementId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "STOP_TIMER",
          entryId: activeTimer.id,
          description: desc || activeTimer.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to stop timer");

      setActiveTimer(null);
      toast.success(`Timer stopped! Logged ${data.entry.hours} hours.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    if (!manualHours || !manualDesc.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/engagements/${engagementId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: manualDate,
          hours: parseFloat(manualHours),
          description: manualDesc.trim(),
          deliverableId: manualDeliverableId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to log time");

      toast.success(`Logged ${manualHours} hours.`);
      setIsManualModalOpen(false);
      setManualHours("");
      setManualDesc("");
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimesheetAction = async (timesheetWeek, action) => {
    try {
      let disputeReason = null;
      if (action === "DISPUTE") {
        disputeReason = window.prompt(
          "Reason for disputing timesheet entries:"
        );
        if (!disputeReason) return;
      }

      const res = await fetch(
        `/api/engagements/${engagementId}/time/timesheet`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timesheetWeek, action, disputeReason }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process timesheet");

      toast.success(
        action === "APPROVE"
          ? `Timesheet ${timesheetWeek} approved!`
          : `Timesheet ${timesheetWeek} disputed.`
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Group entries by timesheetWeek
  const groupedByWeek = timeEntries.reduce((acc, entry) => {
    const week = entry.timesheetWeek || "Unassigned";
    if (!acc[week]) acc[week] = [];
    acc[week].push(entry);
    return acc;
  }, {});

  const formatTimer = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Controls & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Time & Timesheets</h3>
          <p className="text-2xs text-ink-3">
            Track fractional hours against weekly caps and approve weekly
            timesheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/engagements/${engagementId}/time/export`}
            download
            className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </a>

          {isStrategist && !isClosed && (
            <>
              {activeTimer ? (
                <button
                  onClick={handleStopTimer}
                  className="shadow-xs inline-flex animate-pulse items-center gap-2 rounded-xl bg-red-600 px-4 py-1.5 font-mono text-xs font-bold text-white hover:bg-red-700"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>Stop Timer ({formatTimer(elapsedSeconds)})</span>
                </button>
              ) : (
                <button
                  onClick={handleStartTimer}
                  className="btn-primary-orange inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Live Timer</span>
                </button>
              )}

              <button
                onClick={() => setIsManualModalOpen(true)}
                className="btn-outline inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log Manual Hours</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isManualModalOpen && (
        <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleManualLog}
            className="w-full max-w-md space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h4 className="text-xs font-bold text-ink">Log Working Time</h4>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-xs text-ink-3 hover:text-ink"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">Date</label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="input-base w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-ink">
                  Hours Spent
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  required
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="input-base w-full font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Linked Deliverable (Optional)
              </label>
              <select
                value={manualDeliverableId}
                onChange={(e) => setManualDeliverableId(e.target.value)}
                className="input-base w-full text-xs"
              >
                <option value="">General Fractional Leadership</option>
                {deliverables.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink">
                Notes & Activity Description
              </label>
              <textarea
                rows={3}
                required
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                placeholder="What was accomplished during this session..."
                className="input-base w-full text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-2">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="btn-outline px-3 py-1.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-orange px-4 py-1.5 text-xs font-semibold"
              >
                {isSubmitting ? "Logging..." : "Log Hours"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timesheet Groups */}
      <div className="space-y-6">
        {Object.keys(groupedByWeek).length === 0 ? (
          <div className="rounded-2xl border border-line bg-panel p-12 text-center text-xs text-ink-3">
            No time entries recorded yet. Time logged will group into weekly
            timesheets for approval.
          </div>
        ) : (
          Object.entries(groupedByWeek).map(([week, entries]) => {
            const weekTotal = entries.reduce((s, e) => s + (e.hours || 0), 0);
            const isApproved = entries.every((e) => e.status === "APPROVED");
            const isDisputed = entries.some((e) => e.status === "DISPUTED");

            return (
              <div
                key={week}
                className="shadow-xs space-y-3 rounded-2xl border border-line bg-panel p-5"
              >
                {/* Timesheet Week Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-ink">
                      Timesheet {week}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
                        isApproved
                          ? "bg-emerald-500/10 text-emerald-600"
                          : isDisputed
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {isApproved
                        ? "Approved"
                        : isDisputed
                          ? "Disputed"
                          : "Pending Client Review"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs">
                      <span className="font-bold text-ink">{weekTotal}h</span>{" "}
                      <span className="text-2xs text-ink-3">
                        / {weeklyCap}h weekly cap
                      </span>
                    </div>

                    {isClient && !isApproved && !isClosed && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTimesheetAction(week, "APPROVE")}
                          className="btn-primary-orange px-3 py-1 text-2xs font-semibold"
                        >
                          Approve Week
                        </button>
                        <button
                          onClick={() => handleTimesheetAction(week, "DISPUTE")}
                          className="btn-outline px-2.5 py-1 text-2xs font-semibold text-red-600 hover:bg-red-500/10"
                        >
                          Dispute
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Entry Rows */}
                <div className="divide-line/60 divide-y">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs"
                    >
                      <div className="min-w-[200px] space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xs text-ink-3">
                            {new Date(entry.date).toLocaleDateString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {entry.deliverable && (
                            <span className="rounded bg-panel-2 px-1.5 py-0.5 text-[10px] font-medium text-brand-indigo">
                              {entry.deliverable.title}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink">{entry.description}</p>
                        {entry.disputeReason && (
                          <p className="text-2xs text-red-600">
                            Dispute note: {entry.disputeReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-ink">
                          {entry.hours} hrs
                        </span>
                        <span className="text-ink-4 text-2xs">
                          {entry.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
