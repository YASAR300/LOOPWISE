"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function FloatingHelpBubble() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const nameInputRef = useRef(null);
  const panelRef = useRef(null);

  // Hidden on auth screens
  if (
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/client") ||
    pathname?.startsWith("/strategist")
  ) {
    return null;
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
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
        !e.target.closest("#lw-chat-toggle-btn")
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
      setErrorMessage("Please fill in your name, email, and message.");
      return;
    }
    if (formData.message.length < 10) {
      setErrorMessage("Message must be at least 10 characters.");
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
          company: formData.company,
          message: formData.message,
          role: "CLIENT",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || data.details || "Failed to submit message"
        );
      }

      setSuccess(true);
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Dialog Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-labelledby="chat-panel-title"
          aria-modal="true"
          className="shadow-warm animate-in fade-in slide-in-from-bottom-4 mb-3 w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-200 sm:w-[380px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-[#1E3B2E] px-5 py-4 text-[#F3F7F4]">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#9BE59B]" />
              <div>
                <h3
                  id="chat-panel-title"
                  className="text-sm font-semibold tracking-tight"
                >
                  Loopwise Advisory Desk
                </h3>
                <p className="text-2xs text-[#F3F7F4]/80">
                  Direct answers from enterprise AI partners
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close advisory panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {success ? (
              <div className="space-y-3 py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#A9DDB8] bg-[#EAF7EE] text-[#1E7A3C]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="font-display text-base font-bold text-ink">
                  Inquiry Received
                </h4>
                <p className="text-xs leading-relaxed text-ink-2">
                  Thank you for reaching out. A partner from our advisory desk
                  will review your requirements and respond at your email within
                  2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setIsOpen(false);
                  }}
                  className="mt-2 text-xs font-semibold text-brand-accent underline underline-offset-4 hover:text-brand-accent-hover"
                >
                  Close panel
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="bg-status-needsAction-bg border-status-needsAction-border text-status-needsAction-text flex items-start gap-2 rounded-lg border p-2.5 text-xs">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="chat-name"
                    className="mb-1 block text-xs font-medium text-ink-2"
                  >
                    Your name *
                  </label>
                  <input
                    ref={nameInputRef}
                    id="chat-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Jordan Miller"
                    className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="chat-email"
                    className="mb-1 block text-xs font-medium text-ink-2"
                  >
                    Work email *
                  </label>
                  <input
                    id="chat-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jordan@company.com"
                    className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="chat-company"
                    className="mb-1 block text-xs font-medium text-ink-2"
                  >
                    Company name
                  </label>
                  <input
                    id="chat-company"
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="chat-message"
                    className="mb-1 block text-xs font-medium text-ink-2"
                  >
                    How can we help? *
                  </label>
                  <textarea
                    id="chat-message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Describe your workflow challenge, budget, or timeline..."
                    className="w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-orange shadow-xs flex w-full items-center justify-center gap-2 py-2.5 text-xs font-semibold disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Submitting inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Send to advisory desk</span>
                      <Send className="h-3 w-3" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Circle Button */}
      <button
        id="lw-chat-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle contact help chat"
        className="h-13 w-13 shadow-soft flex items-center justify-center rounded-full border border-[#33312B] bg-[#1B1A17] text-[#FFFDF9] ring-offset-2 ring-offset-canvas transition-all duration-200 hover:scale-105 hover:bg-[#2B1330] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo active:scale-95"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand-accent ring-2 ring-[#1B1A17]" />
          </div>
        )}
      </button>
    </div>
  );
}
