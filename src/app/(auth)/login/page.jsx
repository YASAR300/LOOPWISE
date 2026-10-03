"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import {
  AuthPanel,
  SocialButton,
  OrDivider,
  PasswordInput,
  FormAlert,
  useCooldown,
} from "@/components/auth";
import { LogoLoader } from "@/components/ui/logo-loader";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@loopwise.internal", role: "ADMIN" },
  { label: "Client", email: "alex.carter@enterprise.ai", role: "CLIENT" },
  {
    label: "Strategist",
    email: "elena.rostova@autonomous.ai",
    role: "STRATEGIST",
  },
];

function isSafeInternalPath(path) {
  if (!path || typeof path !== "string") return false;
  return (
    path.startsWith("/") && !path.startsWith("//") && !path.includes("://")
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo =
    searchParams.get("returnTo") || searchParams.get("redirect") || "";
  const roleParam = searchParams.get("role") || "";
  const intentParam = searchParams.get("intent") || "";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("alex.carter@enterprise.ai");
  const [password, setPassword] = useState("demo123456");
  const [rememberMe, setRememberMe] = useState(true);

  // Field validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Submission & alert states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [serverAlert, setServerAlert] = useState(
    urlError ? { type: "error", message: decodeURIComponent(urlError) } : null
  );

  const emailInputRef = useRef(null);
  const { remaining, isCoolingDown, startCooldown } = useCooldown(
    60,
    "resend_verification"
  );

  // Autofocus email on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const validateEmail = (val) => {
    if (!val || !val.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return "Enter a valid work email address";
    }
    return "";
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setServerAlert(null);

    const errE = validateEmail(email);
    const errP = !password ? "Password is required" : "";

    if (errE || errP) {
      setEmailError(errE);
      setPasswordError(errP);
      if (errE) emailInputRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setLoading(false);
        const msg = signInError.message.toLowerCase();

        if (msg.includes("email not confirmed") || msg.includes("unverified")) {
          setServerAlert({
            type: "warning",
            message: "Your email address has not been verified yet.",
            description:
              "Please check your inbox or request a new confirmation email below.",
            isUnverified: true,
          });
        } else if (
          msg.includes("rate limit") ||
          msg.includes("too many requests")
        ) {
          setServerAlert({
            type: "error",
            message: "Too many failed attempts. Account temporarily locked.",
            description: "Please wait 60 seconds before trying again.",
          });
        } else {
          setServerAlert({
            type: "error",
            message: "Invalid email or password. Please verify and try again.",
          });
        }
        return;
      }

      // Success path: show LogoLoader transition
      setIsSigningIn(true);

      const userRole = data.user?.user_metadata?.role || "CLIENT";
      const defaultDest =
        userRole === "ADMIN"
          ? "/admin/dashboard"
          : userRole === "STRATEGIST"
            ? "/strategist/dashboard"
            : "/client/dashboard";

      const finalDest = isSafeInternalPath(returnTo) ? returnTo : defaultDest;

      setTimeout(() => {
        router.push(finalDest);
        router.refresh();
      }, 700);
    } catch (err) {
      setLoading(false);
      setServerAlert({
        type: "error",
        message: "An unexpected error occurred while logging in. Please retry.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setServerAlert(null);
    const appUrl = window.location.origin;

    const queryParams = new URLSearchParams();
    if (returnTo) queryParams.set("returnTo", returnTo);
    if (roleParam) queryParams.set("role", roleParam);
    if (intentParam) queryParams.set("intent", intentParam);

    const redirectUri = `${appUrl}/api/auth/callback${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
        },
      });

      if (oauthError) {
        setServerAlert({
          type: "error",
          message: oauthError.message || "Failed to sign in with Google.",
        });
        setGoogleLoading(false);
      }
    } catch {
      setServerAlert({
        type: "error",
        message: "Google OAuth could not be initiated.",
      });
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (isCoolingDown || !email) return;
    startCooldown(60);

    try {
      const supabase = createClient();
      await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      setServerAlert({
        type: "success",
        message: "Verification email resent successfully!",
        description: `Check your inbox at ${email.trim()}.`,
      });
    } catch {
      setServerAlert({
        type: "error",
        message: "Failed to resend confirmation email.",
      });
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword("demo123456");
    setEmailError("");
    setPasswordError("");
    setServerAlert(null);
  };

  // Build signup href preserving returnTo, role, intent
  const signupParams = new URLSearchParams();
  if (returnTo) signupParams.set("returnTo", returnTo);
  if (roleParam) signupParams.set("role", roleParam);
  if (intentParam) signupParams.set("intent", intentParam);
  const signupHref = `/signup${signupParams.toString() ? `?${signupParams.toString()}` : ""}`;

  if (isSigningIn) {
    return (
      <AuthPanel>
        <LogoLoader label="Signing you in to Loopwise..." />
      </AuthPanel>
    );
  }

  return (
    <AuthPanel>
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">
            Sign in to Loopwise
          </h1>
          <p className="text-xs text-ink-3">
            Access your active automations, proposals, and team fleet.
          </p>
        </div>

        {/* Server Alert Banner */}
        {serverAlert && (
          <FormAlert
            type={serverAlert.type}
            message={serverAlert.message}
            description={serverAlert.description}
            onDismiss={() => setServerAlert(null)}
            action={
              serverAlert.isUnverified ? (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isCoolingDown}
                  className="btn-secondary-outline mt-1 cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold disabled:opacity-50"
                >
                  {isCoolingDown
                    ? `Resend in ${remaining}s`
                    : "Resend verification email"}
                </button>
              ) : null
            }
          />
        )}

        {/* Google OAuth Button */}
        <SocialButton
          onClick={handleGoogleSignIn}
          loading={googleLoading}
          disabled={loading}
          text="Continue with Google"
        />

        {/* Or Divider */}
        <OrDivider label="or" />

        {/* Credentials Form */}
        <form onSubmit={handleSignIn} noValidate className="space-y-3.5">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-ink-2"
            >
              Work Email
            </label>
            <input
              ref={emailInputRef}
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={handleEmailBlur}
              autoComplete="email"
              required
              disabled={loading || googleLoading}
              placeholder="alex.carter@enterprise.ai"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`duration-160 focus:outline-hidden h-11 w-full rounded-xl border bg-panel-2 px-3.5 text-xs text-ink transition-all placeholder:text-ink-3 focus:border-transparent focus:ring-2 focus:ring-brand-indigo sm:text-sm ${
                emailError
                  ? "border-[#B42318] focus:ring-[#B42318] dark:border-[#F87171]"
                  : "border-line hover:border-line-2"
              }`}
            />
            {emailError && (
              <p
                id="email-error"
                className="text-[11px] font-medium text-[#B42318] dark:text-[#F87171]"
              >
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-ink-2"
            >
              Password
            </label>
            <PasswordInput
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              autoComplete="current-password"
              required
              disabled={loading || googleLoading}
              error={passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
          </div>

          {/* Remember Me + Forgot Password Row */}
          <div className="flex items-center justify-between pt-0.5 text-xs">
            <label className="flex cursor-pointer select-none items-center gap-2 text-ink-2 hover:text-ink">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-line text-brand-indigo accent-[#4B3FD6] focus:ring-brand-indigo"
              />
              <span className="font-medium">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-xs font-medium text-ink-3 transition-colors hover:text-brand-indigo"
            >
              Forgot password?
            </Link>
          </div>

          {/* Full-width Indigo Primary Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-primary-indigo shadow-xs active:scale-98 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-transform disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Bar */}
        <div className="space-y-2 border-t border-line pt-3">
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-ink-3">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className="cursor-pointer truncate rounded-lg border border-line bg-panel-2 px-2 py-1 text-center text-[11px] font-medium text-ink-2 transition-colors hover:bg-panel hover:text-ink"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Switch Link */}
        <div className="pt-1 text-center text-xs text-ink-3">
          New to Loopwise?{" "}
          <Link
            href={signupHref}
            className="font-semibold text-brand-indigo hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </AuthPanel>
  );
}
