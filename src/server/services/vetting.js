// src/server/services/vetting.js
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

export const VETTING_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
};

export const ALLOWED_TRANSITIONS = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["IN_REVIEW", "DRAFT"],
  IN_REVIEW: ["APPROVED", "REJECTED", "DRAFT"],
  APPROVED: ["SUSPENDED", "DRAFT"],
  REJECTED: ["DRAFT"],
  SUSPENDED: ["APPROVED", "DRAFT", "IN_REVIEW"],
};

export class VettingTransitionError extends Error {
  constructor(message, code = "INVALID_TRANSITION") {
    super(message);
    this.name = "VettingTransitionError";
    this.code = code;
  }
}

/**
 * Check completeness of strategist profile before submission
 */
export async function validateProfileCompleteness(profileOrId) {
  let profile;
  if (typeof profileOrId === "string") {
    profile = await db.strategistProfile.findUnique({
      where: { id: profileOrId },
      include: {
        caseStudies: true,
        skills: true,
        specializations: true,
        availabilitySlots: true,
        assessmentAttempts: {
          where: { passed: true },
          take: 1,
        },
      },
    });
  } else {
    profile = profileOrId;
  }

  if (!profile) {
    throw new Error("Strategist profile not found");
  }

  const caseStudiesCount = profile.caseStudies?.length || 0;
  const skillsCount = profile.skills?.length || 0;
  const specializationsCount = profile.specializations?.length || 0;
  const slotsCount = profile.availabilitySlots?.length || 0;

  const checklist = {
    identity: Boolean(
      profile.headline &&
      profile.location &&
      (profile.timezone || profile.linkedinUrl)
    ),
    positioning: Boolean(
      profile.bio && (profile.yearsExperience || profile.industries?.length)
    ),
    expertise: Boolean(
      (specializationsCount >= 1 || skillsCount >= 1) && skillsCount >= 1
    ),
    caseStudies: Boolean(caseStudiesCount >= 2),
    commercials: Boolean(
      profile.hourlyRateMin &&
      (profile.availabilityHoursPerWeek || profile.retainerMin)
    ),
    availability: Boolean(slotsCount >= 1),
  };

  const missing = [];
  if (!checklist.identity)
    missing.push("identity (headline, location, timezone/linkedin)");
  if (!checklist.positioning)
    missing.push("positioning (bio, experience/industries)");
  if (!checklist.expertise)
    missing.push("expertise (skills & specializations)");
  if (!checklist.caseStudies) missing.push("caseStudies (minimum 2 required)");
  if (!checklist.commercials)
    missing.push("commercials (rates & weekly availability)");
  if (!checklist.availability)
    missing.push("availability (at least 1 recurring weekly window)");

  const totalChecks = Object.keys(checklist).length;
  const passedChecks = Object.values(checklist).filter(Boolean).length;
  const score = Math.round((passedChecks / totalChecks) * 100);
  const isComplete = passedChecks === totalChecks;

  return { isComplete, checklist, score, missing, profile };
}

/**
 * Transition strategist profile status with validation and audit logging
 */
