"use client";

import React, { useState } from "react";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "Enterprise Sponsor",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: null, text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, text: "" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message.");
      }

      setStatus({
        type: "success",
        text:
          data.message ||
          "Message sent successfully! Our advisory team will reach out within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        company: "",
        role: "Enterprise Sponsor",
        message: "",
      });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              ADVISORY DESK
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Connect with our enterprise team
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            Have questions about custom contracts, technical vetting criteria,
            or security architecture? Speak directly with our advisory partners.
          </p>
        </div>

        <div className="warm-card shadow-soft p-8 sm:p-12">
          {status.type === "success" ? (
            <div className="space-y-4 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#A9DDB8] bg-[#EAF7EE] text-[#1E7A3C]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Inquiry Received
              </h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-2">
                {status.text}
              </p>
              <button
                type="button"
                onClick={() => setStatus({ type: null, text: "" })}
                className="btn-secondary-outline mt-4 px-6 py-2.5 text-xs font-semibold"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.type === "error" && (
                <div className="bg-status-needsAction-bg border-status-needsAction-border text-status-needsAction-text flex items-center gap-2 rounded-lg border p-3 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{status.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-2"
                  >
                    Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Jordan Vance"
                    className="w-full rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-2"
                  >
                    Work Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jordan@enterprise.com"
                    className="w-full rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="company"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-2"
                  >
                    Company Name
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Global Systems Corp"
                    className="w-full rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-2"
                  >
                    I am an
                  </label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  >
                    <option value="Enterprise Sponsor">
                      Enterprise Leader / Hiring Sponsor
                    </option>
                    <option value="Strategist Applicant">
                      Prospective AI Strategist
                    </option>
                    <option value="Partner or Press">
                      Technology Partner or Press
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us about the workflows you want to automate, your target timeline, or any specific questions..."
                  className="w-full resize-none rounded-lg border border-line bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                />
              </div>

              <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                <div className="flex items-center gap-2 text-xs text-ink-3">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-forest" />
                  <span>Your submission is held under mutual NDA terms.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary-orange flex w-full items-center justify-center gap-2 px-8 py-3 text-sm font-semibold shadow-sm disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <span>Send to advisory desk</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
