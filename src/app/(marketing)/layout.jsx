import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function MarketingLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      {/* Top Navigation */}
      <header className="bg-surface-base/80 sticky top-0 z-40 w-full border-b border-border-hairline backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="bg-accent/20 border-accent/40 flex h-7 w-7 items-center justify-center rounded-md border text-accent transition-colors group-hover:border-accent">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              Loopwise
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs text-text-secondary md:flex">
            <Link
              href="#features"
              className="transition-colors hover:text-text-primary"
            >
              Platform
            </Link>
            <Link
              href="#governance"
              className="transition-colors hover:text-text-primary"
            >
              Governance Pack
            </Link>
            <Link
              href="/dev/components"
              className="transition-colors hover:text-text-primary"
            >
              Design System
            </Link>
            <Link
              href="/app"
              className="transition-colors hover:text-text-primary"
            >
              App Preview
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/login" className="gap-1.5">
                <span>Hire Strategist</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-surface-raised/40 border-t border-border-hairline py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-accent/20 border-accent/40 flex h-6 w-6 items-center justify-center rounded border text-accent">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-text-primary">
                Loopwise
              </span>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              The marketplace for Fractional Heads of AI & Automation. Deploy
              vetted autonomous agents with verified ROI.
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-2xs text-semantic-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>NIST AI RMF & EU AI Act Audited</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link
                  href="/app"
                  className="transition-colors hover:text-text-primary"
                >
                  Workflow Mapper
                </Link>
              </li>
              <li>
                <Link
                  href="/app"
                  className="transition-colors hover:text-text-primary"
                >
                  Agent Registry
                </Link>
              </li>
              <li>
                <Link
                  href="/app"
                  className="transition-colors hover:text-text-primary"
                >
                  ROI Proof Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dev/components"
                  className="transition-colors hover:text-text-primary"
                >
                  UI Primitives Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Roles
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-text-primary"
                >
                  Hire a Fractional CAIO
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-text-primary"
                >
                  Apply as Strategist
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-text-primary"
                >
                  Enterprise Escrow
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-2xs font-semibold uppercase tracking-wider text-text-muted">
              Security & Legal
            </h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Responsible AI Charter</li>
              <li>SOC 2 Compliance</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between border-t border-border-hairline px-4 pt-6 text-2xs text-text-muted sm:flex-row sm:px-6">
          <p>© 2026 Loopwise Inc. All rights reserved.</p>
          <p className="mt-2 font-mono sm:mt-0">
            Linear-inspired Dark-First Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
