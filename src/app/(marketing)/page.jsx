import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  GitBranch,
  Bot,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Award,
  Zap,
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
import { Kbd } from "@/components/ui/kbd";

export default function MarketingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative border-b border-border-hairline pb-24 pt-20 md:pb-36 md:pt-32">
        <div className="radial-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-25" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-hairline bg-surface-raised px-3 py-1 shadow-inner-highlight">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-medium text-text-primary">
              The Enterprise Automation Strategist Marketplace
            </span>
            <Badge variant="accent" size="xs">
              Vetted Bench
            </Badge>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-6xl">
            Hire a Fractional <span className="text-accent">Head of AI</span> &
            Automation
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
            Enterprise automation leaders who map internal workflows into scored
            execution plans, deploy autonomous agents, and prove measurable ROI
            under NIST AI RMF governance.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href="/login" className="w-full gap-2 sm:w-auto">
                <span>Browse Strategist Bench</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/dev/components" className="w-full gap-2 sm:w-auto">
                <span>Explore Design System</span>
                <Kbd>G then C</Kbd>
              </Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-semantic-success" />
              <span>Top 3% Vetted CAIOs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-semantic-success" />
              <span>NIST AI RMF Governance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-semantic-success" />
              <span>Escrow Protected Retainers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-semantic-success" />
              <span>Real-Time ROI Proof</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Grid & Positioning */}
      <section
        id="features"
        className="bg-surface-raised/30 border-b border-border-hairline py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="outline" size="sm" className="mb-3">
              Beyond Generalist Marketplaces
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Not Just a Directory. An Operating System for Autonomous AI.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary sm:text-sm">
              Traditional executive networks stop at introductions. Loopwise
              pairs elite fractional leadership with deep workflow tooling,
              continuous agent governance, and telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card raised className="group relative">
              <CardHeader>
                <div className="bg-accent/10 border-accent/20 mb-3 flex h-9 w-9 items-center justify-center rounded-md border text-accent">
                  <GitBranch className="h-5 w-5" />
                </div>
                <CardTitle>Workflow Mapper</CardTitle>
                <CardDescription>
                  Turns complex company SOPs and team interviews into a
                  structured, scored automation blueprint with clear feasibility
                  rankings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span>Interactive node canvas powered by React Flow</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                  <span>AI-scored risk and cost-benefit ratios</span>
                </div>
              </CardContent>
            </Card>

            <Card raised className="group relative">
              <CardHeader>
                <div className="bg-semantic-info/10 border-semantic-info/20 mb-3 flex h-9 w-9 items-center justify-center rounded-md border text-semantic-info">
                  <Bot className="h-5 w-5" />
                </div>
                <CardTitle>Agent Registry</CardTitle>
                <CardDescription>
                  Every deployed autonomous agent is registered with explicit
                  owners, guardrails, runbooks, health metrics, and incident
                  recovery.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-semantic-info" />
                  <span>Deterministic safety guardrails & kill-switches</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-semantic-info" />
                  <span>Automated audit logging & execution telemetry</span>
                </div>
              </CardContent>
            </Card>

            <Card raised className="group relative">
              <CardHeader>
                <div className="bg-semantic-success/10 border-semantic-success/20 mb-3 flex h-9 w-9 items-center justify-center rounded-md border text-semantic-success">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <CardTitle>ROI Proof Engine</CardTitle>
                <CardDescription>
                  Real-time visibility into cumulative hours saved, direct
                  expense reduction, error rate drops, and departmental
                  adoption.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-semantic-success" />
                  <span>Tied directly to each milestone and retainer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-semantic-success" />
                  <span>Executive board-ready PDF & CSV export</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Governance & Trust Section */}
      <section
        id="governance"
        className="border-b border-border-hairline py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border border-border-hairline bg-surface-card p-8 shadow-card shadow-inner-highlight md:p-12">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
              <div>
                <Badge variant="success" size="sm" className="mb-3">
                  Enterprise Compliance
                </Badge>
                <h3 className="text-2xl font-bold tracking-tight text-text-primary">
                  Built-in NIST AI RMF & EU AI Act Governance Pack
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-text-secondary sm:text-sm">
                  Avoid catastrophic hallucination risk, data exfiltration, or
                  non-compliance penalties. Every agent deployed through
                  Loopwise includes verifiable guardrail checklists, audit logs,
                  and compliance scorecards.
                </p>
                <div className="mt-6 space-y-3 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-semantic-success" />
                    <span>
                      NIST AI Risk Management Framework 1.0 mapped controls
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-semantic-success" />
                    <span>EU AI Act High-Risk classification guidelines</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-semantic-success" />
                    <span>SOC 2 Type II audit-trail compatible logging</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border-hairline bg-surface-raised p-5 font-mono text-2xs">
                <div className="flex items-center justify-between border-b border-border-hairline pb-2 text-text-muted">
                  <span className="flex items-center gap-1.5 text-text-primary">
                    <Terminal className="h-3.5 w-3.5 text-accent" />
                    <span>governance-audit.json</span>
                  </span>
                  <span className="text-semantic-success">
                    STATUS: COMPLIANT
                  </span>
                </div>
                <div className="space-y-1 text-text-secondary">
                  <p>
                    <span className="text-accent">&quot;agent_id&quot;</span>:{" "}
                    <span className="text-semantic-warning">
                      &quot;agt_lead_enrich_09&quot;
                    </span>
                    ,
                  </p>
                  <p>
                    <span className="text-accent">
                      &quot;nist_profile&quot;
                    </span>
                    :{" "}
                    <span className="text-text-primary">
                      &quot;GOVERN-1.2, MAP-2.1&quot;
                    </span>
                    ,
                  </p>
                  <p>
                    <span className="text-accent">
                      &quot;human_in_loop&quot;
                    </span>
                    : <span className="text-semantic-success">true</span>,
                  </p>
                  <p>
                    <span className="text-accent">
                      &quot;max_tokens_budget&quot;
                    </span>
                    : <span className="text-semantic-info">150000</span>,
                  </p>
                  <p>
                    <span className="text-accent">
                      &quot;last_incident&quot;
                    </span>
                    : <span className="text-text-muted">null</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            Ready to deploy enterprise-grade autonomous agents?
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary sm:text-sm">
            Match with vetted Fractional Heads of AI in under 3 days. Full
            escrow protection, guaranteed replacement, and complete delivery
            visibility.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button variant="primary" size="lg" asChild>
              <Link href="/login" className="gap-2">
                <span>Start Free Matching</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/app">
                <span>Open Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
