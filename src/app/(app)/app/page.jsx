import Link from "next/link";
import {
  TrendingUp,
  Bot,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  Plus,
  GitBranch,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { PageHeader, ContentContainer } from "@/components/layout/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function AppDashboardPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Enterprise Automation Hub"
        description="Monitor deployed autonomous agents, fractional strategist engagement, and verified ROI velocity."
        badge={
          <Badge variant="success" size="sm" dot>
            Production Active
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href="/dev/components">
                <span>View Design System</span>
              </Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/app/workflows" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span>Map New Workflow</span>
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card raised>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-2xs text-text-muted">
              <span className="font-semibold uppercase tracking-wider">
                Active Retainer
              </span>
              <Badge variant="accent" size="xs">
                CAIO
              </Badge>
            </div>
            <CardTitle className="mt-1 text-xl font-bold">
              $14,500
              <span className="text-xs font-normal text-text-muted">/mo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-text-secondary">
              Strategist:{" "}
              <span className="font-medium text-text-primary">
                Marcus Vance
              </span>{" "}
              (2 days/wk)
            </p>
          </CardContent>
        </Card>

        <Card raised>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-2xs text-text-muted">
              <span className="font-semibold uppercase tracking-wider">
                Deployed Agents
              </span>
              <Bot className="h-3.5 w-3.5 text-accent" />
            </div>
            <CardTitle className="mt-1 text-xl font-bold">
              4 Autonomous
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="flex items-center gap-1 text-xs font-medium text-semantic-success">
              <span>● 100% operational uptime</span>
            </p>
          </CardContent>
        </Card>

        <Card raised>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-2xs text-text-muted">
              <span className="font-semibold uppercase tracking-wider">
                Monthly Time Saved
              </span>
              <Clock className="h-3.5 w-3.5 text-semantic-info" />
            </div>
            <CardTitle className="mt-1 text-xl font-bold">1,340 hrs</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-text-secondary">
              Equivalent to{" "}
              <span className="font-medium text-text-primary">8.4 FTEs</span>{" "}
              automated
            </p>
          </CardContent>
        </Card>

        <Card raised>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between text-2xs text-text-muted">
              <span className="font-semibold uppercase tracking-wider">
                Governance Score
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-semantic-success" />
            </div>
            <CardTitle className="mt-1 text-xl font-bold">98.4%</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-text-secondary">
              NIST AI RMF Profile:{" "}
              <span className="font-medium text-semantic-success">Passed</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Active Agents and Engagement Roadmap */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Active Agent Workflows
            </h2>
            <Link
              href="/dev/components"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <span>Design System Preview</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Card raised className="divide-y divide-border-hairline">
            <div className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-primary">
                    Inbound RFP Extractor & Matcher
                  </span>
                  <Badge variant="success" size="xs">
                    Healthy
                  </Badge>
                </div>
                <p className="text-2xs text-text-secondary">
                  Maps inbound enterprise RFP PDF documents into procurement
                  risk models.
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-medium text-text-primary">
                  420 hrs/mo
                </div>
                <div className="text-2xs text-text-muted">$32.4k saved</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-primary">
                    SOC 2 Continuous Evidence Collector
                  </span>
                  <Badge variant="success" size="xs">
                    Healthy
                  </Badge>
                </div>
                <p className="text-2xs text-text-secondary">
                  Pulls security logs from AWS & GitHub, validates access
                  control compliance.
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-medium text-text-primary">
                  280 hrs/mo
                </div>
                <div className="text-2xs text-text-muted">$24.0k saved</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-primary">
                    Customer Escalation Routing Agent
                  </span>
                  <Badge variant="accent" size="xs">
                    Autonomous
                  </Badge>
                </div>
                <p className="text-2xs text-text-secondary">
                  Evaluates sentiment and routes P1 tickets with synthesized
                  action summaries.
                </p>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-medium text-text-primary">
                  640 hrs/mo
                </div>
                <div className="text-2xs text-text-muted">$48.2k saved</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Card: Strategist AI Game Plan */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">
            Quarterly AI Game Plan
          </h2>
          <Card raised className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <div className="bg-accent/20 border-accent/40 flex h-7 w-7 items-center justify-center rounded-md border text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-text-primary">
                  Q4 Milestone 2: Agent Autonomy
                </h3>
                <p className="text-2xs text-text-muted">Target: Oct 30, 2026</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-2xs text-text-secondary">
                <span>Phase Progress</span>
                <span className="font-mono text-accent">75%</span>
              </div>
              <ProgressBar value={75} color="accent" />
            </div>

            <div className="space-y-2 border-t border-border-hairline pt-2 text-2xs text-text-secondary">
              <p>✓ SOP Mapping & Feasibility Scoring</p>
              <p>✓ Guardrail validation under NIST AI RMF</p>
              <p className="font-medium text-text-primary">
                → Multi-agent coordination deployment
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ContentContainer>
  );
}
