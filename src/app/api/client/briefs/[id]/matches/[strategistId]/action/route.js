import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/client/briefs/[id]/matches/[strategistId]/action
 * Handles shortlist, dismiss, invite, and intro call actions
 */
export async function POST(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: briefId, strategistId } = await params;
    const body = await request.json();
    const { action, reason, message } = body;

    const brief = await db.brief.findUnique({
      where: { id: briefId },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    if (!brief)
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    if (brief.organization.members.length === 0 && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const strategist = await db.strategistProfile.findUnique({
      where: { id: strategistId },
      include: { user: true },
    });

    if (!strategist) {
      return NextResponse.json(
        { error: "Strategist not found" },
        { status: 404 }
      );
    }

    // 1. Shortlist Action
    if (action === "shortlist") {
      const match = await db.matchResult.findUnique({
        where: {
          briefId_strategistProfileId: {
            briefId,
            strategistProfileId: strategistId,
          },
        },
      });

      const nextState = !match?.isShortlisted;

      if (match) {
        await db.matchResult.update({
          where: { id: match.id },
          data: { isShortlisted: nextState },
        });
      }

      // Also ensure added to default shortlist for org
      let shortlist = await db.shortlist.findFirst({
        where: { organizationId: brief.organizationId, briefId },
      });

      if (!shortlist && nextState) {
        shortlist = await db.shortlist.create({
          data: {
            organizationId: brief.organizationId,
            briefId,
            name: `${brief.title} Shortlist`,
          },
        });
      }

      if (shortlist) {
        if (nextState) {
          const existing = await db.shortlistItem.findFirst({
            where: {
              shortlistId: shortlist.id,
              strategistProfileId: strategistId,
            },
          });
          if (!existing) {
            await db.shortlistItem.create({
              data: {
                shortlistId: shortlist.id,
                strategistProfileId: strategistId,
                rank: 0,
              },
            });
          }
        } else {
          await db.shortlistItem.deleteMany({
            where: {
              shortlistId: shortlist.id,
              strategistProfileId: strategistId,
            },
          });
        }
      }

      return NextResponse.json({ success: true, isShortlisted: nextState });
    }

    // 2. Dismiss Action
    if (action === "dismiss") {
      await db.dismissedMatch.upsert({
        where: {
          briefId_strategistProfileId: {
            briefId,
            strategistProfileId: strategistId,
          },
        },
        update: {
          reason: reason || "Dismissed by client",
          createdAt: new Date(),
        },
        create: {
          organizationId: brief.organizationId,
          briefId,
          strategistProfileId: strategistId,
          reason: reason || "Dismissed by client",
        },
      });

      await db.matchResult.updateMany({
        where: { briefId, strategistProfileId: strategistId },
        data: {
          isDismissed: true,
          dismissReason: reason || "Dismissed by client",
        },
      });

      return NextResponse.json({ success: true, dismissed: true });
    }

    // 3. Invite Action
    if (action === "invite") {
      const invitation = await db.briefInvitation.upsert({
        where: {
          briefId_strategistProfileId: {
            briefId,
            strategistProfileId: strategistId,
          },
        },
        update: {
          message: message || "We would love for you to apply to our brief.",
          status: "PENDING",
          updatedAt: new Date(),
        },
        create: {
          briefId,
          organizationId: brief.organizationId,
          strategistProfileId: strategistId,
          message: message || "We would love for you to apply to our brief.",
          status: "PENDING",
        },
      });

      // Emit Notification for Strategist User
      if (strategist.user?.id) {
        await db.notification.create({
          data: {
            userId: strategist.user.id,
            type: "INVITED",
            title: `Invitation: ${brief.title}`,
            body: `${brief.organization.name} invited you to review and submit a proposal for their automation brief.`,
            actionUrl: `/strategist/jobs?invite=${invitation.id}&briefId=${brief.id}`,
          },
        });

        // Email alert
        await sendEmail({
          to: strategist.user.email,
          subject: `You've been invited to submit a proposal: ${brief.title}`,
          html: `<p>Hi ${strategist.user.name},</p><p><strong>${brief.organization.name}</strong> has invited you to submit a proposal for their brief: <em>${brief.title}</em>.</p><p><a href="${process.env.NEXTAUTH_URL || "https://loopwise.app"}/strategist/jobs?invite=${invitation.id}">View Brief & Submit Proposal</a></p>`,
        });
      }

      return NextResponse.json({ success: true, invitationId: invitation.id });
    }

    // 4. Intro Call Request Action
    if (action === "intro") {
      const requestedDate = body.requestedDate
        ? new Date(body.requestedDate)
        : new Date(Date.now() + 86400000 * 2);

      const meeting = await db.meetingRequest.create({
        data: {
          organizationId: brief.organizationId,
          strategistProfileId: strategistId,
          requestedDate,
          notes:
            message || `Intro call requested regarding brief: ${brief.title}`,
          status: "PENDING",
        },
      });

      if (strategist.user?.id) {
        await db.notification.create({
          data: {
            userId: strategist.user.id,
            type: "ENGAGEMENT",
            title: `Intro Call Request: ${brief.title}`,
            body: `${brief.organization.name} requested an introductory scoping call.`,
            actionUrl: `/strategist/dashboard`,
          },
        });
      }

      return NextResponse.json({ success: true, meetingId: meeting.id });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Match Action Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
