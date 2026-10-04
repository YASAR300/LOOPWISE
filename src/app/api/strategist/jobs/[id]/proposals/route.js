import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await db.strategistProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Strategist profile required" },
        { status: 403 }
      );
    }

    const { id: jobId } = await params;

    const job = await db.job.findUnique({
      where: { id: jobId },
      include: {
        organization: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const body = await request.json();
    const {
      coverLetter,
      proposedRate,
      proposedModel = "RETAINER",
      hoursPerWeek,
      startDate,
      milestones = [],
      attachments = [],
      screeningAnswers = {},
    } = body;

    if (!coverLetter || !proposedRate) {
      return NextResponse.json(
        { error: "Cover note and rate are required" },
        { status: 400 }
      );
    }

    // Check if already applied
    const existing = await db.proposal.findFirst({
      where: { jobId, strategistProfileId: profile.id },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already submitted a proposal for this job" },
        { status: 400 }
      );
    }

    const proposal = await db.proposal.create({
      data: {
        jobId,
        briefId: job.briefId,
        strategistProfileId: profile.id,
        coverLetter,
        proposedRate: parseFloat(proposedRate),
        proposedModel,
        hoursPerWeek: hoursPerWeek ? parseInt(hoursPerWeek, 10) : null,
        startDate: startDate ? new Date(startDate) : null,
        milestones,
        attachments,
        screeningAnswers,
        status: "SENT",
      },
    });

    // If there was an invitation, mark it accepted
    if (job.briefId) {
      await db.briefInvitation.updateMany({
        where: {
          briefId: job.briefId,
          strategistProfileId: profile.id,
          status: "PENDING",
        },
        data: { status: "ACCEPTED", updatedAt: new Date() },
      });
    }

    // Notify organization members
    for (const member of job.organization.members) {
      if (member.user?.id) {
        await db.notification.create({
          data: {
            userId: member.user.id,
            type: "PROPOSAL_RECEIVED",
            title: `New Proposal: ${job.title}`,
            body: `${profile.user.name} submitted a proposal (${proposedModel} at $${proposedRate}).`,
            actionUrl: `/client/proposals?jobId=${job.id}&proposalId=${proposal.id}`,
          },
        });
      }
    }

    // Send email alert to organization billing / owner
    const primaryContact = job.organization.members[0]?.user?.email;
    if (primaryContact) {
      await sendEmail({
        to: primaryContact,
        subject: `New Proposal Received: ${job.title}`,
        html: `<p>Hi there,</p><p><strong>${profile.user.name}</strong> has submitted a proposal for your open role <em>${job.title}</em>.</p><p><a href="${process.env.NEXTAUTH_URL || "https://loopwise.app"}/client/proposals?jobId=${job.id}">Review Proposal in Inbox</a></p>`,
      });
    }

    return NextResponse.json({
      success: true,
      proposalId: proposal.id,
    });
  } catch (error) {
    console.error("[Submit Proposal Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
