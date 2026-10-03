// src/app/api/settings/notifications/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

const NotificationsSchema = z.object({
  emailMarketing: z.boolean().optional(),
  emailTransactional: z.boolean().optional(),
  emailSecurity: z.boolean().optional(),
  inAppEngagements: z.boolean().optional(),
  inAppMessages: z.boolean().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await db.notificationPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  return NextResponse.json({ success: true, preferences: prefs });
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = NotificationsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 422 }
    );
  }

  const updatedPrefs = await db.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...parsed.data,
    },
    update: {
      ...parsed.data,
      updatedAt: new Date(),
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "PREFERENCES_UPDATED",
    entityType: "NotificationPreference",
    entityId: updatedPrefs.id,
    metadata: { changed: Object.keys(parsed.data) },
  }).catch(() => null);

  return NextResponse.json({ success: true, preferences: updatedPrefs });
}
