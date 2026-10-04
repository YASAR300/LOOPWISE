import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/client/proposals/[id]/action
 * Handles proposal actions: shortlist, decline, request_changes, accept
 */
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: proposalId } = await params;
    const body = await request.json();
    const { action, reason, notes } = body;

    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
      include: {
        job: {
          include: {
            organization: {
              include: {
                members: { where: { userId: user.id } },
              },
            },
          },
        },
        strategistProfile: {
          include: { user: true },
        },
      },
    });

    if (!proposal)
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );

    // Tenant check
    if (
      proposal.job.organization.members.length === 0 &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let updatedStatus = proposal.status;
    let declineReason = proposal.declineReason;
    let changeRequestNotes = proposal.changeRequestNotes;

    if (action === "shortlist") {
      updatedStatus = "SHORTLISTED";
    } else if (action === "decline") {
      updatedStatus = "DECLINED";
      declineReason =
        reason ||
        "Thank you for submitting your proposal. The client has chosen to pursue other candidates at this time.";

      // Send auto-email to strategist
      if (proposal.strategistProfile.user?.email) {
        await sendEmail({
          to: proposal.strategistProfile.user.email,
          subject: `Update on your proposal for ${proposal.job.title}`,
          html: `<p>Hi ${proposal.strategistProfile.user.name},</p><p>Thank you for submitting a proposal for <strong>${proposal.job.title}</strong> with ${proposal.job.organization.name}.</p><p>The client has updated the status to declined with the following feedback:</p><blockquote>${declineReason}</blockquote><p>We invite you to browse other open opportunities on Loopwise.</p>`,
        });
      }
    } else if (action === "request_changes") {
      changeRequestNotes =
        notes ||
        "Client requested adjustments to the proposed scope, timeline, or commercial terms.";
    } else if (action === "accept") {
      updatedStatus = "ACCEPTED";

      // Initialize Engagement & Contract
      const orgId = proposal.job.organization.id;
      const model = proposal.proposedModel || "RETAINER";
      const rate = proposal.proposedRate || 5000;
      const hourlyWeeklyCap = proposal.hoursPerWeek || 20;

      let engagement = await db.engagement.findFirst({
        where: {
          organizationId: orgId,
          strategistProfileId: proposal.strategistProfileId,
          jobId: proposal.jobId,
        },
        include: { contract: true },
      });

      if (!engagement) {
        engagement = await db.engagement.create({
          data: {
            organizationId: orgId,
            strategistProfileId: proposal.strategistProfileId,
            jobId: proposal.jobId,
            briefId: proposal.briefId || null,
            title: proposal.job.title,
            model,
            rate,
            hourlyWeeklyCap,
            status: "PENDING",
            startDate: proposal.startDate || new Date(),
          },
        });
      }

      let contract = await db.contract.findUnique({
        where: { engagementId: engagement.id },
      });

      if (!contract) {
        const { buildContractMarkdown, STANDARD_CLAUSES } =
          await import("@/lib/contract-templates");
        const termsMd = buildContractMarkdown({
          clientOrgName: proposal.job.organization.name,
          clientSignerName: user.name || "Authorized Representative",
          strategistName: proposal.strategistProfile.user?.name || "Strategist",
          strategistEmail: proposal.strategistProfile.user?.email,
          engagementModel: model,
          rate,
          hourlyWeeklyCap,
          weeklyHours: hourlyWeeklyCap,
          startDate: proposal.startDate || new Date(),
          scopeOfWork: proposal.coverLetter,
        });

        contract = await db.contract.create({
          data: {
            engagementId: engagement.id,
            termsMd,
            scopeOfWork: proposal.coverLetter,
            model,
            rate,
            hourlyWeeklyCap,
            weeklyHours: hourlyWeeklyCap,
            startDate: proposal.startDate || new Date(),
            noticePeriodDays: 14,
            ipAssignmentClause: STANDARD_CLAUSES.ipAssignment,
            confidentialityClause: STANDARD_CLAUSES.confidentiality,
            terminationClause: STANDARD_CLAUSES.termination,
            status: "SENT",
            versions: {
              create: {
                versionNumber: 1,
                termsMd,
                scopeOfWork: proposal.coverLetter,
                changesSummary: "Contract generated from accepted proposal",
                createdById: user.id,
              },
            },
          },
        });
      }

      // Convert milestones if present
      if (
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

      // Notify strategist
      if (proposal.strategistProfile.user?.id) {
        await db.notification.create({
          data: {
            userId: proposal.strategistProfile.user.id,
            type: "PROPOSAL_STATUS_CHANGED",
            title: `Proposal Accepted! 🎉`,
            body: `${proposal.job.organization.name} accepted your proposal for ${proposal.job.title}. Next step: review & e-sign contract.`,
            actionUrl: `/strategist/engagements/${engagement.id}`,
          },
        });

        if (proposal.strategistProfile.user?.email) {
          await sendEmail({
            to: proposal.strategistProfile.user.email,
            subject: `Congratulations! Your proposal for ${proposal.job.title} was accepted`,
            html: `<p>Hi ${proposal.strategistProfile.user.name},</p><p>Great news! <strong>${proposal.job.organization.name}</strong> has accepted your proposal for <strong>${proposal.job.title}</strong>.</p><p><a href="${process.env.NEXTAUTH_URL || "https://loopwise.app"}/strategist/engagements/${engagement.id}">Review & Sign Agreement</a></p>`,
          });
        }
      }

      // Add activity event
      await db.activityEvent.create({
        data: {
          engagementId: engagement.id,
          actorId: user.id,
          type: "PROPOSAL_ACCEPTED",
          title: `Proposal accepted and agreement prepared for ${proposal.strategistProfile.user?.name}`,
        },
      });

      const updated = await db.proposal.update({
        where: { id: proposalId },
        data: { status: "ACCEPTED" },
      });

      return NextResponse.json({
        success: true,
        proposal: updated,
        engagementId: engagement.id,
        contractId: contract.id,
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await db.proposal.update({
      where: { id: proposalId },
      data: {
        status: updatedStatus,
        declineReason,
        changeRequestNotes,
      },
    });

    // Notify strategist of any status change
    if (action !== "accept" && proposal.strategistProfile.user?.id) {
      await db.notification.create({
        data: {
          userId: proposal.strategistProfile.user.id,
          type: "PROPOSAL_STATUS_CHANGED",
          title: `Proposal Status: ${updatedStatus}`,
          body: `Your proposal for ${proposal.job.title} status has been updated to ${updatedStatus.toLowerCase()}.`,
          actionUrl: `/strategist/proposals`,
        },
      });
    }

    return NextResponse.json({ success: true, proposal: updated });
  } catch (error) {
    console.error("[Proposal Action Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
