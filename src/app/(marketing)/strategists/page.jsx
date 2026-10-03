import React from "react";
import { db } from "@/lib/db";
import { StrategistDirectoryView } from "@/components/marketing/strategist-directory-view";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Vetted Fractional Heads of AI Directory | Loopwise",
  description:
    "Browse our pre-vetted bench of Fractional Heads of AI & Automation. Filter by technical stack, specialization, and rate with escrow protection.",
};

export default async function StrategistsDirectoryPage({ searchParams }) {
  const params = await searchParams;
  const q = params.q || "";
  const spec = params.spec || "";
  const skill = params.skill || "";
  const maxRate = params.maxRate ? Number(params.maxRate) : null;
  const minRating = params.minRating ? Number(params.minRating) : null;
  const sort = params.sort || "rating";

  // Build Prisma where query
  const where = {
    status: "APPROVED",
  };

  if (q) {
    where.OR = [
      { headline: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (spec) {
    where.specializations = {
      some: {
        specialization: {
          slug: spec,
        },
      },
    };
  }

  if (skill) {
    where.skills = {
      some: {
        skill: {
          slug: skill,
        },
      },
    };
  }

  if (maxRate) {
    where.hourlyRateMin = {
      lte: maxRate,
    };
  }

  if (minRating) {
    where.ratingAvg = {
      gte: minRating,
    };
  }

  // Sorting
  let orderBy = [{ ratingAvg: "desc" }, { ratingCount: "desc" }];
  if (sort === "rate_asc") {
    orderBy = [{ hourlyRateMin: "asc" }];
  } else if (sort === "rate_desc") {
    orderBy = [{ hourlyRateMin: "desc" }];
  } else if (sort === "experience") {
    orderBy = [{ yearsExperience: "desc" }];
  }

  const [specializations, skillsList, strategistsRaw, totalApprovedCount] =
    await Promise.all([
      db.specialization.findMany({
        select: { name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      db.skill.findMany({
        select: { name: true, slug: true, category: true },
        take: 30,
        orderBy: { name: "asc" },
      }),
      db.strategistProfile.findMany({
        where,
        orderBy,
        take: 40,
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
        },
      }),
      db.strategistProfile.count({ where: { status: "APPROVED" } }),
    ]);

  const strategists = strategistsRaw.map((p) => {
    const slug = p.user?.name
      ? p.user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : p.id;
    return {
      id: p.id,
      slug,
      name: p.user?.name || "AI Strategist",
      headline: p.headline || "Fractional Head of AI & Automation",
      bio: p.bio || "",
      location: p.location || "Remote",
      timezone: p.timezone || "UTC",
      yearsExperience: p.yearsExperience || 8,
      hourlyRateMin: p.hourlyRateMin || 200,
      hourlyRateMax: p.hourlyRateMax || 300,
      retainerMin: p.retainerMin || 10000,
      availabilityHoursPerWeek: p.availabilityHoursPerWeek || 20,
      ratingAvg: p.ratingAvg || 4.9,
      ratingCount: p.ratingCount || 10,
      skills: p.skills.map((s) => s.skill.name),
      specializations: p.specializations.map((sp) => sp.specialization.name),
    };
  });

  return (
    <div className="relative overflow-hidden bg-canvas py-16 sm:py-24">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-forest" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              TOP 3% TECHNICAL ACCEPTANCE
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Browse verified Heads of AI & Automation
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
            Every strategist has defended their agent architecture before our
            review committee. Escrow milestone protection and guaranteed
            replacement on every engagement.
          </p>
        </div>

        {/* Directory View */}
        <StrategistDirectoryView
          strategists={strategists}
          specializations={specializations}
          skillsList={skillsList}
          initialFilters={{ q, spec, skill, maxRate, minRating, sort }}
          totalCount={totalApprovedCount}
        />
      </div>
    </div>
  );
}
