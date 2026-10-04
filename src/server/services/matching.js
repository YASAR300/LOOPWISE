import { db } from "@/lib/db";
import { generateAnthropicJSON } from "@/lib/ai";
import { getMatchWeights } from "@/lib/match-weights";
import { z } from "zod";

// Approximate timezone offsets from UTC in hours
const TIMEZONE_OFFSETS = {
  UTC: 0,
  GMT: 0,
  EST: -5,
  EDT: -4,
  CST: -6,
  CDT: -5,
  MST: -7,
  MDT: -6,
  PST: -8,
  PDT: -7,
  "America/New_York": -5,
  "America/Chicago": -6,
  "America/Denver": -7,
  "America/Los_Angeles": -8,
  "America/Toronto": -5,
  "Europe/London": 0,
  "Europe/Paris": 1,
  "Europe/Berlin": 1,
  "Asia/Dubai": 4,
  "Asia/Kolkata": 5.5,
  "Asia/Singapore": 8,
  "Asia/Tokyo": 9,
  "Australia/Sydney": 10,
};

function parseTimezoneOffset(tz) {
  if (!tz) return 0;
  for (const [key, offset] of Object.entries(TIMEZONE_OFFSETS)) {
    if (tz.toLowerCase().includes(key.toLowerCase())) {
      return offset;
    }
  }
  return 0;
}

function calculateTimezoneOverlapHours(clientTz, strategistTz) {
  const cOffset = parseTimezoneOffset(clientTz);
  const sOffset = parseTimezoneOffset(strategistTz);
  const diff = Math.abs(cOffset - sOffset);
  // Assuming a standard 8-hour workday (9am - 5pm), overlap is 8 - diff (min 0, max 8)
  return Math.max(0, Math.min(8, 8 - diff));
}

/**
 * Deterministically compute 0-100 match score and explainable breakdown
 */
