"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import {
  AuthPanel,
  FormAlert,
  StatusScreen,
  EmailPill,
  useCooldown,
} from "@/components/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { remaining, isCoolingDown, startCooldown } = useCooldown(
    60,
    "forgot_password"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid work email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      // We do not reveal account existence for security
      setSubmitted(true);
      startCooldown(60);
    } catch {
      // Still show calm confirmation or generic error
      setSubmitted(true);
      startCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isCoolingDown || loading) return;
    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      startCooldown(60);
    } catch {
      // Calm fallback
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthPanel>
        <StatusScreen
          type="success"
          title="Check your inbox"
          description="If an account exists associated with this email, password reset instructions have been sent. Links remain valid for 60 minutes."
          meta={<EmailPill email={email} onEdit={() => setSubmitted(false)} />}
          actions={
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={isCoolingDown || loading}
                className="btn-secondary-outline flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line text-xs font-semibold disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                <span>
                  {isCoolingDown
                    ? `Resend instructions in ${remaining}s`
                    : "Resend instructions"}
                </span>
              </button>

              <Link
                href="/login"
                className="btn-primary-indigo flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold"
              >
                <span>Return to sign in</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          }
        />
      </AuthPanel>
    );
  }

  return (
    <AuthPanel>
      <div className="space-y-6">
        <div className="space-y-1">
          <Link
            href="/login"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to sign in</span>
          </Link>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">
            Reset your password
          </h1>
          <p className="text-xs leading-relaxed text-ink-3">
            Enter your work email address and we&apos;ll send you instructions
            to safely reset your account access.
          </p>
        </div>

        {error && (
          <FormAlert
            type="error"
            message={error}
            onDismiss={() => setError("")}
          />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="forgot-email"
              className="block text-xs font-semibold text-ink-2"
            >
              Work Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              autoComplete="email"
              required
              disabled={loading}
              placeholder="alex.carter@enterprise.ai"
              className="duration-160 focus:outline-hidden h-11 w-full rounded-xl border border-line bg-panel-2 px-3.5 text-xs text-ink transition-all placeholder:text-ink-3 hover:border-line-2 focus:border-transparent focus:ring-2 focus:ring-brand-indigo sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-indigo shadow-xs active:scale-98 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-transform disabled:opacity-50 sm:text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Send instructions</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-line pt-2 text-center text-xs text-ink-3">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-indigo hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthPanel>
  );
}
