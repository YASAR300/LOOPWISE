"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const urlError = searchParams.get("error");

  const [email, setEmail] = React.useState("alex.carter@enterprise.ai");
  const [password, setPassword] = React.useState("demo123456");
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState(
    urlError ? decodeURIComponent(urlError) : ""
  );

  const supabase = createClient();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Check role from user_metadata
      const role = data.user?.user_metadata?.role || "CLIENT";
      const roleHome = {
        CLIENT: "/client/dashboard",
        STRATEGIST: "/strategist/dashboard",
        ADMIN: "/admin/dashboard",
      };

      const dest = redirectPath || roleHome[role] || "/app";
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    const appUrl = window.location.origin;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/api/auth/callback${redirectPath ? `?next=${encodeURIComponent(redirectPath)}` : ""}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword("demo123456");
    setError("");
  };

  return (
    <Card raised className="border-border-hairline shadow-2xl">
      <CardHeader className="pb-4 text-center">
        <div className="mx-auto mb-2">
          <Badge variant="accent" size="xs">
            Supabase Auth
          </Badge>
        </div>
        <CardTitle className="text-lg">Sign in to Loopwise</CardTitle>
        <CardDescription>
          Enter your organization email to access your workspace.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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
          onClick={handleGoogleSignIn}
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
          <span>Continue with Google</span>
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center border-border-hairline">
            <div className="w-full border-t border-border-hairline" />
          </div>
          <span className="relative bg-surface-raised px-2 text-2xs uppercase tracking-wider text-text-muted">
            Or with email
          </span>
        </div>

        <form onSubmit={handleSignIn} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Work Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              required
              disabled={loading || googleLoading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-2xs text-text-muted hover:text-text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              required
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
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        <div className="border-border-hairline/60 border-t pt-3">
          <div className="mb-2 text-center">
            <span className="text-2xs text-text-muted">Quick Demo Logins:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc)}
                className="hover:border-accent/40 rounded border border-border-hairline bg-surface-base px-2 py-1 text-center text-2xs font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
        <p className="text-2xs text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
