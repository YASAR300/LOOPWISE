"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Mail,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to process request");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card raised className="border-border-hairline shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <div className="bg-semantic-success/15 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-semantic-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Check your email</CardTitle>
          <CardDescription>
            If an account exists for{" "}
            <span className="font-semibold text-text-primary">{email}</span>,
            we&apos;ve sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
          <p className="text-xs text-text-muted">
            The link will expire in 60 minutes. Please check your spam folder if
            you don&apos;t see it within a few minutes.
          </p>
        </CardContent>
        <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card raised className="border-border-hairline shadow-2xl">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg">Reset your password</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a recovery link.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="border-semantic-danger/30 bg-semantic-danger/10 flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-semantic-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
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
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
