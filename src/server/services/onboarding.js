// src/server/services/onboarding.js
import { db } from "@/lib/db";

/**
 * Fetch or initialize onboarding progress for the logged-in strategist
 */
export async function getOnboardingState(userId) {
  let profile = await db.strategistProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      skills: {
        include: { skill: true },
      },
      specializations: {
        include: { specialization: true },
      },
      caseStudies: true,
      availabilitySlots: true,
      assessmentAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!profile) {
    profile = await db.strategistProfile.create({
      data: {
        userId,
        status: "DRAFT",
        onboardingStep: 1,
        onboardingData: {},
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        skills: {
          include: { skill: true },
        },
        specializations: {
          include: { specialization: true },
        },
        caseStudies: true,
        availabilitySlots: true,
        assessmentAttempts: true,
      },
    });
  }

  // Also fetch all available specializations and skills for multi-selects
  const allSpecializations = await db.specialization.findMany({
    orderBy: { name: "asc" },
  });

  const allSkills = await db.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return {
    profile,
    allSpecializations,
    allSkills,
  };
}

/**
 * Autosave step data to DB
 */
export async function saveStepProgress({ userId, step, data }) {
  const profile = await db.strategistProfile.findUnique({
    where: { userId },
  });

  if (!profile) throw new Error("Profile not found");

  const existingData = profile.onboardingData || {};
  const mergedData = {
    ...existingData,
    [`step_${step}`]: data,
  };

  // Specific table updates based on step
  const updatePayload = {
    onboardingStep: Math.max(profile.onboardingStep, step),
    onboardingData: mergedData,
  };

  if (step === 1) {
    // Identity
    if (data.headline) updatePayload.headline = data.headline;
    if (data.location) updatePayload.location = data.location;
    if (data.timezone) updatePayload.timezone = data.timezone;
    if (data.website) updatePayload.website = data.website;
    if (data.linkedinUrl) updatePayload.linkedinUrl = data.linkedinUrl;
    if (data.githubUrl) updatePayload.githubUrl = data.githubUrl;
    if (data.phone) updatePayload.phone = data.phone;

    // Update User name/image if provided
    if (data.name || data.image) {
      await db.user.update({
        where: { id: userId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.image ? { image: data.image } : {}),
        },
      });
    }
  } else if (step === 2) {
    // Positioning
    if (data.headline) updatePayload.headline = data.headline;
    if (data.bio) updatePayload.bio = data.bio;
    if (data.yearsExperience)
      updatePayload.yearsExperience = Number(data.yearsExperience);
    if (data.industries) updatePayload.industries = data.industries;
  } else if (step === 3) {
    // Expertise: Specializations & Skills
    if (Array.isArray(data.specializationIds)) {
      // Clear and re-insert
      await db.strategistSpecialization.deleteMany({
        where: { strategistProfileId: profile.id },
      });
      for (const specId of data.specializationIds) {
        await db.strategistSpecialization.create({
          data: {
            strategistProfileId: profile.id,
            specializationId: specId,
          },
        });
      }
    }

    if (Array.isArray(data.skills)) {
      // [{ skillId, level: 1-5 }]
      await db.strategistSkill.deleteMany({
        where: { strategistProfileId: profile.id },
      });
      for (const s of data.skills) {
        await db.strategistSkill.create({
          data: {
            strategistProfileId: profile.id,
            skillId: s.skillId,
            level: Number(s.level) || 3,
            yearsOfExp: s.yearsOfExp ? Number(s.yearsOfExp) : null,
          },
        });
      }
    }

    if (data.certifications) {
      updatePayload.certifications = data.certifications;
    }
  } else if (step === 4) {
    // Case Studies (min 2, max 6)
    if (Array.isArray(data.caseStudies)) {
      await db.caseStudy.deleteMany({
        where: { strategistProfileId: profile.id },
      });
      for (const cs of data.caseStudies) {
        if (!cs.title || !cs.problem || !cs.solution) continue;
        await db.caseStudy.create({
          data: {
            strategistProfileId: profile.id,
            title: cs.title,
            clientType: cs.clientType || cs.clientIndustry,
            clientIndustry: cs.clientIndustry || "Enterprise",
            problem: cs.problem,
            solution: cs.solution,
            approach: cs.approach || cs.solution,
            toolsUsed: cs.toolsUsed || [],
            metricsAchieved: cs.metricsAchieved || "",
            outcome: cs.outcome || "",
            outcomeNumber: cs.outcomeNumber ? Number(cs.outcomeNumber) : null,
            outcomeUnit: cs.outcomeUnit || null,
            isConfidential: Boolean(cs.isConfidential),
            proofUrl: cs.proofUrl || null,
          },
        });
      }
    }
  } else if (step === 5) {
    // Commercials
    if (data.hourlyRateMin)
      updatePayload.hourlyRateMin = Number(data.hourlyRateMin);
    if (data.hourlyRateMax)
      updatePayload.hourlyRateMax = Number(data.hourlyRateMax);
    if (data.retainerMin) updatePayload.retainerMin = Number(data.retainerMin);
    if (data.retainerMax) updatePayload.retainerMax = Number(data.retainerMax);
    if (data.availabilityHoursPerWeek) {
      updatePayload.availabilityHoursPerWeek = Number(
        data.availabilityHoursPerWeek
      );
    }
    if (data.preferredMinWeeks) {
      updatePayload.preferredMinWeeks = Number(data.preferredMinWeeks);
    }
    if (data.engagementModels) {
      updatePayload.engagementModels = data.engagementModels;
    }
  } else if (step === 6) {
    // Availability slots
    if (Array.isArray(data.slots)) {
      await db.availabilitySlot.deleteMany({
        where: { strategistProfileId: profile.id },
      });
      for (const slot of data.slots) {
        await db.availabilitySlot.create({
          data: {
            strategistProfileId: profile.id,
            dayOfWeek: Number(slot.dayOfWeek),
            startTime: slot.startTime,
            endTime: slot.endTime,
            isRecurring: slot.isRecurring !== false,
          },
        });
      }
    }
  }

  return db.strategistProfile.update({
    where: { id: profile.id },
    data: updatePayload,
  });
}
