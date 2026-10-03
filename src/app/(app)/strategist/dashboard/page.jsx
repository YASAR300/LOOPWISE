import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  DollarSign,
  Sparkles,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { PageHeader, ContentContainer } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Strategist Console - Loopwise",
  description:
    "Track client engagements, proposal opportunities, and billable hours.",
};

export default function StrategistDashboardPage() {
  const metrics = [
    {
      label: "Active Engagements",
      value: "2",
      change: "25 hrs committed / wk",
      icon: Briefcase,
    },
    {
      label: "Monthly Retainer",
      value: "$16,500",
      change: "+12% vs last month",
      icon: DollarSign,
    },
    {
      label: "Hours Logged",
      value: "48.5 hrs",
      change: "Current cycle",
      icon: Clock,
    },
    {
      label: "Vetting Score",
      value: "98.4%",
      change: "Top 2% of Strategists",
      icon: Sparkles,
    },
  ];

  return (
    <ContentContainer size="wide">
      <PageHeader
        title="Strategist Console"
        description="Monitor active enterprise contracts, review client match proposals, and submit work deliverables."
        badge={<Badge variant="accent">Vetted Head of AI</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="primary" size="sm" className="gap-1.5">
              <Link href="/app">
                <Calendar className="h-3.5 w-3.5" />
                <span>Log Deliverable</span>
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

      {/* Engagements & Opportunities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Active Client Contracts
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
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary">
                      Fintech Global Corp
                    </span>
                    <Badge variant="outline" size="xs">
                      Retainer ($9,500/mo)
                    </Badge>
                  </div>
                  <span className="text-2xs text-text-muted">
                    Multi-Agent Fraud Mitigation & Re-architecting legacy AML
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-medium text-text-primary">
                    15 hrs/wk
                  </div>
                  <div className="flex items-center justify-end gap-1 text-2xs text-semantic-success">
                    <CheckCircle2 className="h-3 w-3" /> In Progress
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 transition-colors hover:bg-surface-highlight">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary">
                      Helix HealthTech
                    </span>
                    <Badge variant="outline" size="xs">
                      Retainer ($7,000/mo)
                    </Badge>
                  </div>
                  <span className="text-2xs text-text-muted">
                    Clinical Document Parser Agents & HIPAA Guardrails Setup
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-medium text-text-primary">
                    10 hrs/wk
                  </div>
                  <div className="flex items-center justify-end gap-1 text-2xs text-semantic-success">
                    <CheckCircle2 className="h-3 w-3" /> In Progress
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status & Availability */}
        <div className="space-y-4">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-3">
              <CardTitle className="text-sm font-semibold">
                Capacity & Payout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Weekly Availability</span>
                <span className="font-mono text-xs text-text-primary">
                  15 hrs open
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Pending Escrow Payout
                </span>
                <span className="font-mono text-xs text-semantic-success">
                  $8,250.00
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Next Payout Date</span>
                <span className="text-2xs text-text-muted">Oct 15, 2026</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentContainer>
  );
}
