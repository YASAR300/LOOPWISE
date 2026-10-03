"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

export function RequestIntroDialog({ strategist }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, text: "" });

    try {
      const res = await fetch("/api/strategists/intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategistProfileId: strategist.id,
          requestedDate: requestedDate || undefined,
          notes,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        // Redirect to signup preserving intent
        router.push(
          `/signup?role=client&intent=intro&strategistId=${strategist.id}&redirect=/strategists/${strategist.slug}`
        );
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setStatus({
        type: "success",
        text:
          data.message ||
          "Intro request received! We'll confirm the calendar invite.",
      });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-primary-orange flex w-full items-center justify-center gap-2 px-6 py-3 text-xs font-semibold shadow-sm sm:w-auto"
      >
        <span>Request Introduction</span>
        <ArrowRight className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="bg-ink/60 backdrop-blur-xs animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="shadow-warm relative w-full max-w-lg space-y-6 rounded-2xl border border-line bg-panel p-6 text-ink sm:p-8">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Request Intro with {strategist.name}
                </h3>
                <p className="mt-0.5 text-xs text-ink-2">
                  Direct 30-minute scoping call • Zero recruiter gatekeeping
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-ink-3 transition-colors hover:bg-canvas-2 hover:text-ink"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {status.type === "success" ? (
              <div className="space-y-3 py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#A9DDB8] bg-[#EAF7EE] text-forest">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-display text-base font-bold text-ink">
                  Request Confirmed
                </h4>
                <p className="text-xs leading-relaxed text-ink-2">
                  {status.text}
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary-outline mt-3 px-5 py-2 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {status.type === "error" && (
                  <div className="border-status-needsAction-border bg-status-needsAction-bg text-status-needsAction-text flex items-center gap-2 rounded-lg border p-3 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{status.text}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                    Preferred Date & Time Window
                  </label>
                  <input
                    type="datetime-local"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-2xs font-semibold uppercase tracking-wider text-ink-3">
                    Project Scope & Internal Tools
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe what workflows you need to map or automate (e.g. Accounts Payable in SAP, LangGraph multi-agent triage)..."
                    className="w-full resize-none rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-xs leading-relaxed text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 text-2xs text-ink-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-forest" />
                  <span>
                    Requires client sign-in. Backed by Loopwise replacement
                    guarantee.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-line pt-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-ink-2 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary-orange flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Intro Request</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
