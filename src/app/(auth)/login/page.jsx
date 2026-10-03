"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";
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

export default function LoginPage() {
  const [email, setEmail] = React.useState("alex.carter@enterprise.ai");
  const [password, setPassword] = React.useState("demo123456");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Static stub until Prompt 2 wires real Auth.js session
    window.location.href = "/app";
  };

  return (
    <Card raised className="border-border-hairline shadow-2xl">
      <CardHeader className="pb-4 text-center">
        <div className="mx-auto mb-2">
          <Badge variant="accent" size="xs">
            NextAuth v5 Ready
          </Badge>
        </div>
        <CardTitle className="text-lg">Sign in to Loopwise</CardTitle>
        <CardDescription>
          Enter your organization email to access your workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                Password
              </label>
              <span className="cursor-pointer text-2xs text-text-muted hover:text-text-primary">
                Forgot password?
              </span>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="mt-2 w-full gap-2"
          >
            <span>Continue to Workspace</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </form>

        <div className="border-border-hairline/60 mt-4 border-t pt-3 text-center">
          <p className="text-2xs text-text-muted">
            Demo Mode: Click continue to enter the application shell.
          </p>
        </div>
      </CardContent>

      <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
        <p className="text-2xs text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/" className="font-medium text-accent hover:underline">
            Explore features
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
