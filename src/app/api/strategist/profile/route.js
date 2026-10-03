import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        skills: { include: { skill: true } },
        specializations: { include: { specialization: true } },
        caseStudies: true,
        availabilitySlots: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[Strategist Profile GET Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      headline,
      bio,
      location,
      timezone,
      hourlyRateMin,
      hourlyRateMax,
      retainerMin,
      retainerMax,
      availabilityHoursPerWeek,
      preferredMinWeeks,
      slug,
      isPaused,
    } = body;

    const profile = await db.strategistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check slug uniqueness if changing
    if (slug && slug !== profile.slug) {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const existing = await db.strategistProfile.findUnique({
        where: { slug: cleanSlug },
      });
      if (existing && existing.id !== profile.id) {
        return NextResponse.json(
          {
            error: "This public slug is already taken. Please choose another.",
          },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (headline !== undefined) updateData.headline = headline;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (hourlyRateMin !== undefined)
      updateData.hourlyRateMin = Number(hourlyRateMin);
    if (hourlyRateMax !== undefined)
      updateData.hourlyRateMax = Number(hourlyRateMax);
    if (retainerMin !== undefined) updateData.retainerMin = Number(retainerMin);
    if (retainerMax !== undefined) updateData.retainerMax = Number(retainerMax);
    if (availabilityHoursPerWeek !== undefined) {
      updateData.availabilityHoursPerWeek = Number(availabilityHoursPerWeek);
    }
    if (preferredMinWeeks !== undefined) {
      updateData.preferredMinWeeks = Number(preferredMinWeeks);
    }
    if (slug !== undefined) {
      updateData.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    }

    // If pausing / resuming availability
    if (isPaused !== undefined) {
      if (profile.status === "APPROVED" && isPaused) {
        updateData.status = "SUSPENDED";
      } else if (profile.status === "SUSPENDED" && !isPaused) {
        updateData.status = "APPROVED";
      }
    }

    const updated = await db.strategistProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    // Audit log
    await writeAuditLog({
      userId: session.user.id,
      action: "STRATEGIST_PROFILE_UPDATE",
      entityType: "StrategistProfile",
      entityId: profile.id,
      metadata: updateData,
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("[Strategist Profile PATCH Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
