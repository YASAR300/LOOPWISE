"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForbiddenPage() {
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Fallback
    }
    window.location.href = "/login";
  };

  return (
    <div className="bg-app flex min-h-screen select-none flex-col items-center justify-center p-4 text-ink">
      {/* Soft Blurred Glow (NO GRID) */}
      <div
        className="bg-brand-accent/8 pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        aria-hidden="true"
      />

      <div className="shadow-2xs relative z-10 w-full max-w-[420px] space-y-6 rounded-[20px] border border-line bg-panel p-8 text-center">
        {/* Brand Icon Tile */}
        <div className="shadow-xs mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F2B8B8] bg-[#FFECEC] text-[#B42318] dark:border-[#5C2020] dark:bg-[#331515] dark:text-[#F87171]">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-xl font-bold tracking-tight text-ink">
            Access Denied (403)
          </h1>
          <p className="text-xs leading-relaxed text-ink-3">
            You do not have the required permissions or role tier to access this
            resource. If you belong to another role or organization, you can
            switch accounts below.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/app"
            className="btn-primary-indigo shadow-xs flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Workspace</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="btn-secondary-outline flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-line text-xs font-semibold hover:bg-panel-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Switch account</span>
          </button>
        </div>

        <div className="border-t border-line pt-2 text-[11px] text-ink-3">
          Need help?{" "}
          <Link
            href="/contact"
            className="font-semibold text-brand-indigo hover:underline"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
