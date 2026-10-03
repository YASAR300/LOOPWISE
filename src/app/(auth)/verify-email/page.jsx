"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  AuthPanel,
  EmailPill,
  FormAlert,
  useCooldown,
} from "@/components/auth";
import { SpotIllustration } from "@/components/marketing/illustrations/spot-illustration";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "your-email@company.com";
  const returnTo = searchParams.get("returnTo") || "";
  const intentParam = searchParams.get("intent") || "";

  const { remaining, isCoolingDown, startCooldown } = useCooldown(
    60,
    `resend_${email}`
  );
  const [alert, setAlert] = useState(null);
  const [resending, setResending] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development");
  }, []);

  // Poll verification status every 5 seconds
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email_confirmed_at && isMounted) {
          clearInterval(interval);
          setAlert({
            type: "success",
            message: "Email verified successfully! Redirecting to workspace...",
          });
          setTimeout(() => {
            router.push(returnTo || "/client/dashboard");
          }, 1200);
        }
      } catch {
        // Polling network fallback
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router, returnTo]);

  const handleResend = async () => {
    if (isCoolingDown || resending) return;
    setResending(true);
    setAlert(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) {
        setAlert({
          type: "error",
          message: error.message || "Failed to resend confirmation email.",
        });
      } else {
        startCooldown(60);
        setAlert({
          type: "success",
          message: "Confirmation email sent! Please check your inbox.",
        });
      }
    } catch {
      setAlert({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  const editEmailHref = `/signup?email=${encodeURIComponent(email)}${
    returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""
  }`;

  return (
    <AuthPanel>
      <div className="space-y-6 text-center">
        {/* Soft Illustration Tile */}
        <div className="shadow-2xs mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 p-3">
          <SpotIllustration variant="map" className="h-full w-full" />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Check your inbox
          </h1>
          <p className="text-xs leading-relaxed text-ink-3">
            We sent a verification link to your work email address. Click the
            link inside to activate your account.
          </p>
        </div>

        {/* User's email in Geist Mono Pill */}
        <div>
          <EmailPill email={email} onEdit={() => router.push(editEmailHref)} />
        </div>

        {alert && (
          <FormAlert
            type={alert.type}
            message={alert.message}
            onDismiss={() => setAlert(null)}
          />
        )}

        {/* Resend Action with Cooldown */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isCoolingDown || resending}
            className="btn-secondary-outline flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`}
            />
            <span>
              {isCoolingDown
                ? `Resend email in ${remaining}s`
                : "Resend confirmation email"}
            </span>
          </button>

          {/* Development Mailpit Shortcut */}
          {isDev && (
            <a
              href="http://localhost:8025"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-brand-indigo hover:underline"
            >
              <span>Open Mailpit local mailbox</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Spam Notice & Return to Login */}
        <div className="space-y-2 border-t border-line pt-4 text-xs text-ink-3">
          <p>
            Didn&apos;t receive it? Be sure to check your spam or promotions
            folder.
          </p>
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-brand-indigo hover:underline"
            >
              <span>Back to sign in</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AuthPanel>
  );
}
