"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Home,
  FileText,
  Users,
  GitBranch,
  Bot,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Briefcase,
  Layers,
  Award,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Settings,
  Plus,
  HelpCircle,
  BarChart3,
  ChevronDown,
  LogOut,
  Sparkles,
} from "lucide-react";
import { IdentityTile } from "@/components/ui/identity-tile";
import { PlanUsageMeter } from "./plan-usage-meter";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const SIDEBAR_COOKIE = "loopwise_sidebar_collapsed";

const ROLE_NAV = {
  CLIENT: [
    { label: "Home", href: "/client/dashboard", icon: Home },
    { label: "Briefs", href: "/client/briefs", icon: FileText },
    { label: "Matches", href: "/client/matches", icon: Users },
    { label: "Proposals", href: "/client/proposals", icon: Layers },
    { label: "Engagements", href: "/client/engagements", icon: Briefcase },
    { label: "Agents", href: "/client/agents", icon: Bot },
    { label: "ROI Telemetry", href: "/app/roi", icon: TrendingUp },
    { label: "Billing", href: "/app/billing", icon: CreditCard },
    { label: "Messages", href: "/app/messages", icon: MessageSquare },
  ],
  STRATEGIST: [
    { label: "Home", href: "/strategist/dashboard", icon: Home },
    { label: "Opportunities", href: "/strategist/jobs", icon: Briefcase },
    { label: "Proposals", href: "/strategist/proposals", icon: Layers },
    { label: "Engagements", href: "/strategist/engagements", icon: GitBranch },
    { label: "Agents", href: "/strategist/agents", icon: Bot },
    { label: "Earnings", href: "/strategist/earnings", icon: DollarSign },
    { label: "Playbooks", href: "/strategist/playbooks", icon: Award },
    { label: "Messages", href: "/app/messages", icon: MessageSquare },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin/dashboard", icon: Home },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Vetting", href: "/admin/vetting", icon: ShieldCheck },
    { label: "Disputes", href: "/admin/disputes", icon: Scale },
    { label: "Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Moderation", href: "/admin/moderation", icon: AlertTriangle },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

const DEFAULT_WORKSPACES = [
  { id: "uxr", name: "UXR Automation", tile: "U", colorIndex: 0 },
  { id: "product", name: "Product Management", tile: "P", colorIndex: 1 },
  { id: "sales", name: "Sales Outreach", tile: "S", colorIndex: 2 },
];

export function Sidebar({ initialCollapsed = false, currentUser = null }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [workspacesOpen, setWorkspacesOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const role = currentUser?.role || "CLIENT";
  const navItems = ROLE_NAV[role] || ROLE_NAV.CLIENT;

  // Toggle on "[" key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "[" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [collapsed]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    Cookies.set(SIDEBAR_COOKIE, String(next), { expires: 365, path: "/" });
  };

  const createActionHref =
    role === "CLIENT"
      ? "/client/briefs/new"
      : role === "STRATEGIST"
        ? "/strategist/proposals/new"
        : "/admin/users/new";

  const createActionLabel =
    role === "CLIENT"
      ? "New brief"
      : role === "STRATEGIST"
        ? "New proposal"
        : "New user";

  return (
    <aside
      className={`relative z-30 hidden shrink-0 select-none flex-col border-r border-line bg-panel transition-all duration-200 md:flex ${
        collapsed ? "w-14 items-center" : "w-60"
      }`}
    >
      {/* Top Header / Create Action */}
      <div className="flex w-full items-center justify-between gap-2 border-b border-line p-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={createActionHref}
                className="shadow-xs flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent text-white transition-transform hover:bg-brand-accent-hover active:scale-95"
                aria-label={createActionLabel}
              >
                <Plus className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{createActionLabel}</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href={createActionHref}
            className="btn-primary-orange shadow-xs flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{createActionLabel}</span>
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <div className="w-full flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-brand-accent-soft font-bold text-brand-accent"
                        : "text-ink-2 hover:bg-panel-2 hover:text-ink"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-brand-accent-soft font-semibold text-brand-accent"
                  : "text-ink-2 hover:bg-panel-2 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {/* Hairline Divider */}
        <div className="py-2">
          <div className="border-t border-line" />
        </div>

        {/* Workspaces Group (Pods) */}
        {!collapsed ? (
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setWorkspacesOpen(!workspacesOpen)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-ink-3 transition-colors hover:text-ink"
            >
              <span>Workspaces</span>
              <ChevronDown
                className={`h-3 w-3 transform transition-transform ${
                  workspacesOpen ? "rotate-0" : "-rotate-90"
                }`}
              />
            </button>

            {workspacesOpen && (
              <div className="space-y-0.5">
                {DEFAULT_WORKSPACES.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/client/agents?pod=${ws.id}`}
                    className="group flex items-center justify-between rounded-lg px-3 py-1.5 text-xs text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <IdentityTile
                        id={ws.id}
                        label={ws.tile}
                        colorIndex={ws.colorIndex}
                        size="sm"
                      />
                      <span className="truncate text-xs font-medium">
                        {ws.name}
                      </span>
                    </div>
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={() => router.push("/client/agents/new")}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-2xs text-ink-3 transition-colors hover:text-brand-accent"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add workspace</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            {DEFAULT_WORKSPACES.map((ws) => (
              <Tooltip key={ws.id}>
                <TooltipTrigger asChild>
                  <Link href={`/client/agents?pod=${ws.id}`}>
                    <IdentityTile
                      id={ws.id}
                      label={ws.tile}
                      colorIndex={ws.colorIndex}
                      size="sm"
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{ws.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="w-full space-y-3 border-t border-line p-3">
        {/* Plan Usage Meter */}
        <PlanUsageMeter
          collapsed={collapsed}
          planName="Enterprise Fleet"
          used={320}
          total={10000}
          unit="Activities"
        />

        {/* Secondary Links */}
        {!collapsed && (
          <div className="space-y-0.5 pt-1 text-xs">
            <Link
              href="/app/roi"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
            >
              <BarChart3 className="h-4 w-4 text-ink-3" />
              <span>Data & usage</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const btn = document.getElementById("app-help-toggle-btn");
                btn?.click();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-ink-2 transition-colors hover:bg-panel-2 hover:text-ink"
            >
              <HelpCircle className="h-4 w-4 text-ink-3" />
              <span>Support</span>
            </button>
          </div>
        )}

        {/* User Card / Menu */}
        <div className="border-t border-line pt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tile-teal font-mono text-xs font-bold text-white">
                {(currentUser?.name || "User").charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold leading-tight text-ink">
                    {currentUser?.name || "Executive User"}
                  </p>
                  <p className="truncate text-[10px] leading-tight text-ink-3">
                    {role.toLowerCase()}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={toggleCollapsed}
                title="Collapse sidebar ([)"
                className="rounded p-1 text-ink-3 transition-colors hover:bg-panel-2 hover:text-ink"
              >
                <kbd className="rounded border border-line bg-panel-2 px-1 font-mono text-[10px]">
                  [
                </kbd>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
