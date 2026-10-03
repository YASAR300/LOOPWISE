"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const panelRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        !e.target.closest("#app-help-toggle-btn")
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage("Please fill in your name, email, and question.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          role: "LOGGED_IN_SUPPORT",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || data.details || "Failed to submit request"
        );
      }

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setErrorMessage(err.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-labelledby="app-help-title"
          className="shadow-warm animate-in fade-in slide-in-from-bottom-3 mb-3 w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-200 sm:w-[360px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line bg-panel-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#1E7A3C]" />
              <div>
                <h3 id="app-help-title" className="text-xs font-bold text-ink">
                  Loopwise Priority Support
                </h3>
                <p className="text-[10px] text-ink-3">
                  Direct response from engineering advisory
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-ink-3 transition-colors hover:bg-panel hover:text-ink"
              aria-label="Close help panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {success ? (
              <div className="space-y-2.5 py-6 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#A9DDB8] bg-[#EAF7EE] text-[#1E7A3C]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-ink">Message Sent</h4>
                <p className="text-xs text-ink-2">
                  Our team will reach out to your email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setIsOpen(false);
                  }}
                  className="mt-1 text-xs font-semibold text-brand-indigo hover:underline"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {errorMessage && (
                  <div className="flex items-center gap-1.5 rounded-md border border-[#F2B8B8] bg-[#FFECEC] p-2 text-xs text-[#B42318]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="help-name"
                    className="mb-1 block text-2xs font-semibold uppercase text-ink-3"
                  >
                    Your Name
                  </label>
                  <input
                    id="help-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Jordan"
                    className="w-full rounded-md border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="help-email"
                    className="mb-1 block text-2xs font-semibold uppercase text-ink-3"
                  >
                    Email
                  </label>
                  <input
                    id="help-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jordan@company.com"
                    className="w-full rounded-md border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="help-msg"
                    className="mb-1 block text-2xs font-semibold uppercase text-ink-3"
                  >
                    Question or Issue
                  </label>
                  <textarea
                    id="help-msg"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Describe what you need help with..."
                    className="w-full resize-none rounded-md border border-line bg-canvas px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-indigo shadow-2xs w-full gap-1.5 py-2 text-xs font-semibold disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send inquiry</span>
                      <Send className="h-3 w-3" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        id="app-help-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle help and support chat"
        className="shadow-warm duration-160 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ink text-panel transition-all hover:scale-105 hover:bg-ink-2 active:scale-95"
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
