"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import {
  AuthPanel,
  PasswordInput,
  PasswordStrengthMeter,
  evaluatePassword,
  FormAlert,
  StatusScreen,
} from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.updateUser({
        password,
      });

      if (resetError) {
        if (resetError.message?.toLowerCase().includes("expired")) {
          setError(
            "Your password reset link has expired. Please request a new one."
          );
        } else {
          setError(resetError.message || "Failed to update password");
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("An unexpected error occurred while updating your password.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthPanel>
        <StatusScreen
          type="success"
          title="Password updated successfully"
          description="Your credentials have been securely updated. You can now sign in with your new password."
          actions={
            <Link
              href="/login"
              className="btn-primary-indigo flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold"
            >
              <span>Sign in with new password</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
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
            Set new password
          </h1>
          <p className="text-xs leading-relaxed text-ink-3">
            Choose a strong password to protect your autonomous workspace.
          </p>
        </div>

        {error && (
          <FormAlert
            type="error"
            message={error}
            onDismiss={() => setError("")}
            action={
              error.includes("expired") ? (
                <Link
                  href="/forgot-password"
                  className="mt-1 inline-block text-xs font-semibold underline"
                >
                  Request a new link
                </Link>
              ) : null
            }
          />
        )}

        <form onSubmit={handleReset} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="new-password"
              className="block text-xs font-semibold text-ink-2"
            >
              New Password
            </label>
            <PasswordInput
              id="new-password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              autoComplete="new-password"
              required
              disabled={loading}
              placeholder="Minimum 8 characters"
            />
            <PasswordStrengthMeter password={password} showRules={true} />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold text-ink-2"
            >
              Confirm Password
            </label>
            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              autoComplete="new-password"
              required
              disabled={loading}
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="btn-primary-indigo shadow-xs active:scale-98 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-transform disabled:opacity-50 sm:text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Update password</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthPanel>
  );
}
