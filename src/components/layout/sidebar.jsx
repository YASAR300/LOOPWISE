"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import {
  LayoutDashboard,
  GitBranch,
  Bot,
  TrendingUp,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { SimpleTooltip } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const SIDEBAR_COOKIE = "loopwise_sidebar_collapsed";

const mainNavItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Workflow Mapper", href: "/app/workflows", icon: GitBranch },
  { label: "Agent Registry", href: "/app/agents", icon: Bot },
  { label: "ROI Proof", href: "/app/roi", icon: TrendingUp },
];

const secondaryNavItems = [
  { label: "Team Members", href: "/app/team", icon: Users },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function Sidebar({ initialCollapsed = false, className = "" }) {
  const [collapsed, setCollapsed] = React.useState(initialCollapsed);
  const pathname = usePathname();

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    Cookies.set(SIDEBAR_COOKIE, String(next), { expires: 365, path: "/" });
  };

  return (
    <aside
      className={cn(
        "relative hidden shrink-0 select-none flex-col border-r border-border-hairline bg-surface-raised transition-all duration-normal md:flex",
        collapsed ? "w-14" : "w-60",
        className
      )}
    >
      {/* Workspace Switcher Header */}
      <div className="flex h-12 items-center justify-between border-b border-border-hairline px-3">
        {!collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:bg-surface-highlight"
              >
                <div className="bg-accent/20 border-accent/40 flex h-6 w-6 shrink-0 items-center justify-center rounded border text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-semibold leading-tight text-text-primary">
                    Acme Enterprise
                  </span>
                  <span className="truncate text-2xs leading-none text-text-muted">
                    Pro Organization
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 shrink-0 text-text-muted" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
              <DropdownMenuItem className="gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                <span>Acme Enterprise</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Building2 className="h-4 w-4 text-text-muted" />
                <span>Global Dynamics AI</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dev/components">
                  <span>UI Design System (/dev/components)</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="bg-accent/20 border-accent/40 mx-auto flex h-7 w-7 items-center justify-center rounded border text-accent">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
        <div>
          {!collapsed && (
            <div className="px-2 pb-1 text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Platform
            </div>
          )}
          <nav className="space-y-0.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border border-border-hairline bg-surface-overlay text-text-primary shadow-sm"
                      : "text-text-secondary hover:bg-surface-highlight hover:text-text-primary",
                    collapsed && "mx-auto h-9 w-9 justify-center px-0"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-accent" : "text-text-muted"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <SimpleTooltip
                    key={item.href}
                    content={item.label}
                    side="right"
                  >
                    {linkContent}
                  </SimpleTooltip>
                );
              }
              return linkContent;
            })}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <div className="px-2 pb-1 text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Workspace
            </div>
          )}
          <nav className="space-y-0.5">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border border-border-hairline bg-surface-overlay text-text-primary shadow-sm"
                      : "text-text-secondary hover:bg-surface-highlight hover:text-text-primary",
                    collapsed && "mx-auto h-9 w-9 justify-center px-0"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-accent" : "text-text-muted"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (collapsed) {
                return (
                  <SimpleTooltip
                    key={item.href}
                    content={item.label}
                    side="right"
                  >
                    {linkContent}
                  </SimpleTooltip>
                );
              }
              return linkContent;
            })}
          </nav>
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="flex justify-end border-t border-border-hairline p-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mx-auto flex h-7 w-7 items-center justify-center rounded text-text-muted transition-colors hover:bg-surface-highlight hover:text-text-primary"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User Footer */}
      <div className="border-t border-border-hairline p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-surface-highlight",
                collapsed && "justify-center p-1"
              )}
            >
              <Avatar
                size={collapsed ? "sm" : "sm"}
                fallback="YS"
                alt="Yasar"
              />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium leading-tight text-text-primary">
                    Yasar S.
                  </span>
                  <span className="truncate text-2xs leading-tight text-text-muted">
                    Client Admin
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/app/settings">
                <Settings className="mr-2 h-3.5 w-3.5" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="text-semantic-danger">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>Log Out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
