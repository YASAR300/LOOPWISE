"use client";

import React from "react";
import Link from "next/link";
import {
  FilePlus,
  GitBranch,
  UserCheck,
  Bot,
  BarChart3,
  Briefcase,
  Clock,
  Send,
  BookOpen,
  ShieldAlert,
  Scale,
  CreditCard,
  Flag,
} from "lucide-react";

export const ROLE_QUICK_ACTIONS = {
  CLIENT: [
    {
      title: "New brief",
      subtitle: "Define an internal workflow",
      icon: FilePlus,
      href: "/client/briefs/new",
    },
    {
      title: "Map workflow",
      subtitle: "Decompose SOP with AI",
      icon: GitBranch,
      href: "/#showcase",
    },
    {
      title: "Find strategist",
      subtitle: "Browse top 3% vetted leaders",
      icon: UserCheck,
      href: "/strategists",
    },
    {
      title: "Register agent",
      subtitle: "Deploy state machine into fleet",
      icon: Bot,
      href: "/client/agents/new",
    },
    {
      title: "Create report",
      subtitle: "Board-ready ROI telemetry",
      icon: BarChart3,
      href: "/app/roi",
    },
  ],
  STRATEGIST: [
    {
      title: "Find jobs",
      subtitle: "Browse open enterprise briefs",
      icon: Briefcase,
      href: "/strategist/jobs",
    },
    {
      title: "Update capacity",
      subtitle: "Set available hours per week",
      icon: Clock,
      href: "/app/settings",
    },
    {
      title: "Send update",
      subtitle: "Weekly milestone progress",
      icon: Send,
      href: "/strategist/engagements",
    },
    {
      title: "Publish playbook",
      subtitle: "Share verified architecture",
      icon: BookOpen,
      href: "/strategist/playbooks/new",
    },
    {
      title: "View earnings",
      subtitle: "Escrow release ledgers",
      icon: CreditCard,
      href: "/strategist/earnings",
    },
  ],
  ADMIN: [
    {
      title: "Review vetting",
      subtitle: "14 applicants in review queue",
      icon: ShieldAlert,
      href: "/admin/vetting",
    },
    {
      title: "Resolve disputes",
      subtitle: "Escrow release arbitration",
      icon: Scale,
      href: "/admin/disputes",
    },
    {
      title: "Reconcile payments",
      subtitle: "Audit Stripe payouts & fees",
      icon: CreditCard,
      href: "/admin/payments",
    },
    {
      title: "Moderate",
      subtitle: "Review public profiles & briefs",
      icon: Flag,
      href: "/admin/moderation",
    },
    {
      title: "Audit logs",
      subtitle: "SOC 2 security access trails",
      icon: BarChart3,
      href: "/admin/settings",
    },
  ],
};

export function QuickStartCard({ title, subtitle, icon: Icon, href }) {
  return (
    <Link
      href={href}
      className="hover:shadow-soft duration-160 group flex select-none items-start gap-3 rounded-[14px] border border-line bg-panel p-3.5 transition-all hover:border-line-2"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-accent-soft text-brand-accent transition-transform group-hover:scale-105">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-sans text-xs font-bold leading-tight text-ink transition-colors group-hover:text-brand-accent">
          {title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] leading-normal text-ink-3">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}

export function QuickStartRow({ role = "CLIENT" }) {
  const actions = ROLE_QUICK_ACTIONS[role] || ROLE_QUICK_ACTIONS.CLIENT;

  return (
    <div className="space-y-3">
      <h2 className="text-2xs font-bold uppercase tracking-wider text-ink-3">
        Start from scratch
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((act, idx) => (
          <QuickStartCard key={idx} {...act} />
        ))}
      </div>
    </div>
  );
}
