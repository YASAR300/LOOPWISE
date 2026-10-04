// src/components/engagements/engagement-controls-modal.jsx
"use client";

import { useState } from "react";
import {
  Pause,
  Play,
  XCircle,
  FileEdit,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function EngagementControlsModal({
  isOpen,
  onClose,
  engagement,
  userRole,
  is14DayEligible,
  onActionComplete,
}) {
  const [selectedAction, setSelectedAction] = useState(null); // 'PAUSE' | 'RESUME' | 'SCOPE' | 'END' | 'REPLACEMENT'
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [newScope, setNewScope] = useState(
    engagement?.contract?.scopeOfWork || ""
  );
  const [endStatus, setEndStatus] = useState("COMPLETED");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const isPaused = engagement?.status === "PAUSED";
  const isClosed = ["COMPLETED", "TERMINATED"].includes(engagement?.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      let payload = { action: selectedAction };

      if (selectedAction === "PAUSE") {
        payload.reason = reason;
      } else if (selectedAction === "RESUME") {
        payload.reason = "Engagement resumed by user";
      } else if (selectedAction === "END") {
        payload.status = endStatus;
        payload.reason = reason;
        payload.feedback = feedback;
      } else if (selectedAction === "REPLACEMENT") {
        payload.replacementReason = reason;
      } else if (selectedAction === "SCOPE") {
        payload.action = "SCOPE_CHANGE";
        payload.newScope = newScope;
        payload.reason = reason;
      }

      const res = await fetch(`/api/engagements/${engagement.id}/controls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      setSuccessMsg("Action recorded successfully!");
      setTimeout(() => {
        if (onActionComplete) onActionComplete();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background/80 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-card border-border w-full max-w-xl space-y-5 rounded-2xl border p-6 shadow-2xl">
        <div className="border-border/60 flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              Engagement Governance & Controls
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Role-protected actions to pause, amend scope, replace strategist
              or conclude engagement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {!selectedAction ? (
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            {/* Pause / Resume */}
            {!isClosed && (
              <button
                type="button"
                onClick={() => setSelectedAction(isPaused ? "RESUME" : "PAUSE")}
                className="border-border/60 hover:border-primary/50 bg-background/60 hover:bg-muted/30 group rounded-xl border p-4 text-left transition-all"
              >
                <div className="mb-2.5 w-fit rounded-lg bg-amber-500/10 p-2.5 text-amber-400">
                  {isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </div>
                <h4 className="text-foreground text-sm font-semibold transition-colors group-hover:text-primary">
                  {isPaused ? "Resume Engagement" : "Pause Engagement"}
                </h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  {isPaused
                    ? "Re-activate deliverable milestones and live timer tracking."
                    : "Temporarily pause work, timers, and active weekly cadence."}
                </p>
              </button>
            )}

            {/* Scope Amendment */}
            {!isClosed && (
              <button
                type="button"
                onClick={() => setSelectedAction("SCOPE")}
                className="border-border/60 hover:border-primary/50 bg-background/60 hover:bg-muted/30 group rounded-xl border p-4 text-left transition-all"
              >
                <div className="mb-2.5 w-fit rounded-lg bg-blue-500/10 p-2.5 text-blue-400">
                  <FileEdit className="h-4 w-4" />
                </div>
                <h4 className="text-foreground text-sm font-semibold transition-colors group-hover:text-primary">
                  Request Scope Change
                </h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Draft a formal contract amendment and bump the ContractVersion
                  for mutual approval.
                </p>
              </button>
            )}

            {/* 14-Day Trial Replacement (Client Only) */}
            {userRole === "CLIENT" && !isClosed && (
              <button
                type="button"
                onClick={() => setSelectedAction("REPLACEMENT")}
                className="border-border/60 hover:border-primary/50 bg-background/60 hover:bg-muted/30 group relative overflow-hidden rounded-xl border p-4 text-left transition-all"
              >
                <div className="mb-2.5 w-fit rounded-lg bg-purple-500/10 p-2.5 text-purple-400">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-foreground text-sm font-semibold transition-colors group-hover:text-primary">
                    14-Day Fit Guarantee
                  </h4>
                  {is14DayEligible && (
                    <span className="rounded bg-purple-500/20 px-1.5 py-0.5 font-mono text-[10px] text-purple-300">
                      Eligible
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Not the right fit? Request a free talent rematch within the
                  first 14 days. Handled by admin SLA.
                </p>
              </button>
            )}

            {/* End Engagement */}
            {!isClosed && (
              <button
                type="button"
                onClick={() => setSelectedAction("END")}
                className="border-border/60 bg-background/60 group rounded-xl border p-4 text-left transition-all hover:border-rose-500/50 hover:bg-rose-500/5"
              >
                <div className="mb-2.5 w-fit rounded-lg bg-rose-500/10 p-2.5 text-rose-400">
                  <XCircle className="h-4 w-4" />
                </div>
                <h4 className="text-foreground text-sm font-semibold transition-colors group-hover:text-rose-400">
                  End Engagement
                </h4>
                <p className="text-muted-foreground mt-1 text-xs">
                  Conclude or terminate engagement. Freezes edits, unlocks final
                  timesheets and review flow.
                </p>
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-border/40 flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Action: {selectedAction}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="text-xs text-primary hover:underline"
              >
                ← Back to options
              </button>
            </div>

            {selectedAction === "PAUSE" && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  Pausing the engagement halts time tracking and notifies both
                  parties. You can resume at any time.
                </p>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Reason for pause *
                  </label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Waiting for client internal API credentials or budget re-allocation"
                    required
                  />
                </div>
              </div>
            )}

            {selectedAction === "RESUME" && (
              <div className="space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h4 className="text-sm font-semibold text-emerald-400">
                  Resume Engagement?
                </h4>
                <p className="text-muted-foreground text-xs">
                  This will change the status back to ACTIVE, allowing
                  deliverables to be moved and time to be logged.
                </p>
              </div>
            )}

            {selectedAction === "SCOPE" && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-xs">
                  Submit a revised Scope of Work. This will generate a new
                  ContractVersion amendment and mark the contract as
                  CHANGES_REQUESTED until accepted.
                </p>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Amendment Summary / Justification *
                  </label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Added custom fine-tuned model deployment milestone"
                    required
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Updated Scope of Work (Markdown) *
                  </label>
                  <Textarea
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    rows={6}
                    className="font-mono text-xs"
                    required
                  />
                </div>
              </div>
            )}

            {selectedAction === "REPLACEMENT" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-300">
                  <strong>14-Day Fit Guarantee:</strong> Loopwise guarantees the
                  first 14 days of fractional leadership. If expectations are
                  misaligned, our team curates a replacement strategist with
                  priority onboarding.
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Why isn&apos;t this strategist the right fit? *
                  </label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe technical gaps, timezone mismatches, or communication preferences..."
                    rows={4}
                    required
                  />
                </div>
              </div>
            )}

            {selectedAction === "END" && (
              <div className="space-y-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Conclusion Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEndStatus("COMPLETED")}
                      className={`rounded-lg border p-2.5 text-center text-xs font-medium transition-colors ${
                        endStatus === "COMPLETED"
                          ? "text-primary-foreground border-primary bg-primary"
                          : "bg-muted/40 border-border/60 text-muted-foreground"
                      }`}
                    >
                      Successfully Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => setEndStatus("TERMINATED")}
                      className={`rounded-lg border p-2.5 text-center text-xs font-medium transition-colors ${
                        endStatus === "TERMINATED"
                          ? "border-rose-600 bg-rose-500 text-white"
                          : "bg-muted/40 border-border/60 text-muted-foreground"
                      }`}
                    >
                      Early Termination
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Primary reason for closing *
                  </label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. All milestone deliverables deployed or scope achieved"
                    required
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-medium">
                    Closing Feedback / Summary
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share any key takeaways or recommendations for the other party..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <div className="border-border/60 flex justify-end gap-2 border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedAction(null)}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className={`gap-2 ${
                  selectedAction === "END"
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "text-primary-foreground bg-primary"
                }`}
              >
                {loading ? "Processing..." : `Confirm ${selectedAction}`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
