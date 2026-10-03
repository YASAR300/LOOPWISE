// src/app/api/settings/profile/route.js
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  image: z.string().url().nullable().optional().or(z.literal("")),
});

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

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Validation error" },
      { status: 422 }
    );
  }

  const { name, image } = parsed.data;

  // Update Prisma user
  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: {
      name,
      image: image || null,
      updatedAt: new Date(),
    },
  });

  // Sync with Supabase Auth metadata
  try {
    const supabase = await createClient();
    await supabase.auth.updateUser({
      data: {
        name,
        avatar_url: image || null,
      },
    });
  } catch (err) {
    console.error("[Settings/Profile] Supabase metadata sync error:", err);
  }

  await writeAuditLog({
    userId: user.id,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: user.id,
    metadata: { changed: ["name", "image"] },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      role: updatedUser.role,
    },
  });
}
