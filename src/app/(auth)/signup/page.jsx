"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building,
  CheckCircle2,
} from "lucide-react";
import {
  AuthPanel,
  RoleCardGroup,
  SocialButton,
  OrDivider,
  PasswordInput,
  PasswordStrengthMeter,
  evaluatePassword,
  FormAlert,
  useAuthContext,
} from "@/components/auth";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRole: setShellRole } = useAuthContext();

  const roleParam = searchParams.get("role") || "";
  const returnTo = searchParams.get("returnTo") || "";
  const intentParam = searchParams.get("intent") || "";

  const initialRole =
    roleParam.toLowerCase() === "strategist" ? "STRATEGIST" : "CLIENT";

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Field validation and existence check
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverAlert, setServerAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const headingRef = useRef(null);

  // Sync role with shell side panel
  useEffect(() => {
    setShellRole(role);
  }, [role, setShellRole]);

  // Handle focus when step changes
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [step]);

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleContinueToStep2 = () => {
    setStep(2);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setServerAlert(null);
  };

  // Check email on blur
  const handleEmailBlur = async () => {
    if (!email || !email.includes("@")) return;

    setEmailChecking(true);
    setEmailExists(false);

    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data?.exists) {
        setEmailExists(true);
      }
    } catch {
      // Fail silently on check error
    } finally {
      setEmailChecking(false);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid work email address";
    }
    const { score } = evaluatePassword(password);
    if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (!termsAgreed) {
      errs.terms = "You must agree to the Terms and Privacy Policy to continue";
    }
    return errs;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setServerAlert(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          companyName: role === "CLIENT" ? companyName.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setServerAlert({
          type: "error",
          message: data.error || "Unable to create account. Please try again.",
        });
        return;
      }

      // Success: redirect to verification pending screen with email
      const verifyParams = new URLSearchParams({ email: email.trim() });
      if (returnTo) verifyParams.set("returnTo", returnTo);
      if (intentParam) verifyParams.set("intent", intentParam);

      router.push(`/verify-email?${verifyParams.toString()}`);
    } catch {
      setLoading(false);
      setServerAlert({
        type: "error",
        message: "Network error occurred during signup. Please retry.",
      });
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setServerAlert(null);
    const appUrl = window.location.origin;

    const queryParams = new URLSearchParams();
    if (returnTo) queryParams.set("returnTo", returnTo);
    if (role) queryParams.set("role", role);
    if (intentParam) queryParams.set("intent", intentParam);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: { access_type: "offline", prompt: "consent" },
          redirectTo: `${appUrl}/api/auth/callback${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
          data: { role },
        },
      });

      if (oauthError) {
        setServerAlert({
          type: "error",
          message: oauthError.message || "Failed to continue with Google.",
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

  const loginParams = new URLSearchParams();
  if (returnTo) loginParams.set("returnTo", returnTo);
  if (roleParam) loginParams.set("role", roleParam);
  if (intentParam) loginParams.set("intent", intentParam);
  const loginHref = `/login${loginParams.toString() ? `?${loginParams.toString()}` : ""}`;

  return (
    <AuthPanel>
      {/* STEP 1: ROLE SELECTION */}
      {step === 1 && (
        <div className="animate-in fade-in space-y-6 duration-200">
          <div className="space-y-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-xl font-bold tracking-tight text-ink outline-none"
            >
              How will you use Loopwise?
            </h1>
            <p className="text-xs text-ink-3">
              Select how you intend to engage with our verified automation
              network.
            </p>
          </div>

          <RoleCardGroup value={role} onChange={handleRoleChange} />

          <button
            type="button"
            onClick={handleContinueToStep2}
            className="btn-primary-indigo shadow-xs active:scale-98 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-transform sm:text-sm"
          >
            <span>Continue</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <div className="border-t border-line pt-1 text-center text-xs text-ink-3">
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="font-semibold text-brand-indigo hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: CREDENTIALS & DETAILS */}
      {step === 2 && (
        <div className="animate-in fade-in space-y-5 duration-200">
          {/* Header with back link */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBackToStep1}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-ink-3 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Change role</span>
            </button>

            <span className="rounded-full bg-brand-accent-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-brand-accent">
              {role === "CLIENT" ? "Client Account" : "Strategist Account"}
            </span>
          </div>

          <div className="space-y-1">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-xl font-bold tracking-tight text-ink outline-none"
            >
              Create your account
            </h1>
            <p className="text-xs text-ink-3">
              {role === "CLIENT"
                ? "Deploy verified AI strategists and autonomous fleet nodes."
                : "Join the top 3% fractional AI leaders with guaranteed escrow."}
            </p>
          </div>

          {serverAlert && (
            <FormAlert
              type={serverAlert.type}
              message={serverAlert.message}
              onDismiss={() => setServerAlert(null)}
            />
          )}

          {/* Social Google Signup */}
          <SocialButton
            onClick={handleGoogleSignup}
            loading={googleLoading}
            disabled={loading}
            text="Sign up with Google"
          />

          <OrDivider label="or" />

          {/* Email Availability Notice */}
          {emailExists && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
              <span>This email already has an account.</span>
              <Link
                href={`/login?email=${encodeURIComponent(email)}`}
                className="font-bold underline hover:text-amber-950 dark:hover:text-amber-100"
              >
                Log in?
              </Link>
            </div>
          )}

          <form onSubmit={handleSignup} noValidate className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-name"
                className="block text-xs font-semibold text-ink-2"
              >
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                autoComplete="name"
                required
                disabled={loading || googleLoading}
                placeholder="Alex Carter"
                className={`duration-160 focus:outline-hidden h-11 w-full rounded-xl border bg-panel-2 px-3.5 text-xs text-ink transition-all placeholder:text-ink-3 focus:border-transparent focus:ring-2 focus:ring-brand-indigo sm:text-sm ${
                  errors.name
                    ? "border-[#B42318] focus:ring-[#B42318]"
                    : "border-line hover:border-line-2"
                }`}
              />
              {errors.name && (
                <p className="text-[11px] font-medium text-[#B42318] dark:text-[#F87171]">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Work Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-ink-2"
              >
                Work Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                  if (emailExists) setEmailExists(false);
                }}
                onBlur={handleEmailBlur}
                autoComplete="email"
                required
                disabled={loading || googleLoading}
                placeholder="name@company.com"
                className={`duration-160 focus:outline-hidden h-11 w-full rounded-xl border bg-panel-2 px-3.5 text-xs text-ink transition-all placeholder:text-ink-3 focus:border-transparent focus:ring-2 focus:ring-brand-indigo sm:text-sm ${
                  errors.email
                    ? "border-[#B42318] focus:ring-[#B42318]"
                    : "border-line hover:border-line-2"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] font-medium text-[#B42318] dark:text-[#F87171]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Optional Company Name (Clients only, 160ms height transition) */}
            {role === "CLIENT" && (
              <div className="duration-160 space-y-1.5 transition-all">
                <label
                  htmlFor="signup-company"
                  className="block text-xs font-semibold text-ink-2"
                >
                  Company Name{" "}
                  <span className="text-[10px] font-normal text-ink-3">
                    (Optional)
                  </span>
                </label>
                <div className="relative flex items-center">
                  <input
                    id="signup-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    autoComplete="organization"
                    disabled={loading || googleLoading}
                    placeholder="Acme Corp"
                    className="duration-160 focus:outline-hidden h-11 w-full rounded-xl border border-line bg-panel-2 px-3.5 text-xs text-ink transition-all placeholder:text-ink-3 hover:border-line-2 focus:border-transparent focus:ring-2 focus:ring-brand-indigo sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Password with live strength meter + rule checklist */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold text-ink-2"
              >
                Password
              </label>
              <PasswordInput
                id="signup-password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                autoComplete="new-password"
                required
                disabled={loading || googleLoading}
                error={errors.password}
              />
              <PasswordStrengthMeter password={password} showRules={true} />
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex cursor-pointer select-none items-start gap-2.5 text-xs text-ink-2">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => {
                    setTermsAgreed(e.target.checked);
                    if (errors.terms) setErrors({ ...errors, terms: "" });
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-line text-brand-indigo accent-[#4B3FD6] focus:ring-brand-indigo"
                />
                <span className="leading-snug">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="font-semibold text-brand-indigo hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="font-semibold text-brand-indigo hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-[11px] font-medium text-[#B42318] dark:text-[#F87171]">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary-indigo shadow-xs active:scale-98 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-transform disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-line pt-1 text-center text-xs text-ink-3">
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="font-semibold text-brand-indigo hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </AuthPanel>
  );
}
