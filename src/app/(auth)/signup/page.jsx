"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [role, setRole] = React.useState("CLIENT"); // CLIENT or STRATEGIST
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const supabase = createClient();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError("");
    const appUrl = window.location.origin;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: `${appUrl}/api/auth/callback`,
        data: { role },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  if (success) {
    return (
      <Card raised className="border-border-hairline shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <div className="bg-semantic-success/15 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-semantic-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Check your inbox</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to{" "}
            <span className="font-semibold text-text-primary">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
          <p className="text-xs text-text-muted">
            Click the link in the email to verify your address and activate your
            account.
          </p>
        </CardContent>
        <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
          <Link
            href="/login"
            className="text-xs font-medium text-accent hover:underline"
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card raised className="border-border-hairline shadow-2xl">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg">Create your account</CardTitle>
        <CardDescription>
          Join Loopwise to deploy vetted fractional AI strategists.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Role Selector */}
        <div className="space-y-1.5">
          <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            I am joining as:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all",
                role === "CLIENT"
                  ? "bg-accent/10 border-accent font-medium text-accent shadow-sm"
                  : "hover:border-border-hairline/80 border-border-hairline bg-surface-base text-text-secondary hover:bg-surface-highlight"
              )}
            >
              <Briefcase className="h-4 w-4" />
              <span className="text-xs">Client (Hire AI)</span>
              <span className="text-2xs text-text-muted">
                Enterprises & Startups
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("STRATEGIST")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all",
                role === "STRATEGIST"
                  ? "bg-accent/10 border-accent font-medium text-accent shadow-sm"
                  : "hover:border-border-hairline/80 border-border-hairline bg-surface-base text-text-secondary hover:bg-surface-highlight"
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-xs">AI Strategist</span>
              <span className="text-2xs text-text-muted">
                Heads of AI & Leaders
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="border-semantic-danger/30 bg-semantic-danger/10 flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-semantic-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          size="md"
          className="w-full gap-2 border-border-hairline hover:bg-surface-highlight"
          onClick={handleGoogleSignup}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign up with Google</span>
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center border-border-hairline">
            <div className="w-full border-t border-border-hairline" />
          </div>
          <span className="relative bg-surface-raised px-2 text-2xs uppercase tracking-wider text-text-muted">
            Or with email
          </span>
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Rostova"
              leftIcon={<User className="h-4 w-4" />}
              required
              disabled={loading || googleLoading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Work Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="elena@enterprise.com"
              leftIcon={<Mail className="h-4 w-4" />}
              required
              disabled={loading || googleLoading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
              disabled={loading || googleLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full gap-2"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>
                  Create {role === "CLIENT" ? "Client" : "Strategist"} Account
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
        <p className="text-2xs text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
