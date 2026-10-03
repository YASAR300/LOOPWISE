"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  GitBranch,
  Bot,
  DollarSign,
  ShieldCheck,
  Search,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";

export function LoopwiseWordmark({ className = "h-6 w-6" }) {
  return <Logo href={null} markClassName={className} textClassName="text-lg" />;
}

export function MarketingNavbar({ specializations = [] }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setUser(data.user);
      });
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      return () => subscription.unsubscribe();
    } catch {
      // Fallback
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const userRole = user?.user_metadata?.role || "CLIENT";
  const dashboardHref =
    userRole === "ADMIN"
      ? "/admin/dashboard"
      : userRole === "STRATEGIST"
        ? "/strategist/dashboard"
        : "/client/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-panel">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Wordmark & Logo */}
        <Link
          href="/"
          className="flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
        >
          <LoopwiseWordmark />
        </Link>

        {/* Center: Dropdown Navigation Links */}
        <nav
          ref={dropdownRef}
          aria-label="Main Navigation"
          className="hidden items-center gap-1 text-[14px] font-medium text-ink-2 lg:flex"
        >
          {/* Product Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === "product" ? null : "product"
                )
              }
              className={`flex items-center gap-1 rounded-md px-3 py-2 transition-colors hover:bg-canvas-2 hover:text-ink ${
                activeDropdown === "product" ? "bg-canvas-2 text-ink" : ""
              }`}
            >
              <span>Product</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
            </button>

            {activeDropdown === "product" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 animate-fade-in rounded-xl border border-line bg-panel p-2 shadow-lg">
                <Link
                  href="/#showcase"
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-start gap-2.5 rounded-lg p-2 text-xs hover:bg-canvas-2"
                >
                  <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                  <div>
                    <span className="block font-semibold text-ink">
                      Workflow Mapper
                    </span>
                    <span className="text-2xs text-ink-3">
                      SOP ingestion & scoring
                    </span>
                  </div>
                </Link>
                <Link
                  href="/#showcase"
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-start gap-2.5 rounded-lg p-2 text-xs hover:bg-canvas-2"
                >
                  <Bot className="mt-0.5 h-4 w-4 shrink-0 text-brand-indigo" />
                  <div>
                    <span className="block font-semibold text-ink">
                      Agent Swarm Registry
                    </span>
                    <span className="text-2xs text-ink-3">
                      Guardrails & kill-switches
                    </span>
                  </div>
                </Link>
                <Link
                  href="/#showcase"
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-start gap-2.5 rounded-lg p-2 text-xs hover:bg-canvas-2"
                >
                  <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  <div>
                    <span className="block font-semibold text-ink">
                      Escrow & Milestones
                    </span>
                    <span className="text-2xs text-ink-3">
                      Protected retainer releases
                    </span>
                  </div>
                </Link>
                <Link
                  href="/#showcase"
                  onClick={() => setActiveDropdown(null)}
                  className="flex items-start gap-2.5 rounded-lg p-2 text-xs hover:bg-canvas-2"
                >
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-semantic-success" />
                  <div>
                    <span className="block font-semibold text-ink">
                      ROI & Governance
                    </span>
                    <span className="text-2xs text-ink-3">
                      NIST AI RMF 1.0 pack
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === "solutions" ? null : "solutions"
                )
              }
              className={`flex items-center gap-1 rounded-md px-3 py-2 transition-colors hover:bg-canvas-2 hover:text-ink ${
                activeDropdown === "solutions" ? "bg-canvas-2 text-ink" : ""
              }`}
            >
              <span>Solutions</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
            </button>

            {activeDropdown === "solutions" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 animate-fade-in rounded-xl border border-line bg-panel p-2 shadow-lg">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                  Enterprise Domains
                </p>
                <Link
                  href="/strategists?spec=enterprise-workflow-automation"
                  onClick={() => setActiveDropdown(null)}
                  className="block rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas-2"
                >
                  Enterprise Workflow Automation
                </Link>
                <Link
                  href="/strategists?spec=autonomous-agent-architecture"
                  onClick={() => setActiveDropdown(null)}
                  className="block rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas-2"
                >
                  Autonomous Agent Architecture
                </Link>
                <Link
                  href="/strategists?spec=ai-governance-guardrails"
                  onClick={() => setActiveDropdown(null)}
                  className="block rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas-2"
                >
                  AI Governance & Guardrails
                </Link>
                <Link
                  href="/strategists?spec=domain-agent-workflows"
                  onClick={() => setActiveDropdown(null)}
                  className="block rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas-2"
                >
                  Healthcare & Clinical Pipelines
                </Link>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveDropdown(
                  activeDropdown === "resources" ? null : "resources"
                )
              }
              className={`flex items-center gap-1 rounded-md px-3 py-2 transition-colors hover:bg-canvas-2 hover:text-ink ${
                activeDropdown === "resources" ? "bg-canvas-2 text-ink" : ""
              }`}
            >
              <span>Resources</span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-3" />
            </button>

            {activeDropdown === "resources" && (
              <div className="absolute left-0 top-full z-50 mt-1 w-52 animate-fade-in rounded-xl border border-line bg-panel p-2 shadow-lg">
                <Link
                  href="/how-it-works"
                  onClick={() => setActiveDropdown(null)}
                  className="block rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas-2"
                >
                  How It Works
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setActiveDropdown(null)}
                  className="block rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas-2"
                >
                  Compare vs Freelancers
                </Link>
                <Link
                  href="/security"
                  onClick={() => setActiveDropdown(null)}
                  className="block rounded-lg px-2.5 py-1.5 text-xs text-ink hover:bg-canvas-2"
                >
                  Enterprise Security
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/pricing"
            className="rounded-md px-3 py-2 transition-colors hover:bg-canvas-2 hover:text-ink"
          >
            Pricing
          </Link>
          <Link
            href="/for-strategists"
            className="rounded-md px-3 py-2 transition-colors hover:bg-canvas-2 hover:text-ink"
          >
            For Strategists
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/strategists"
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-ink"
          >
            <Search className="h-3.5 w-3.5 text-brand-accent" />
            <span>Browse strategists</span>
          </Link>

          <Link
            href="/contact"
            className="px-2 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:text-ink"
          >
            Contact
          </Link>

          {user ? (
            <Link
              href={dashboardHref}
              className="px-2 py-1.5 text-xs font-semibold text-brand-indigo hover:text-ink"
            >
              Open dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-2 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:text-ink"
            >
              Log in
            </Link>
          )}

          <Link
            href={user ? dashboardHref : "/signup?role=client"}
            className="btn-primary-orange-pill inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold shadow-sm"
          >
            <span>{user ? "Console" : "Get started"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md p-2 text-ink-2 hover:bg-canvas-2 hover:text-ink lg:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Accordion Sheet */}
      {mobileMenuOpen && (
        <div className="animate-fade-in space-y-5 border-t border-line bg-panel p-6 lg:hidden">
          <div className="space-y-3">
            <p className="text-2xs font-semibold uppercase text-ink-3">
              Navigation
            </p>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              Home
            </Link>
            <Link
              href="/#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              Workflow Mapper
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              Pricing & Fee Calculator
            </Link>
            <Link
              href="/strategists"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              Browse Strategists
            </Link>
            <Link
              href="/for-strategists"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              For Strategists
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              Compare vs Freelancers
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 text-sm font-medium text-ink"
            >
              Contact Sales
            </Link>
          </div>

          <div className="space-y-2.5 border-t border-line pt-4">
            {user ? (
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary-outline block w-full py-2.5 text-center text-xs font-semibold"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary-outline block w-full py-2.5 text-center text-xs font-semibold"
                >
                  Log in
                </Link>
                <Link
                  href="/signup?role=client"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary-orange-pill block w-full py-2.5 text-center text-xs font-semibold"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
