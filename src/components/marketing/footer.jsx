"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";

export function FooterWordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className="h-7 w-7" />
      <span className="font-display text-xl font-bold tracking-tight text-[#FFFDF9]">
        Loopwise
      </span>
    </div>
  );
}

export function MarketingFooter() {
  const twitterUrl =
    process.env.NEXT_PUBLIC_TWITTER_URL || "https://x.com/loopwise";
  const linkedinUrl =
    process.env.NEXT_PUBLIC_LINKEDIN_URL ||
    "https://linkedin.com/company/loopwise";
  const githubUrl =
    process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/loopwise";

  return (
    <footer className="relative overflow-hidden border-t border-[#33312B] bg-[#1B1A17] pb-12 pt-16 text-[#D6CFC0]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 border-b border-[#33312B] pb-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Col */}
          <div className="space-y-4 lg:col-span-2">
            <Link
              href="/"
              className="inline-block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo"
            >
              <FooterWordmark />
            </Link>
            <p className="max-w-sm text-xs leading-relaxed text-[#8C877C]">
              The marketplace for Fractional Heads of AI & Automation. Deploy
              vetted enterprise automation leaders who map internal SOPs and
              deploy production agent swarms with verified ROI.
            </p>
            <div className="flex items-center gap-2 pt-2 text-2xs text-[#9BE59B]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>NIST AI RMF 1.0 & EU AI Act Audited Infrastructure</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#8C877C] transition-colors hover:text-[#FFFDF9]"
                aria-label="Loopwise on X"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#8C877C] transition-colors hover:text-[#FFFDF9]"
                aria-label="Loopwise on LinkedIn"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 9.74V9.93H5.06v8.57z" />
                </svg>
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#8C877C] transition-colors hover:text-[#FFFDF9]"
                aria-label="Loopwise on GitHub"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 1: Product */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFFDF9]">
              Product
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/#showcase"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Workflow Mapper
                </Link>
              </li>
              <li>
                <Link
                  href="/#showcase"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Agent Swarm Registry
                </Link>
              </li>
              <li>
                <Link
                  href="/#showcase"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Escrow Milestones
                </Link>
              </li>
              <li>
                <Link
                  href="/#showcase"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  ROI Telemetry
                </Link>
              </li>
              <li>
                <Link
                  href="/strategists"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Browse AI Leaders
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Pricing & Fees
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFFDF9]">
              Solutions
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/hire/customer-support"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Support Automation
                </Link>
              </li>
              <li>
                <Link
                  href="/hire/revops"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  RevOps & CRM Sync
                </Link>
              </li>
              <li>
                <Link
                  href="/hire/finance"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Finance & ERP Agents
                </Link>
              </li>
              <li>
                <Link
                  href="/hire/devops"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Engineering & CI/CD
                </Link>
              </li>
              <li>
                <Link
                  href="/hire/healthcare"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Healthcare HIPAA AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFFDF9]">
              Resources
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/how-it-works"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/compare"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Loopwise vs Generalists
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Security & Governance
                </Link>
              </li>
              <li>
                <Link
                  href="/for-strategists"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  For AI Strategists
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  FAQ & Knowledge Base
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#FFFDF9]">
              Company & Legal
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  About Loopwise
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Contact Advisory Desk
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-[#FFFDF9]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <span className="cursor-default text-[#8C877C]">
                  Zero Data Retention Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-2xs text-[#8C877C] sm:flex-row">
          <p>© {new Date().getFullYear()} Loopwise Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono">Encrypted Stripe Escrow</span>
            <span className="h-1 w-1 rounded-full bg-[#33312B]" />
            <span className="font-mono">NIST AI RMF Audited</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
