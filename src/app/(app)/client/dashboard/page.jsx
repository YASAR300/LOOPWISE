import * as React from "react";
import Link from "next/link";
import {
  Users,
  Bot,
  TrendingUp,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { PageHeader, ContentContainer } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Client Dashboard - Loopwise",
  description: "Manage your fractional Heads of AI and agent deployments.",
};

export default function ClientDashboardPage() {
  const metrics = [
    {
      label: "Active Strategists",
      value: "2",
      change: "+1 this month",
      icon: Users,
    },
    {
      label: "Autonomous Agents",
      value: "7",
      change: "99.8% uptime",
      icon: Bot,
    },
    {
      label: "Net Hours Saved",
      value: "1,420 hrs",
      change: "≈ $112,000 ROI",
      icon: TrendingUp,
    },
    {
      label: "Active Engagements",
      value: "3",
      change: "On track",
      icon: FileText,
    },
  ];

  return (
    <ContentContainer size="wide">
      <PageHeader
        title="Client Workspace"
        description="Monitor deployed autonomous agents, fractional AI leadership, and ROI performance."
        badge={<Badge variant="accent">Client Tier</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="primary" size="sm" className="gap-1.5">
              <Link href="/app">
                <Plus className="h-3.5 w-3.5" />
                <span>New AI Initiative</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} raised className="border-border-hairline">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-medium uppercase tracking-wider text-text-muted">
                    {m.label}
                  </span>
                  <div className="bg-accent/10 flex h-7 w-7 items-center justify-center rounded text-accent">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
                  {m.value}
                </div>
                <div className="mt-1 text-2xs text-text-muted">{m.change}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active AI Leadership */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Engaged AI Strategists
                </CardTitle>
                <Link
                  href="/app"
                  className="flex items-center gap-1 text-2xs text-text-muted hover:text-text-primary"
                >
                  <span>View all</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border-hairline p-0">
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-surface-highlight">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-semibold text-accent">
                    ER
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">
                        Elena Rostova
                      </span>
                      <Badge variant="accent" size="xs">
                        <ShieldCheck className="mr-1 inline h-3 w-3" /> Vetted
                      </Badge>
                    </div>
                    <span className="text-2xs text-text-muted">
                      Fractional Head of AI • LangGraph & Enterprise Agentic
                      Workflows
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-medium text-text-primary">
                    15 hrs/wk
                  </div>
                  <div className="flex items-center justify-end gap-1 text-2xs text-semantic-success">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 transition-colors hover:bg-surface-highlight">
                <div className="flex items-center gap-3">
                  <div className="bg-accent/20 flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-semibold text-accent">
                    MC
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">
                        Marcus Chen
                      </span>
                      <Badge variant="accent" size="xs">
                        <ShieldCheck className="mr-1 inline h-3 w-3" /> Vetted
                      </Badge>
                    </div>
                    <span className="text-2xs text-text-muted">
                      VP AI Engineering • Autonomous Agent Governance & Red
                      Teaming
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-medium text-text-primary">
                    10 hrs/wk
                  </div>
                  <div className="flex items-center justify-end gap-1 text-2xs text-semantic-success">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Governance Status */}
        <div className="space-y-4">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-3">
              <CardTitle className="text-sm font-semibold">
                Governance Guardrails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  SOC2 Compliance Check
                </span>
                <Badge
                  variant="outline"
                  size="xs"
                  className="border-semantic-success/40 text-semantic-success"
                >
                  Passing
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Escrow Balance Funded
                </span>
                <span className="font-mono text-xs text-text-primary">
                  $18,500.00
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Incident Alerts</span>
                <span className="text-2xs text-text-muted">0 Active</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentContainer>
  );
}
