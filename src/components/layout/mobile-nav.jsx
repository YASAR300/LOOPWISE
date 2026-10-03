"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Bot,
  MessageSquare,
  MoreHorizontal,
  X,
  CreditCard,
  Settings,
  TrendingUp,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { createClient } from "@/lib/supabase/client";

export function MobileNav({ currentUser = null }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const role = currentUser?.role || "CLIENT";

  const tabs = [
    {
      label: "Home",
      href:
        role === "STRATEGIST"
          ? "/strategist/dashboard"
          : role === "ADMIN"
            ? "/admin/dashboard"
            : "/client/dashboard",
      icon: Home,
    },
    {
      label:
        role === "STRATEGIST" ? "Jobs" : role === "ADMIN" ? "Users" : "Briefs",
      href:
        role === "STRATEGIST"
          ? "/strategist/jobs"
          : role === "ADMIN"
            ? "/admin/users"
            : "/client/briefs",
      icon: FileText,
    },
    {
      label: role === "ADMIN" ? "Vetting" : "Agents",
      href:
        role === "ADMIN"
          ? "/admin/vetting"
          : role === "STRATEGIST"
            ? "/strategist/agents"
            : "/client/agents",
      icon: role === "ADMIN" ? ShieldCheck : Bot,
    },
    {
      label: "Messages",
      href: "/app/messages",
      icon: MessageSquare,
    },
  ];

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
    <>
      {/* Fixed Bottom Tab Bar */}
      <nav className="bg-panel/95 shadow-warm fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-line px-2 py-1.5 backdrop-blur-md md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-2xs transition-colors ${
                isActive
                  ? "font-bold text-brand-indigo"
                  : "text-ink-3 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-2xs transition-colors ${
            moreOpen
              ? "font-bold text-brand-indigo"
              : "text-ink-3 hover:text-ink"
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span>More</span>
        </button>
      </nav>

      {/* More Sheet */}
      {moreOpen && (
        <div className="bg-ink/50 backdrop-blur-xs animate-in fade-in fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div className="shadow-warm animate-in slide-in-from-bottom max-h-[80vh] w-full space-y-4 overflow-y-auto rounded-t-2xl border-t border-line bg-panel p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-sans text-sm font-bold text-ink">
                  {currentUser?.name || "Account Menu"}
                </h3>
                <p className="text-2xs text-ink-3">
                  {currentUser?.email || "role: " + role.toLowerCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded p-1 text-ink-3 hover:bg-panel-2 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <Link
                href="/app/roi"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-ink-2 hover:bg-panel-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>ROI Telemetry</span>
              </Link>

              <Link
                href="/app/billing"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-ink-2 hover:bg-panel-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>Billing & Escrow</span>
              </Link>

              <Link
                href="/app/settings"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-ink-2 hover:bg-panel-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>

              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-ink-2 hover:bg-panel-2"
              >
                <div className="flex items-center gap-2.5">
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span>Theme</span>
                </div>
                <span className="font-mono text-2xs uppercase text-ink-3">
                  {theme || "light"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[#B42318] hover:bg-[#FFECEC] dark:text-[#F87171] dark:hover:bg-[#331515]"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
