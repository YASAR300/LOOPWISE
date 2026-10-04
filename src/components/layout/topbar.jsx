"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  HelpCircle,
  Plus,
  Compass,
  Mail,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  PanelLeft,
} from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/logo";

export function Topbar({ currentUser = null, breadcrumbs = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userDropdownOpen]);

  const role = currentUser?.role || "CLIENT";
  const userInitials = (currentUser?.name || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const primaryBtnLabel =
    role === "CLIENT"
      ? "+ New brief"
      : role === "STRATEGIST"
        ? "+ Find jobs"
        : "+ New user";

  const primaryBtnHref =
    role === "CLIENT"
      ? "/client/briefs/new"
      : role === "STRATEGIST"
        ? "/strategist/jobs"
        : "/admin/users/new";

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Fallback
    }
    router.push("/login");
  };

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  const handleOpenHelp = () => {
    window.dispatchEvent(new CustomEvent("open-shortcut-sheet"));
  };

  const handleOpenSupport = () => {
    const btn = document.getElementById("app-help-toggle-btn");
    btn?.click();
  };

  return (
    <header className="bg-panel/95 sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-line px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile hamburger + Wordmark */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const sidebarBtn = document.querySelector(
              "[title*='Collapse sidebar']"
            );
            sidebarBtn?.click();
          }}
          className="rounded-lg border border-line p-1.5 text-ink-3 hover:bg-panel-2 hover:text-ink md:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link
          href={
            role === "STRATEGIST"
              ? "/strategist/dashboard"
              : role === "ADMIN"
                ? "/admin/dashboard"
                : "/client/dashboard"
          }
          className="group flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
        >
          <Logo href={null} markClassName="h-6 w-6" textClassName="text-base" />
        </Link>

        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("toggle-sidebar"));
          }}
          className="ml-1 hidden h-7 w-7 items-center justify-center rounded-lg border border-line text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink md:flex"
          title="Toggle sidebar ([)"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div className="mx-4 hidden max-w-sm flex-1 items-center sm:flex">
        <button
          type="button"
          onClick={handleOpenSearch}
          className="shadow-2xs flex h-8 w-full items-center justify-between rounded-lg border border-line bg-canvas px-3 text-xs text-ink-3 transition-all hover:border-line-2 hover:text-ink"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-ink-3" />
            <span>Search or jump to...</span>
          </div>
          <div className="flex items-center gap-1 rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Search trigger on mobile */}
        <button
          type="button"
          onClick={handleOpenSearch}
          className="rounded-lg border border-line p-1.5 text-ink-3 hover:bg-panel-2 hover:text-ink sm:hidden"
          aria-label="Open search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Explore link */}
        <Link
          href="/strategists"
          className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink md:flex"
        >
          <Compass className="h-3.5 w-3.5 text-ink-3" />
          <span>Explore</span>
        </Link>

        {/* Contact Outlined Button */}
        <button
          type="button"
          onClick={handleOpenSupport}
          className="hidden items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-panel-2 lg:flex"
        >
          <Mail className="h-3.5 w-3.5 text-ink-3" />
          <span>Contact</span>
        </button>

        {/* Keyboard Help */}
        <button
          type="button"
          onClick={handleOpenHelp}
          title="Keyboard shortcuts (?)"
          className="hidden rounded-lg border border-line p-1.5 text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink sm:flex"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>

        {/* Primary Contextual Action (Indigo Button) */}
        <Link
          href={primaryBtnHref}
          className="btn-primary-indigo shadow-2xs h-8 gap-1.5 px-3 text-xs font-semibold"
        >
          <span>{primaryBtnLabel}</span>
        </Link>

        {/* User Avatar Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex h-8 w-8 select-none items-center justify-center rounded-full border border-line bg-tile-teal font-mono text-xs font-bold text-white transition-all hover:ring-2 hover:ring-brand-indigo"
            aria-label="User account menu"
            aria-expanded={userDropdownOpen}
          >
            {userInitials}
          </button>

          {userDropdownOpen && (
            <div className="shadow-warm animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-panel p-1.5 text-ink duration-100">
              <div className="mb-1 border-b border-line px-3 py-2">
                <p className="truncate text-xs font-bold text-ink">
                  {currentUser?.name || "Executive User"}
                </p>
                <p className="truncate text-[11px] text-ink-3">
                  {currentUser?.email || "user@enterprise.com"}
                </p>
                <span className="mt-1 inline-block rounded bg-brand-accent-soft px-1.5 py-0.5 font-mono text-[10px] font-semibold text-brand-indigo">
                  {role}
                </span>
              </div>

              <Link
                href="/app/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
              >
                <Settings className="h-3.5 w-3.5 text-ink-3" />
                <span>Account settings</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
              >
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Sun className="h-3.5 w-3.5 text-ink-3" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-ink-3" />
                  )}
                  <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
                </div>
                <span className="font-mono text-[10px] text-ink-3">Toggle</span>
              </button>

              <div className="my-1 border-t border-line" />

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs text-[#B42318] transition-colors hover:bg-[#FFECEC] dark:text-[#F87171] dark:hover:bg-[#331515]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
