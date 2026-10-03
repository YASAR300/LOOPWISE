"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Sparkles, HelpCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { useCommandPalette } from "./command-palette";
import { useKeyboardShortcuts } from "./keyboard-shortcuts";
import { Kbd } from "@/components/ui/kbd";

export function Topbar({ breadcrumbs = [] }) {
  const { setOpen } = useCommandPalette();
  const { openHelp } = useKeyboardShortcuts();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const defaultBreadcrumbs =
    breadcrumbs.length > 0
      ? breadcrumbs
      : [
          { label: "Loopwise", href: "/app" },
          {
            label:
              pathname === "/app"
                ? "Dashboard"
                : pathname
                    .replace("/app/", "")
                    .replace(/^\w/, (c) => c.toUpperCase()),
          },
        ];

  return (
    <header className="bg-surface-raised/80 sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-border-hairline px-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Sheet Trigger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded border border-border-hairline bg-surface-raised text-text-secondary hover:text-text-primary"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open Menu</span>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <SheetHeader className="border-b border-border-hairline p-4">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <div className="bg-accent/20 border-accent/40 flex h-6 w-6 items-center justify-center rounded border text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <span>Loopwise</span>
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-1 p-3">
                <Link
                  href="/app"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-highlight"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dev/components"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-medium text-text-primary hover:bg-surface-highlight"
                >
                  Component Showcase
                </Link>
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-medium text-text-secondary hover:bg-surface-highlight hover:text-text-primary"
                >
                  Landing Page
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-medium text-text-secondary hover:bg-surface-highlight hover:text-text-primary"
                >
                  Sign In
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs items={defaultBreadcrumbs} />
      </div>

      {/* Right Actions: Command Search trigger, Keyboard Help, Theme Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 select-none items-center gap-2 rounded-md border border-border-hairline bg-surface-raised px-2.5 text-xs text-text-muted transition-colors hover:border-border-subtle hover:bg-surface-overlay hover:text-text-primary"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search or command...</span>
          <div className="ml-2 hidden items-center gap-0.5 sm:flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </div>
        </button>

        <button
          type="button"
          onClick={openHelp}
          title="Keyboard shortcuts (?)"
          className="hidden h-8 w-8 items-center justify-center rounded-md border border-border-hairline bg-surface-raised text-text-secondary transition-colors hover:border-border-subtle hover:bg-surface-overlay hover:text-text-primary sm:inline-flex"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
