"use client";

import React, { createContext, useContext, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthSidePanel } from "./auth-side-panel";

export const AuthContext = createContext({
  mode: "login",
  role: "CLIENT",
  setMode: () => {},
  setRole: () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthShell({
  children,
  initialMode = "login",
  initialRole = "CLIENT",
  headline = null,
  stats = null,
}) {
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);

  return (
    <AuthContext.Provider value={{ mode, role, setMode, setRole }}>
      <div className="bg-app relative flex min-h-screen w-full select-none flex-col overflow-hidden text-ink lg:flex-row">
        {/* Soft Blurred Glow behind form panel on tablet/mobile (NO GRID) */}
        <div
          className="bg-[#F25C1F]/8 pointer-events-none absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] lg:hidden"
          aria-hidden="true"
        />

        {/* LEFT COLUMN: ~46% width on desktop */}
        <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-6 sm:p-8 lg:w-[46%] lg:p-12">
          {/* Top Logo */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5"
              aria-label="Loopwise Home"
            >
              <div className="shadow-xs flex h-8 w-8 items-center justify-center rounded-xl bg-brand-accent text-sm font-bold text-white transition-transform group-hover:scale-105">
                L
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-ink">
                LOOPWISE
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-3 transition-colors hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </Link>
          </div>

          {/* Centered Form Area */}
          <main className="mx-auto my-auto w-full max-w-[400px] py-8">
            {children}
          </main>

          {/* Bottom Legal Links */}
          <footer className="border-line/60 flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-ink-3">
            <span>© {new Date().getFullYear()} Loopwise Inc.</span>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="transition-colors hover:text-ink">
                Terms
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-ink"
              >
                Privacy
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-ink"
              >
                Help
              </Link>
            </div>
          </footer>
        </div>

        {/* RIGHT COLUMN: ~54% width on desktop, hidden on tablet and mobile */}
        <div className="hidden min-h-screen items-stretch p-4 lg:flex lg:w-[54%]">
          <AuthSidePanel
            mode={mode}
            role={role}
            headline={headline}
            stats={stats}
          />
        </div>
      </div>
    </AuthContext.Provider>
  );
}
