import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create default organization for the client
    let membership = await db.orgMember.findFirst({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true },
                },
              },
            },
            invitations: { where: { acceptedAt: null } },
          },
        },
      },
    });

    if (!membership) {
      // Create new organization for client
      const orgName = `${user.name ? user.name.split(" ")[0] : "My"}'s Organization`;
      const baseSlug =
        (user.name
          ? user.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
          : "client-org") + `-${Date.now().toString().slice(-4)}`;

      const newOrg = await db.organization.create({
        data: {
          name: orgName,
          slug: baseSlug,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
          invitations: { where: { acceptedAt: null } },
        },
      });

      membership = { role: "OWNER", organization: newOrg };
    }

    return NextResponse.json({
      organization: membership.organization,
      userRole: membership.role,
      user,
    });
  } catch (error) {
    console.error("[Client Onboarding GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      industry,
      size,
      website,
      toolsInUse,
      complianceNeeds,
      billingContactName,
      billingContactEmail,
      billingAddress,
      teamInvites,
      userTitle,
    } = body;

    // Get current org membership
    let membership = await db.orgMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    let orgId = membership?.organizationId;

    if (!orgId) {
      const baseSlug =
        (name || "company").toLowerCase().replace(/[^a-z0-9]/g, "-") +
        `-${Date.now().toString().slice(-4)}`;
      const createdOrg = await db.organization.create({
        data: {
          name: name || "My Company",
          slug: baseSlug,
          industry,
          size,
          website,
          toolsInUse: toolsInUse || [],
          complianceNeeds: complianceNeeds || [],
          billingContactName,
          billingContactEmail,
          billingAddress,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });
      orgId = createdOrg.id;
    } else {
      await db.organization.update({
        where: { id: orgId },
        data: {
          name: name || undefined,
          industry: industry || undefined,
          size: size || undefined,
          website: website || undefined,
          toolsInUse: toolsInUse || undefined,
          complianceNeeds: complianceNeeds || undefined,
          billingContactName: billingContactName || undefined,
          billingContactEmail: billingContactEmail || undefined,
          billingAddress: billingAddress || undefined,
        },
      });
    }

    // Process team invitations
    const createdInvitations = [];
    if (Array.isArray(teamInvites) && teamInvites.length > 0) {
      for (const invite of teamInvites) {
        if (!invite.email || !invite.email.includes("@")) continue;

        const token = crypto.randomBytes(24).toString("hex");
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7-day expiration

        // Upsert invitation
        const inv = await db.invitation.upsert({
          where: { token },
          update: {
            role: invite.role || "MEMBER",
            expires,
          },
          create: {
            organizationId: orgId,
            email: invite.email.toLowerCase().trim(),
            role: invite.role || "MEMBER",
            token,
            expires,
          },
        });

        createdInvitations.push(inv);

        // Send email invitation
        try {
          const inviteUrl = `${process.env.NEXTAUTH_URL || "https://loopwise.ai"}/invite/${token}`;
          await sendEmail({
            to: invite.email,
            subject: `You've been invited to join ${name || "the team"} on Loopwise`,
            text: `Hello,\n\nYou have been invited by ${user.name || user.email} to collaborate on Loopwise.\n\nAccept your invite here:\n${inviteUrl}\n\nThis invitation expires in 7 days.`,
          });
        } catch (emailErr) {
          console.error("[Invite Email Error]:", emailErr);
        }
      }
    }

    // Audit log
    await writeAuditLog({
      userId: user.id,
      action: "CLIENT_ONBOARDING_COMPLETED",
      entityType: "Organization",
      entityId: orgId,
      metadata: {
        industry,
        size,
        invitesCount: createdInvitations.length,
        userTitle,
      },
    });

    const updatedOrg = await db.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        invitations: { where: { acceptedAt: null } },
      },
    });

    return NextResponse.json({
      success: true,
      organization: updatedOrg,
    });
  } catch (error) {
    console.error("[Client Onboarding POST Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