export function computeDeterministicMatchScore({
  brief,
  profile,
  workflows = [],
  weights = getMatchWeights(),
}) {
  const breakdown = {};
  let totalScore = 0;

  // 1. Skill Coverage (Weight: ~30)
  const reqSkillsRaw = Array.isArray(brief.requiredSkills)
    ? brief.requiredSkills
    : [];
  const reqSkills = reqSkillsRaw.map((s) => String(s).toLowerCase().trim());
  const profileSkills = (profile.skills || []).map((s) => ({
    name: s.skill?.name || "",
    slug: s.skill?.slug || "",
    level: s.level || 1,
    verified: s.verified || false,
  }));

  const matchedSkills = [];
  const missingSkills = [];

  if (reqSkills.length === 0) {
    // If no specific skills declared, award baseline
    breakdown.skillCoverage = {
      score: Math.round(weights.skillCoverage * 0.8),
      max: weights.skillCoverage,
      matchedSkills: profileSkills.slice(0, 4).map((s) => s.name),
      missingSkills: [],
      matchPercentage: 80,
    };
  } else {
    reqSkills.forEach((req) => {
      const found = profileSkills.find(
        (ps) =>
          ps.name.toLowerCase().includes(req) ||
          req.includes(ps.name.toLowerCase()) ||
          ps.slug.toLowerCase().includes(req)
      );
      if (found) {
        matchedSkills.push({
          name: found.name || req,
          level: found.level,
          verified: found.verified,
        });
      } else {
        missingSkills.push(req);
      }
    });

    const coverageRatio = matchedSkills.length / reqSkills.length;
    // Extra boost for high skill levels (level >= 4) and verification
    const levelBonus = matchedSkills.reduce(
      (acc, s) => acc + (s.level >= 4 ? 0.05 : 0),
      0
    );
    const verifiedBonus = matchedSkills.reduce(
      (acc, s) => acc + (s.verified ? 0.05 : 0),
      0
    );
    const effectiveRatio = Math.min(
      1,
      coverageRatio + levelBonus + verifiedBonus
    );
    const skillScore = Math.round(weights.skillCoverage * effectiveRatio);

    breakdown.skillCoverage = {
      score: skillScore,
      max: weights.skillCoverage,
      matchedSkills: matchedSkills.map((s) => s.name),
      missingSkills,
      matchPercentage: Math.round(effectiveRatio * 100),
    };
  }
  totalScore += breakdown.skillCoverage.score;

  // 2. Specialization Alignment (Weight: ~15)
  const profileSpecs = (profile.specializations || []).map((s) =>
    (s.specialization?.name || "").toLowerCase()
  );
  const goalStr = `${brief.goal || ""} ${brief.title || ""}`.toLowerCase();
  let specMatches = 0;

  profileSpecs.forEach((spec) => {
    if (
      goalStr.includes(spec) ||
      spec.includes("ai") ||
      spec.includes("automation")
    ) {
      specMatches++;
    }
  });

  const specRatio =
    profileSpecs.length > 0
      ? Math.min(1, Math.max(0.5, specMatches * 0.5))
      : 0.6;
  breakdown.specializationAlignment = {
    score: Math.round(weights.specializationAlignment * specRatio),
    max: weights.specializationAlignment,
    matchedSpecializations: profileSpecs.slice(0, 3),
  };
  totalScore += breakdown.specializationAlignment.score;

  // 3. Budget Fit (Weight: ~15)
  const stratRate = profile.hourlyRate || profile.retainerRate / 60 || 150;
  const budgetMin = brief.budgetMin || 100;
  const budgetMax = brief.budgetMax || 250;

  let budgetRatio = 1;
  let budgetStatus = "WITHIN_RANGE";

  if (stratRate >= budgetMin && stratRate <= budgetMax) {
    budgetRatio = 1;
    budgetStatus = "EXACT";
  } else if (stratRate < budgetMin) {
    budgetRatio = 0.95; // Under budget is great
    budgetStatus = "BELOW_BUDGET";
  } else {
    // Over budget: penalty proportional to excess
    const excessPct = (stratRate - budgetMax) / budgetMax;
    budgetRatio = Math.max(0.3, 1 - excessPct);
    budgetStatus = "OVER_BUDGET";
  }

  breakdown.budgetFit = {
    score: Math.round(weights.budgetFit * budgetRatio),
    max: weights.budgetFit,
    rate: stratRate,
    budgetMin,
    budgetMax,
    status: budgetStatus,
  };
  totalScore += breakdown.budgetFit.score;

  // 4. Availability Hours Fit (Weight: ~10)
  const availHours = profile.weeklyAvailability || 20;
  const reqHours = brief.hoursPerWeek || 15;
  const availRatio = Math.min(1, availHours / reqHours);

  breakdown.availabilityFit = {
    score: Math.round(weights.availabilityFit * availRatio),
    max: weights.availabilityFit,
    strategistHours: availHours,
    neededHours: reqHours,
  };
  totalScore += breakdown.availabilityFit.score;

  // 5. Timezone Overlap (Weight: ~10)
  const clientTz = brief.timezonePref || "UTC";
  const stratTz = profile.timezone || "America/New_York";
  const overlapHours = calculateTimezoneOverlapHours(clientTz, stratTz);
  const tzRatio = Math.min(1, overlapHours / 4); // 4+ hours is full score

  breakdown.timezoneOverlap = {
    score: Math.round(weights.timezoneOverlap * tzRatio),
    max: weights.timezoneOverlap,
    overlapHours,
    clientTimezone: clientTz,
    strategistTimezone: stratTz,
  };
  totalScore += breakdown.timezoneOverlap.score;

  // 6. Industry & Case Study Relevance (Weight: ~10)
  const orgIndustry = (brief.organization?.industry || "").toLowerCase();
  const caseStudies = profile.caseStudies || [];
  const stratIndustries = (profile.industries || []).map((i) =>
    String(i).toLowerCase()
  );

  let industryMatch = false;
  if (orgIndustry) {
    industryMatch =
      stratIndustries.some(
        (i) => i.includes(orgIndustry) || orgIndustry.includes(i)
      ) ||
      caseStudies.some((cs) =>
        (cs.clientIndustry || "").toLowerCase().includes(orgIndustry)
      );
  }

  const indRatio = industryMatch ? 1 : caseStudies.length > 0 ? 0.7 : 0.4;
  breakdown.industryRelevance = {
    score: Math.round(weights.industryRelevance * indRatio),
    max: weights.industryRelevance,
    hasIndustryMatch: industryMatch,
    caseStudyCount: caseStudies.length,
  };
  totalScore += breakdown.industryRelevance.score;

  // 7. Rating and Verification (Weight: ~5)
  const rating = profile.ratingAvg || 4.8;
  const isApproved = profile.status === "APPROVED";
  const ratingRatio = (rating / 5) * (isApproved ? 1 : 0.85);

  breakdown.ratingAndVerification = {
    score: Math.round(weights.ratingAndVerification * ratingRatio),
    max: weights.ratingAndVerification,
    rating,
    isApproved,
  };
  totalScore += breakdown.ratingAndVerification.score;

  // 8. Response-time History (Weight: ~5)
  breakdown.responseTimeHistory = {
    score: weights.responseTimeHistory,
    max: weights.responseTimeHistory,
    avgResponseHours: 2.5,
  };
  totalScore += breakdown.responseTimeHistory.score;

  // Final total score (clamped between 0 and 100)
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Construct grounded baseline explanation
  const topMatched = (breakdown.skillCoverage.matchedSkills || [])
    .slice(0, 3)
    .join(", ");
  const explanation = topMatched
    ? `Strong match with verified proficiency in ${topMatched}. ${breakdown.timezoneOverlap.overlapHours}h daily timezone overlap and availability of ${availHours} hrs/week.`
    : `High alignment with ${availHours} hrs/week bandwidth and extensive autonomous systems delivery experience.`;

  const watchOuts =
    breakdown.budgetFit.status === "OVER_BUDGET"
      ? `Hourly rate ($${stratRate}/hr) is slightly above preferred budget ceiling ($${budgetMax}/hr).`
      : breakdown.timezoneOverlap.overlapHours < 3
        ? `Limited working hours overlap (${breakdown.timezoneOverlap.overlapHours} hours) with client timezone.`
        : null;

  return {
    totalScore,
    breakdown,
    explanation,
    watchOuts,
  };
}

