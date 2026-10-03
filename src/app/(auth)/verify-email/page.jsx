"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Card raised className="border-border-hairline shadow-2xl">
      <CardHeader className="pb-4 text-center">
        <div className="bg-accent/15 mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-accent">
          <Mail className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg">Verify your email</CardTitle>
        <CardDescription>
          Check your email inbox for the verification link to activate your
          Loopwise account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 text-center">
        <p className="text-xs text-text-muted">
          Once you click the link in your email, your account will be activated
          and you can sign in to your workspace.
        </p>
      </CardContent>

      <CardFooter className="border-border-hairline/60 justify-center border-t pt-3">
        <Link
          href="/login"
          className="text-xs font-medium text-accent hover:underline"
        >
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
