// src/app/api/contracts/create-from-proposal/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  buildContractMarkdown,
  STANDARD_CLAUSES,
} from "@/lib/contract-templates";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { proposalId, strategistId, organizationId } = body;

    let proposal = null;
    let strategist = null;
    let org = null;

    if (proposalId) {
      proposal = await db.proposal.findUnique({
        where: { id: proposalId },
        include: {
          job: { include: { organization: true } },
          brief: { include: { organization: true } },
          strategistProfile: { include: { user: true } },
        },
      });

      if (!proposal) {
        return NextResponse.json(
          { error: "Proposal not found" },
          { status: 404 }
        );
      }

      strategist = proposal.strategistProfile;
      org = proposal.job?.organization || proposal.brief?.organization;
    } else if (strategistId && organizationId) {
      // Direct hire from profile
      strategist = await db.strategistProfile.findUnique({
        where: { id: strategistId },
        include: { user: true },
      });
      org = await db.organization.findUnique({
        where: { id: organizationId },
      });
    }

    if (!strategist || !org) {
      return NextResponse.json(
        { error: "Strategist or Organization not found" },
        { status: 400 }
      );
    }

    // Verify user belongs to the client organization
    const membership = await db.orgMember.findFirst({
      where: { organizationId: org.id, userId: user.id },
    });

    if (!membership && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: not an organization member" },
        { status: 403 }
      );
    }

    // Determine commercials
    const model = proposal?.proposedModel || "RETAINER";
    const rate =
      proposal?.proposedRate ||
      (strategist.hourlyRate ? strategist.hourlyRate * 20 * 4 : 5000);
    const hourlyWeeklyCap = proposal?.hoursPerWeek || 20;
    const weeklyHours = proposal?.hoursPerWeek || 20;
    const scopeOfWork =
      proposal?.coverLetter ||
      "Fractional automation leadership, process mapping, and agent workflow orchestration.";

    const termsMd = buildContractMarkdown({
      clientOrgName: org.name,
      clientSignerName: user.name || "Authorized Representative",
      strategistName: strategist.user?.name || "Strategist",
      strategistEmail: strategist.user?.email,
      engagementModel: model,
      rate,
      hourlyWeeklyCap,
      weeklyHours,
      startDate: proposal?.startDate || new Date(),
      endDate: null,
      noticePeriodDays: 14,
      scopeOfWork,
    });

    // Check if engagement already exists for this proposal
    let engagement = null;
    if (proposal) {
      engagement = await db.engagement.findFirst({
        where: {
          organizationId: org.id,
          strategistProfileId: strategist.id,
          jobId: proposal.jobId || null,
        },
        include: { contract: true },
      });
    }

    if (!engagement) {
      engagement = await db.engagement.create({
        data: {
          organizationId: org.id,
          strategistProfileId: strategist.id,
          jobId: proposal?.jobId || null,
          briefId: proposal?.briefId || null,
          title:
            proposal?.job?.title ||
            `Fractional Head of AI - ${strategist.user?.name}`,
          model,
          rate,
          hourlyWeeklyCap,
          status: "PENDING",
          startDate: proposal?.startDate || new Date(),
        },
      });
    }

    // Create or update contract
    let contract = await db.contract.findUnique({
      where: { engagementId: engagement.id },
      include: { versions: true },
    });

    if (!contract) {
      contract = await db.contract.create({
        data: {
          engagementId: engagement.id,
          termsMd,
          scopeOfWork,
          model,
          rate,
          hourlyWeeklyCap,
          weeklyHours,
          startDate: proposal?.startDate || new Date(),
          noticePeriodDays: 14,
          ipAssignmentClause: STANDARD_CLAUSES.ipAssignment,
          confidentialityClause: STANDARD_CLAUSES.confidentiality,
          terminationClause: STANDARD_CLAUSES.termination,
          status: "DRAFT",
          versions: {
            create: {
              versionNumber: 1,
              termsMd,
              scopeOfWork,
              changesSummary:
                "Initial contract generation from accepted proposal",
              createdById: user.id,
            },
          },
        },
        include: { versions: true },
      });
    }

    // If proposal exists, convert milestones if any
    if (
      proposal &&
      Array.isArray(proposal.milestones) &&
      proposal.milestones.length > 0
    ) {
      for (const m of proposal.milestones) {
        if (m.title && m.amount) {
          await db.milestone.create({
            data: {
              engagementId: engagement.id,
              title: m.title,
              amount: parseFloat(m.amount) || 0,
              dueDate: m.dueDate ? new Date(m.dueDate) : null,
              status: "PENDING",
            },
          });
        }
      }
    }

    // Update proposal status to ACCEPTED
    if (proposal) {
      await db.proposal.update({
        where: { id: proposal.id },
        data: { status: "ACCEPTED" },
      });
    }

    // Notify strategist
    if (strategist.user?.id) {
      await db.notification.create({
        data: {
          userId: strategist.user.id,
          type: "ENGAGEMENT",
          title: "Contract Ready for Review",
          body: `${org.name} has accepted your proposal and prepared an agreement for your review.`,
          actionUrl: `/strategist/engagements/${engagement.id}`,
        },
      });
    }

    // Record activity event
    await db.activityEvent.create({
      data: {
        engagementId: engagement.id,
        actorId: user.id,
        type: "CONTRACT_CREATED",
        title: `Contract drafted for ${strategist.user?.name}`,
        metadata: { contractId: contract.id, model, rate },
      },
    });

    return NextResponse.json({
      success: true,
      engagementId: engagement.id,
      contractId: contract.id,
    });
  } catch (error) {
    console.error("[Create Contract Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