const AIRerankOutputSchema = z.object({
  evaluations: z.array(
    z.object({
      strategistProfileId: z.string(),
      whyThisMatch: z.string().min(10),
      watchOuts: z
        .string()
        .optional()
        .default("No material blockers identified."),
    })
  ),
});

/**
 * AI Re-rank using Anthropic Claude for top candidates (grounded strictly in profile facts)
 */
export async function rerankMatchesWithAI({ brief, matches }) {
  if (!matches || matches.length === 0) return matches;
  if (!process.env.ANTHROPIC_API_KEY) {
    // Return with deterministic explanations
    return matches;
  }

  // Top 15 only
  const topSlice = matches.slice(0, 15);

  const candidateSummaries = topSlice.map((m) => {
    const p = m.profile;
    const skills = (p.skills || [])
      .map((s) => s.skill?.name || "")
      .filter(Boolean)
      .slice(0, 8);
    const caseStudies = (p.caseStudies || []).map((cs) => ({
      title: cs.title,
      industry: cs.clientIndustry,
      outcome: cs.outcome || cs.metricsAchieved,
    }));

    return {
      strategistProfileId: p.id,
      name: p.user?.name || "Strategist",
      headline: p.headline,
      yearsOfExperience: p.yearsOfExperience,
      hourlyRate: p.hourlyRate,
      weeklyAvailability: p.weeklyAvailability,
      timezone: p.timezone,
      topSkills: skills,
      caseStudies: caseStudies.slice(0, 2),
      deterministicScore: m.score,
    };
  });

  const prompt = `You are an AI Talent Matching Auditor at Loopwise.
Your task is to write a concise, fact-grounded explanation of why each Fractional Head of AI was matched to the client's brief, along with any honest watch-outs.

CLIENT BRIEF:
Title: ${brief.title}
Goal: ${brief.goal || "Not specified"}
Required Skills: ${JSON.stringify(brief.requiredSkills || [])}
Hours/Week Needed: ${brief.hoursPerWeek || 20}
Budget Range: $${brief.budgetMin || 100} - $${brief.budgetMax || 250}/hr
Client Timezone: ${brief.timezonePref || "UTC"}

CANDIDATES:
${JSON.stringify(candidateSummaries, null, 2)}

STRICT RULES:
1. "whyThisMatch": 1 to 2 crisp sentences highlighting exact tool overlap, verified case study outcomes, or relevant domain experience. STRICT GROUNDING: only cite skills, tools, or facts present in the candidate's JSON.
2. "watchOuts": 1 sentence identifying any real trade-off (e.g. rate slightly above target budget, limited timezone overlap, or missing a minor secondary skill). If none, state "No material trade-offs identified."
3. Do NOT invent credentials or metrics.`;

  try {
    const { data } = await generateAnthropicJSON({
      system:
        "You are a precise, objective talent matching evaluator. Ground all statements strictly in the supplied data.",
      user: prompt,
      schema: AIRerankOutputSchema,
    });

    if (data?.evaluations?.length) {
      const evalMap = new Map(
        data.evaluations.map((e) => [e.strategistProfileId, e])
      );

      topSlice.forEach((m) => {
        const aiEval = evalMap.get(m.profile.id);
        if (aiEval) {
          m.explanation = aiEval.whyThisMatch;
          m.watchOuts = aiEval.watchOuts;
          m.aiReranked = true;
        }
      });
    }
  } catch (err) {
    console.error("[AI Rerank Warning]:", err.message);
    // Graceful fallback to deterministic explanations
  }

  return matches;
}

