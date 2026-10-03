import * as React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { PageHeader, ContentContainer } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Admin Console - Loopwise",
  description: "Platform operations, vetting queue, and escrow telemetry.",
};

export default function AdminDashboardPage() {
  const metrics = [
    {
      label: "Vetting Queue",
      value: "8 Pending",
      change: "4 under review",
      icon: Clock,
    },
    {
      label: "Active Marketplace GMV",
      value: "$412,000",
      change: "+24% QoQ",
      icon: DollarSign,
    },
    {
      label: "Platform Take (15%)",
      value: "$61,800",
      change: "Net platform revenue",
      icon: Activity,
    },
    {
      label: "Active Strategists",
      value: "64",
      change: "Top 2% acceptance",
      icon: Users,
    },
  ];

  return (
    <ContentContainer size="wide">
      <PageHeader
        title="Platform Administration"
        description="Review strategist vetting submissions, oversee enterprise escrows, and monitor audit telemetry."
        badge={
          <Badge
            variant="outline"
            className="border-semantic-danger/40 text-semantic-danger"
          >
            Admin Clearance
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 border-border-hairline"
            >
              <Link href="/app">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Audit Logs</span>
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

      {/* Vetting Queue & Escrow Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Strategist Vetting Submissions
                </CardTitle>
                <span className="text-2xs text-text-muted">
                  8 awaiting review
                </span>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border-hairline p-0">
              <div className="flex items-center justify-between p-4 transition-colors hover:bg-surface-highlight">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary">
                      Dr. Aris Vance
                    </span>
                    <Badge variant="outline" size="xs">
                      12 yrs exp
                    </Badge>
                  </div>
                  <span className="text-2xs text-text-muted">
                    Ex-Staff AI Engineer at Palantir • LLM Orchestration &
                    Self-Hosted Guardrails
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="xs">
                    Assessment: 96%
                  </Badge>
                  <Button
                    variant="outline"
                    size="xs"
                    className="border-border-hairline"
                  >
                    Review
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 transition-colors hover:bg-surface-highlight">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-primary">
                      Samantha Wright
                    </span>
                    <Badge variant="outline" size="xs">
                      9 yrs exp
                    </Badge>
                  </div>
                  <span className="text-2xs text-text-muted">
                    Former VP Automation at UiPath • Agentic RPA & Enterprise
                    SAP Integration
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="xs">
                    Assessment: 94%
                  </Badge>
                  <Button
                    variant="outline"
                    size="xs"
                    className="border-border-hairline"
                  >
                    Review
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Risk & Health */}
        <div className="space-y-4">
          <Card raised className="border-border-hairline">
            <CardHeader className="border-b border-border-hairline pb-3">
              <CardTitle className="text-sm font-semibold">
                Escrow & Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Total Escrow Vault</span>
                <span className="font-mono text-xs text-text-primary">
                  $284,500.00
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Open Disputes</span>
                <Badge
                  variant="outline"
                  size="xs"
                  className="border-semantic-success/40 text-semantic-success"
                >
                  0 Active
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">
                  Rate Limit Triggers (24h)
                </span>
                <span className="font-mono text-xs text-text-muted">
                  3 hits
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ContentContainer>
  );
}
