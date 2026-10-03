import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  ShieldCheck,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const ALIAS_MAP = {
  "customer-support": "domain-agent-workflows",
  support: "domain-agent-workflows",
  revops: "enterprise-workflow-automation",
  finance: "agentic-rpa-legacy-integration",
  devops: "multi-agent-orchestration",
  healthcare: "ai-governance-guardrails",
};

function formatSlugName(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function resolveSpecialization(slug) {
  const targetSlug = ALIAS_MAP[slug.toLowerCase()] || slug.toLowerCase();

  // Try exact slug
  let spec = await db.specialization.findFirst({
    where: { slug: { equals: targetSlug, mode: "insensitive" } },
  });

  // Try contains
  if (!spec) {
    spec = await db.specialization.findFirst({
      where: {
        OR: [
          { slug: { contains: slug.toLowerCase() } },
          { name: { contains: formatSlugName(slug), mode: "insensitive" } },
        ],
      },
    });
  }

  // Fallback to first or synthetic
  if (!spec) {
    spec = (await db.specialization.findFirst()) || {
      name: formatSlugName(slug),
      slug,
      description: `Deploy vetted enterprise AI leaders specialized in ${formatSlugName(slug)} automation.`,
    };
  }

  return spec;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const spec = await resolveSpecialization(slug);

  return {
    title: `Hire a Fractional Head of AI for ${spec.name} | Loopwise`,
    description:
      spec.description ||
      `Deploy vetted Fractional Heads of AI specialized in ${spec.name}. Escrow protected.`,
  };
}

export default async function HireSpecializationPage({ params }) {
  const { slug } = await params;
  const spec = await resolveSpecialization(slug);

  // Fetch strategists matching this specialization, or any top approved strategists
  let profiles = await db.strategistProfile.findMany({
    where: {
      status: "APPROVED",
      specializations: {
        some: {
          specialization: { slug: { equals: spec.slug, mode: "insensitive" } },
        },
      },
    },
    take: 6,
    include: {
      user: { select: { name: true, image: true } },
      skills: { include: { skill: true } },
    },
  });

  if (profiles.length === 0) {
    profiles = await db.strategistProfile.findMany({
      where: { status: "APPROVED" },
      take: 6,
      include: {
        user: { select: { name: true, image: true } },
        skills: { include: { skill: true } },
      },
    });
  }

  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              DOMAIN SPECIALIZATION
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Hire a Fractional Head of AI for {spec.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            {spec.description ||
              `Deploy vetted AI leaders who map ${spec.name} workflows into autonomous agents with verified ROI.`}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/signup?role=client&spec=${spec.slug}`}
              className="btn-primary-orange flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold shadow-sm"
            >
              <span>Match with a {spec.name} Leader</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/strategists?spec=${spec.slug}`}
              className="btn-secondary-outline flex items-center justify-center px-8 py-3.5 text-sm font-semibold"
            >
              <span>Browse {spec.name} talent</span>
            </Link>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="warm-card shadow-soft space-y-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent-soft text-brand-accent">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">
              Tailored SOP Decomposition
            </h3>
            <p className="text-xs leading-relaxed text-ink-2">
              We ingest your department-specific workflows and flag
              high-leverage steps for agent automation in {spec.name}.
            </p>
          </div>

          <div className="warm-card shadow-soft space-y-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas-2 text-forest">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">
              Top 3% Vetted Talent
            </h3>
            <p className="text-xs leading-relaxed text-ink-2">
              Every strategist has shipped multi-agent architectures and
              defended their engineering blueprints before our technical review
              board.
            </p>
          </div>

          <div className="warm-card shadow-soft space-y-3 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-canvas-2 text-ink">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">
              48-Hour Matching Guarantee
            </h3>
            <p className="text-xs leading-relaxed text-ink-2">
              Get matched with 2–3 pre-vetted candidates who fit your exact
              technology stack and timeline requirements.
            </p>
          </div>
        </div>

        {/* Matched Strategists */}
        {profiles.length > 0 && (
          <div className="mb-16 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
                Featured {spec.name} Strategists
              </h2>
              <Link
                href={`/strategists?spec=${spec.slug}`}
                className="flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline"
              >
                <span>View all in directory</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((p) => {
                const sName = p.user?.name || "AI Leader";
                const sSlug = sName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return (
                  <div
                    key={p.id}
                    className="warm-card shadow-2xs flex flex-col justify-between p-6"
                  >
                    <div>
                      <div className="mb-3 flex items-center gap-3">
                        <div className="shadow-2xs flex h-11 w-11 items-center justify-center rounded-full bg-tile-violet font-display text-sm font-bold text-white">
                          {sName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display text-sm font-bold text-ink">
                              {sName}
                            </h3>
                            <ShieldCheck className="h-3.5 w-3.5 text-forest" />
                          </div>
                          <div className="flex items-center gap-1 text-2xs text-ink-3">
                            <MapPin className="h-3 w-3" />
                            <span>{p.location || "Remote"}</span>
                          </div>
                        </div>
                      </div>

                      <p className="mb-2 line-clamp-2 text-xs font-semibold text-ink">
                        {p.headline}
                      </p>

                      <div className="mb-4 flex items-center gap-1 text-2xs text-ink">
                        <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
                        <span className="font-bold">{p.ratingAvg || 4.9}</span>
                        <span className="text-ink-3">
                          ({p.ratingCount || 10} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-line pt-3">
                      <span className="font-mono text-xs font-bold text-ink">
                        ${p.hourlyRateMin}–${p.hourlyRateMax}/hr
                      </span>
                      <Link
                        href={`/strategists/${sSlug}`}
                        className="btn-secondary-outline px-3 py-1.5 text-xs font-semibold"
                      >
                        View profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="shadow-soft rounded-[28px] border border-line bg-canvas-2 p-8 text-center sm:p-12">
          <h2 className="mb-3 font-display text-2xl font-bold text-ink sm:text-3xl">
            Ready to deploy {spec.name} agents?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm text-ink-2 sm:text-base">
            Start with milestone-backed escrow protection and guaranteed talent
            replacement.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/signup?role=client&spec=${spec.slug}`}
              className="btn-primary-orange flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold shadow-sm"
            >
              <span>Hire an AI leader</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="btn-secondary-outline px-8 py-3.5 text-sm font-semibold"
            >
              <span>See pricing models</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
