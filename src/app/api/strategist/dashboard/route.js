import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { validateProfileCompleteness } from "@/server/services/vetting";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        caseStudies: true,
        skills: { include: { skill: true } },
        specializations: { include: { specialization: true } },
        availabilitySlots: true,
        assessmentAttempts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        meetingRequests: {
          include: { organization: true },
          orderBy: { requestedDate: "desc" },
          take: 10,
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        matchResults: {
          include: {
            brief: { include: { organization: true } },
            job: { include: { organization: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!profile) {
      // Create draft profile if none exists
      profile = await db.strategistProfile.create({
        data: {
          userId: session.user.id,
          status: "DRAFT",
          onboardingStep: 1,
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          caseStudies: true,
          skills: { include: { skill: true } },
          specializations: { include: { specialization: true } },
          availabilitySlots: true,
          assessmentAttempts: true,
          meetingRequests: { include: { organization: true } },
          payouts: true,
          matchResults: true,
        },
      });
    }

    // Completeness check
    const completeness = validateProfileCompleteness(profile);

    // Earnings calculation from real Payouts & Ledger
    const paidPayouts =
      profile.payouts?.filter((p) => p.status === "PAID") || [];
    const pendingPayouts =
      profile.payouts?.filter(
        (p) => p.status === "PENDING" || p.status === "PROCESSING"
      ) || [];

    const totalEarned = paidPayouts.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0
    );
    const pendingAmount = pendingPayouts.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0
    );

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.user?.name,
        email: profile.user?.email,
        headline: profile.headline,
        status: profile.status,
        onboardingStep: profile.onboardingStep,
        slaDeadline: profile.slaDeadline,
        rejectionReason: profile.rejectionReason,
        verifiedAt: profile.verifiedAt,
        stripeAccountId: profile.stripeAccountId,
        stripeOnboarded: profile.stripeOnboarded,
        ratingAvg: profile.ratingAvg,
      },
      completeness,
      assessment: profile.assessmentAttempts?.[0] || null,
      intros: profile.meetingRequests || [],
      invitations: profile.matchResults || [],
      earnings: {
        totalEarned,
        pendingAmount,
        currency: "USD",
        payouts: profile.payouts || [],
      },
    });
  } catch (error) {
    console.error("[Strategist Dashboard GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