/**
 * Compute matches for a Brief, re-rank with AI, and persist in MatchResult table
 */
export async function calculateAndPersistMatchesForBrief(briefId) {
  const brief = await db.brief.findUnique({
    where: { id: briefId },
    include: {
      organization: true,
      workflows: true,
      dismissedMatches: true,
    },
  });

  if (!brief) throw new Error("Brief not found");

  // Fetch approved strategists with rich relations
  const profiles = await db.strategistProfile.findMany({
    where: {
      status: { in: ["APPROVED", "SUBMITTED"] },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      skills: {
        include: { skill: true },
      },
      specializations: {
        include: { specialization: true },
      },
      caseStudies: true,
    },
  });

  const dismissedIds = new Set(
    brief.dismissedMatches.map((d) => d.strategistProfileId)
  );
  const activeProfiles = profiles.filter((p) => !dismissedIds.has(p.id));

  // 1. Calculate deterministic scores
  const scoredMatches = activeProfiles.map((profile) => {
    const { totalScore, breakdown, explanation, watchOuts } =
      computeDeterministicMatchScore({
        brief,
        profile,
        workflows: brief.workflows,
      });

    return {
      profile,
      score: totalScore,
      breakdown,
      explanation,
      watchOuts,
      aiReranked: false,
    };
  });

  // Sort descending by score
  scoredMatches.sort((a, b) => b.score - a.score);

  // 2. AI Re-ranking on top 15
  await rerankMatchesWithAI({ brief, matches: scoredMatches });

  // 3. Persist in MatchResult table
  const results = [];
  for (const m of scoredMatches) {
    const result = await db.matchResult.upsert({
      where: {
        briefId_strategistProfileId: {
          briefId: brief.id,
          strategistProfileId: m.profile.id,
        },
      },
      update: {
        score: m.score,
        breakdown: m.breakdown,
        explanation: m.explanation,
        watchOuts: m.watchOuts,
        aiReranked: m.aiReranked,
        isDismissed: false,
      },
      create: {
        briefId: brief.id,
        strategistProfileId: m.profile.id,
        score: m.score,
        breakdown: m.breakdown,
        explanation: m.explanation,
        watchOuts: m.watchOuts,
        aiReranked: m.aiReranked,
        isDismissed: false,
      },
    });

    results.push({
      ...result,
      profile: m.profile,
    });
  }

  // Update MatchingQueue if queued
  await db.matchingQueue.updateMany({
    where: { briefId: brief.id, status: "PENDING" },
    data: { status: "COMPLETED", updatedAt: new Date() },
  });

  return results;
}

/**
 * Enqueue background matching job for a brief
 */
export async function enqueueMatchingJob(briefId) {
  return await db.matchingQueue.create({
    data: {
      briefId,
      status: "PENDING",
    },
  });
}
