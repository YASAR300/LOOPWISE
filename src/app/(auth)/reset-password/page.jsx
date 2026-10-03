"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lock,
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
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const supabase = createClient();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: resetError } = await supabase.auth.updateUser({
        password,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch {
      setError("Failed to reset password. The link may have expired.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card raised className="border-border-hairline shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <div className="bg-semantic-success/15 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-semantic-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Password updated!</CardTitle>
          <CardDescription>
            Your password has been changed successfully. Redirecting you to sign
            in...
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
          <Link
            href="/login"
            className="text-xs font-medium text-accent hover:underline"
          >
            Click here if not redirected automatically
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card raised className="border-border-hairline shadow-2xl">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="text-lg">Set new password</CardTitle>
        <CardDescription>
          Choose a secure password for your Loopwise account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="border-semantic-danger/30 bg-semantic-danger/10 flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-semantic-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              New Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              leftIcon={<Lock className="h-4 w-4" />}
              required
              minLength={8}
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
                <span>Update Password</span>
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
