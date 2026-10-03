"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel, StatusScreen } from "@/components/auth";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function VerifyEmailTokenResultPage({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams?.token;
  const router = useRouter();

  const [state, setState] = useState("loading"); // "loading" | "success" | "expired" | "invalid"
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer;
    async function verify() {
      if (!token) {
        setState("invalid");
        return;
      }

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        });

        if (error) {
          if (error.message?.toLowerCase().includes("expired")) {
            setState("expired");
          } else {
            setState("invalid");
          }
        } else {
          setState("success");
        }
      } catch {
        setState("invalid");
      }
    }

    verify();
  }, [token]);

  // Countdown on success
  useEffect(() => {
    if (state !== "success") return;

    if (countdown <= 0) {
      router.push("/client/dashboard");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [state, countdown, router]);

  return (
    <AuthPanel>
      {state === "loading" && (
        <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-indigo" />
          <p className="font-mono text-xs font-semibold text-ink">
            Verifying your security token...
          </p>
        </div>
      )}

      {state === "success" && (
        <StatusScreen
          type="success"
          title="Email verified successfully!"
          description="Your account is now activated. Redirecting you to your enterprise workspace in a moment..."
          meta={
            <div className="font-mono text-xs text-ink-3">
              Continuing automatically in <strong>{countdown}s</strong>
            </div>
          }
          actions={
            <button
              type="button"
              onClick={() => router.push("/client/dashboard")}
              className="btn-primary-indigo h-11 w-full rounded-xl text-xs font-semibold"
            >
              Continue to Workspace
            </button>
          }
        />
      )}

      {state === "expired" && (
        <StatusScreen
          type="warning"
          title="Verification link expired"
          description="Security links expire after 24 hours. Request a new confirmation email below to activate your account."
          actions={
            <Link
              href="/verify-email"
              className="btn-primary-indigo flex h-11 w-full items-center justify-center rounded-xl text-xs font-semibold"
            >
              Request a new link
            </Link>
          }
          backLink={{ label: "Back to sign in", href: "/login" }}
        />
      )}

      {state === "invalid" && (
        <StatusScreen
          type="error"
          title="Invalid verification token"
          description="This verification link is invalid or has already been used. Please sign in or check your latest email."
          actions={
            <Link
              href="/login"
              className="btn-primary-indigo flex h-11 w-full items-center justify-center rounded-xl text-xs font-semibold"
            >
              Go to sign in
            </Link>
          }
          backLink={{ label: "Need help? Contact support", href: "/contact" }}
        />
      )}
    </AuthPanel>
  );
}