export async function transitionStrategistStatus({
  profileId,
  strategistProfileId,
  targetStatus,
  toStatus,
  reviewerId = null,
  adminUserId = null,
  reason = null,
  feedback = null,
  reviewerNotes = null,
  scores = null,
  unlockedSteps = null,
}) {
  const actualProfileId = profileId || strategistProfileId;
  const actualTargetStatus = targetStatus || toStatus;
  const actualReviewerId = reviewerId || adminUserId;
  const actualReason = reason || feedback || reviewerNotes;

  const profile = await db.strategistProfile.findUnique({
    where: { id: actualProfileId },
    include: { user: true },
  });

  if (!profile) {
    throw new VettingTransitionError(
      "Strategist profile not found",
      "NOT_FOUND"
    );
  }

  const currentStatus = profile.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(actualTargetStatus)) {
    throw new VettingTransitionError(
      `Cannot transition from ${currentStatus} to ${actualTargetStatus}. Allowed: ${allowed.join(", ")}`,
      "ILLEGAL_TRANSITION"
    );
  }

  // Pre-submission validation
  if (actualTargetStatus === VETTING_STATUS.SUBMITTED) {
    const { isComplete, checklist, missing } =
      await validateProfileCompleteness(actualProfileId);
    if (!isComplete) {
      throw new VettingTransitionError(
        `Cannot submit incomplete profile. Missing sections: ${missing.join(", ")}`,
        "INCOMPLETE_PROFILE"
      );
    }
  }

  const updateData = {
    status: actualTargetStatus,
  };

  // SLA tracking: 48 hours from submission
  if (actualTargetStatus === VETTING_STATUS.SUBMITTED) {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);
    updateData.slaDeadline = deadline;
  }

  if (actualTargetStatus === VETTING_STATUS.IN_REVIEW && actualReviewerId) {
    updateData.assignedReviewerId = actualReviewerId;
  }

  if (actualTargetStatus === VETTING_STATUS.APPROVED) {
    updateData.verifiedAt = new Date();
    updateData.rejectionReason = null;
  }

  if (actualTargetStatus === VETTING_STATUS.REJECTED && actualReason) {
    updateData.rejectionReason = actualReason;
  }

  if (actualTargetStatus === VETTING_STATUS.DRAFT && actualReason) {
    updateData.rejectionReason = actualReason;
  }

  // Execute transition
  const updated = await db.strategistProfile.update({
    where: { id: actualProfileId },
    data: updateData,
  });

  // Record Review if reviewer provided notes/scores
  if (actualReviewerId && (actualReason || scores)) {
    await db.vettingReview.create({
      data: {
        strategistProfileId: actualProfileId,
        reviewerId: actualReviewerId,
        status: actualTargetStatus,
        notes: actualReason || "Status updated by admin reviewer",
        score: scores?.overall || null,
      },
    });
  }

  // Audit Logging
  await writeAuditLog({
    userId: actualReviewerId || profile.userId,
    action: `STRATEGIST_STATUS_${actualTargetStatus}`,
    entityType: "StrategistProfile",
    entityId: actualProfileId,
    metadata: {
      from: currentStatus,
      to: actualTargetStatus,
      reason: actualReason,
      reviewerId: actualReviewerId,
      unlockedSteps,
    },
  });

  // Transactional Email Notifications
  try {
    if (actualTargetStatus === VETTING_STATUS.APPROVED && profile.user?.email) {
      await sendEmail({
        to: profile.user.email,
        subject:
          "🎉 Congratulations! Your Loopwise Strategist Profile is Approved",
        text: `Hello ${profile.user.name || "Strategist"},\n\nYour profile has been reviewed and approved by our governance committee. Your profile is now live in the Loopwise marketplace directory.\n\nNext step: Connect your Stripe account to receive milestone payouts.\n\nLog in: https://loopwise.ai/strategist/dashboard`,
      });
    } else if (
      actualTargetStatus === VETTING_STATUS.DRAFT &&
      actualReason &&
      profile.user?.email
    ) {
      await sendEmail({
        to: profile.user.email,
        subject:
          "Action Required: Revisions Requested on your Loopwise Application",
        text: `Hello ${profile.user.name || "Strategist"},\n\nOur reviewers have requested updates on your application before final signoff.\n\nReviewer Feedback:\n"${actualReason}"\n\nPlease log in and update the highlighted sections: https://loopwise.ai/strategist/onboarding`,
      });
    } else if (
      actualTargetStatus === VETTING_STATUS.REJECTED &&
      profile.user?.email
    ) {
      await sendEmail({
        to: profile.user.email,
        subject: "Loopwise Application Status Update",
        text: `Hello ${profile.user.name || "Strategist"},\n\nThank you for your interest in joining Loopwise. At this time, our committee has decided not to proceed with your application.\n\nReason: ${actualReason || "Does not meet current enterprise cohort requirements."}`,
      });
    }
  } catch (emailErr) {
    console.error(
      "[Vetting Email] Failed to send notification:",
      emailErr?.message
    );
  }

  return updated;
}

/**
 * Get Vetting Queue for Admin Reviewers
 */
export async function getVettingQueue({
  status = "SUBMITTED",
  specialization = null,
  limit = 50,
} = {}) {
  const where = {};
  if (status && status !== "ALL") {
    where.status = status;
  }
  if (specialization) {
    where.specializations = {
      some: {
        specialization: { slug: specialization },
      },
    };
  }

  const strategists = await db.strategistProfile.findMany({
    where,
    take: limit,
    orderBy: [{ slaDeadline: "asc" }, { updatedAt: "desc" }],
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      specializations: {
        include: { specialization: true },
      },
      skills: {
        include: { skill: true },
      },
      caseStudies: true,
      assessmentAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      vettingReviews: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  return strategists;
}
