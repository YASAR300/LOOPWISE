"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthPanel, StatusScreen, FormAlert } from "@/components/auth";
import { IdentityTile } from "@/components/ui/identity-tile";
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Building,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function InviteAcceptPage({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams?.token;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null); // "NOT_FOUND" | "EXPIRED" | "ALREADY_ACCEPTED" | "GENERIC"
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    async function load() {
      if (!token) {
        setErrorStatus("NOT_FOUND");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/invite/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorStatus(data.status || "GENERIC");
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);
        setCurrentUser(data.currentUser);
      } catch {
        setErrorStatus("GENERIC");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setAlert(null);

    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({
          type: "error",
          message: data.error || "Failed to accept invitation.",
        });
        setAccepting(false);
        return;
      }

      router.push(data.redirectUrl || "/client/dashboard");
    } catch {
      setAlert({
        type: "error",
        message: "An unexpected network error occurred.",
      });
      setAccepting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.reload();
    } catch {
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <AuthPanel>
        <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-indigo" />
          <p className="font-mono text-xs font-semibold text-ink">
            Loading team invitation...
          </p>
        </div>
      </AuthPanel>
    );
  }

  // Error States
  if (errorStatus === "EXPIRED") {
    return (
      <AuthPanel>
        <StatusScreen
          type="warning"
          title="Invitation expired"
          description="This organization invitation has expired. Please reach out to your team admin to request a fresh invitation."
          backLink={{ label: "Back to Loopwise home", href: "/" }}
        />
      </AuthPanel>
    );
  }

  if (errorStatus === "ALREADY_ACCEPTED") {
    return (
      <AuthPanel>
        <StatusScreen
          type="success"
          title="Invitation already accepted"
          description="You or a team member have already accepted this invitation. Sign in to access your organization workspace."
          actions={
            <Link
              href="/login"
              className="btn-primary-indigo flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold"
            >
              <span>Sign in to Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      </AuthPanel>
    );
  }

  if (errorStatus === "NOT_FOUND" || !invitation) {
    return (
      <AuthPanel>
        <StatusScreen
          type="error"
          title="Invitation not found"
          description="This invitation link is invalid or may have been revoked by the organization owner."
          backLink={{ label: "Go to sign in", href: "/login" }}
        />
      </AuthPanel>
    );
  }

  const org = invitation.organization || { name: "Enterprise Workspace" };
  const isEmailMismatch =
    currentUser &&
    currentUser.email.toLowerCase() !== invitation.email.toLowerCase();

  return (
    <AuthPanel>
      <div className="space-y-6 text-center">
        {/* Organization Identity Tile */}
        <div className="flex flex-col items-center gap-3">
          <IdentityTile name={org.name} id={org.id || "org"} size="lg" />
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              Join {org.name}
            </h1>
            <p className="mt-1 text-xs text-ink-3">
              You&apos;ve been invited to collaborate as a{" "}
              <strong className="font-semibold text-ink">
                {invitation.role}
              </strong>
              .
            </p>
          </div>
        </div>

        {alert && (
          <FormAlert
            type={alert.type}
            message={alert.message}
            onDismiss={() => setAlert(null)}
          />
        )}

        {/* Mismatch Warning */}
        {isEmailMismatch && (
          <div className="space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-left text-xs dark:border-amber-900/50 dark:bg-amber-950/20">
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Account mismatch
            </p>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              You are signed in as <strong>{currentUser.email}</strong>, but
              this invitation was sent to <strong>{invitation.email}</strong>.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-indigo hover:underline"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Switch account</span>
            </button>
          </div>
        )}

        {/* LOGGED IN & MATCH: Accept Button */}
        {currentUser && !isEmailMismatch && (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={accepting}
              className="btn-primary-indigo shadow-xs active:scale-98 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-transform disabled:opacity-50 sm:text-sm"
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Accept invitation and join team</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-ink-3">
              Signed in as <strong>{currentUser.email}</strong>
            </p>
          </div>
        )}

        {/* LOGGED OUT: Log In or Create Account with prefilled email */}
        {!currentUser && (
          <div className="space-y-3 pt-2">
            <Link
              href={`/login?email=${encodeURIComponent(invitation.email)}&returnTo=/invite/${token}`}
              className="btn-primary-indigo shadow-xs flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold sm:text-sm"
            >
              <span>Log in to accept</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href={`/signup?email=${encodeURIComponent(invitation.email)}&role=CLIENT&returnTo=/invite/${token}`}
              className="btn-secondary-outline flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-xs font-semibold hover:bg-panel-2 sm:text-sm"
            >
              <span>Create account to accept</span>
            </Link>

            <p className="pt-1 text-[11px] text-ink-3">
              Invited address:{" "}
              <span className="font-mono font-medium text-ink">
                {invitation.email}
              </span>
            </p>
          </div>
        )}
      </div>
    </AuthPanel>
  );
}
