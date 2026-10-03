import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { RequestIntroDialog } from "@/components/marketing/request-intro-dialog";
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowLeft,
  Briefcase,
  Layers,
  Award,
} from "lucide-react";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Find strategist by name or id
  const profiles = await db.strategistProfile.findMany({
    include: { user: true },
  });

  const profile = profiles.find((p) => {
    const s = p.user?.name
      ? p.user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : p.id;
    return s === slug || p.id === slug;
  });

  if (!profile) return { title: "Strategist Not Found | Loopwise" };

  return {
    title: `${profile.user?.name} - Fractional Head of AI | Loopwise`,
    description: profile.headline || "Vetted enterprise automation strategist.",
    openGraph: {
      title: `${profile.user?.name} | Fractional Head of AI & Automation`,
      description: profile.headline,
      type: "profile",
    },
  };
}

export default async function PublicStrategistProfilePage({ params }) {
  const { slug } = await params;

  const profiles = await db.strategistProfile.findMany({
    include: {
      user: {
        select: { name: true, image: true, email: true },
      },
      skills: {
        include: { skill: true },
      },
      specializations: {
        include: { specialization: true },
      },
      caseStudies: true,
      reviews: {
        include: {
          reviewer: { select: { name: true } },
        },
      },
      availabilitySlots: true,
    },
  });

  const profile = profiles.find((p) => {
    const s = p.user?.name
      ? p.user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : p.id;
    return s === slug || p.id === slug;
  });

  if (!profile) {
    notFound();
  }

  const strategist = {
    id: profile.id,
    slug,
    name: profile.user?.name || "AI Strategist",
    headline: profile.headline || "Fractional Head of AI & Automation",
    bio: profile.bio || "",
    location: profile.location || "Remote",
    timezone: profile.timezone || "America/Los_Angeles",
    yearsExperience: profile.yearsExperience || 10,
    hourlyRateMin: profile.hourlyRateMin || 220,
    hourlyRateMax: profile.hourlyRateMax || 300,
    retainerMin: profile.retainerMin || 12000,
    retainerMax: profile.retainerMax || 24000,
    availabilityHoursPerWeek: profile.availabilityHoursPerWeek || 20,
    ratingAvg: profile.ratingAvg || 4.9,
    ratingCount: profile.ratingCount || 12,
  };

  // JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Person", "Service"],
    name: strategist.name,
    jobTitle: strategist.headline,
    description: strategist.bio,
    address: {
      "@type": "PostalAddress",
      addressLocality: strategist.location,
    },
    provider: {
      "@type": "Organization",
      name: "Loopwise",
      url: "https://loopwise.internal",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: strategist.ratingAvg,
      reviewCount: strategist.ratingCount,
    },
  };

  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      {/* Structured Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative mx-auto max-w-5xl space-y-8 px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/strategists"
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-2 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Strategist Directory</span>
        </Link>

        {/* Profile Hero Card */}
        <div className="warm-card shadow-soft space-y-6 p-6 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 border-b border-line pb-6 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-tile-violet font-display text-2xl font-bold text-white shadow-sm">
                {strategist.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                    {strategist.name}
                  </h1>
                  <span className="flex items-center gap-1 rounded-full border border-[#A9DDB8] bg-[#EAF7EE] px-2.5 py-0.5 text-2xs font-bold text-forest">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Vetted CAIO</span>
                  </span>
                </div>

                <p className="mt-1 text-xs font-medium text-ink-2 sm:text-sm">
                  {strategist.headline}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-2xs font-medium text-ink-3">
                  <span className="flex items-center gap-1 text-ink-2">
                    <MapPin className="h-3 w-3" />
                    <span>{strategist.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-forest">
                    <Clock className="h-3 w-3" />
                    <span>
                      {strategist.availabilityHoursPerWeek} hrs/week available
                    </span>
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-ink">
                    <Star className="h-3 w-3 fill-brand-accent text-brand-accent" />
                    <span className="font-bold">{strategist.ratingAvg}</span>
                    <span className="text-ink-3">
                      ({strategist.ratingCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA action */}
            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center md:w-auto">
              <RequestIntroDialog strategist={strategist} />
            </div>
          </div>

          {/* Rates Strip */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-canvas-2 p-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-semibold uppercase text-ink-3">
                Hourly Advisory
              </p>
              <p className="mt-1 font-mono text-base font-bold text-ink">
                ${strategist.hourlyRateMin}–${strategist.hourlyRateMax}/hr
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-ink-3">
                Monthly Retainer
              </p>
              <p className="mt-1 font-mono text-base font-bold text-brand-accent">
                ${(strategist.retainerMin / 1000).toFixed(0)}k–$
                {(strategist.retainerMax / 1000).toFixed(0)}k/mo
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-ink-3">
                Experience
              </p>
              <p className="mt-1 font-mono text-base font-bold text-ink">
                {strategist.yearsExperience} Years
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-ink-3">
                Escrow Terms
              </p>
              <p className="mt-1 pt-0.5 text-xs font-bold text-forest">
                Milestone Backed
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Executive Background
            </h2>
            <p className="text-sm leading-relaxed text-ink-2">
              {strategist.bio}
            </p>
          </div>
        </div>

        {/* Verified Technical Skills & Specializations */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="warm-card shadow-soft space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-brand-accent" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                Specializations
              </h3>
            </div>
            <div className="space-y-2">
              {profile.specializations.map((sp) => (
                <div
                  key={sp.specialization.slug}
                  className="rounded-lg border border-line bg-canvas-2 p-3"
                >
                  <p className="text-xs font-bold text-ink">
                    {sp.specialization.name}
                  </p>
                  <p className="mt-0.5 text-2xs text-ink-2">
                    {sp.specialization.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="warm-card shadow-soft space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-accent" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                Verified Skills & Harnesses
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((sk) => (
                <span
                  key={sk.skill.slug}
                  className="rounded-full border border-line bg-canvas-2 px-3 py-1 text-xs font-medium text-ink-2"
                >
                  {sk.skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Case Studies */}
        {profile.caseStudies.length > 0 && (
          <div className="warm-card shadow-soft space-y-6 p-6 sm:p-8">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-brand-accent" />
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                Verified Deployment Case Studies
              </h3>
            </div>

            <div className="space-y-4">
              {profile.caseStudies.map((cs) => (
                <div
                  key={cs.id}
                  className="space-y-3 rounded-xl border border-line bg-canvas-2 p-5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-ink">
                      {cs.title}
                    </h4>
                    {cs.toolsUsed && (
                      <span className="font-mono text-2xs text-ink-3">
                        {cs.toolsUsed}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-ink-2">
                    {cs.summary}
                  </p>
                  {cs.metricsOutcome && (
                    <div className="flex items-center gap-2 border-t border-line pt-2 text-2xs font-semibold text-forest">
                      <span>Outcome:</span>
                      <span className="font-mono">{cs.metricsOutcome}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
