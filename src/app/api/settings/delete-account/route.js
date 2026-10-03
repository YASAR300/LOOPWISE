// src/app/api/settings/delete-account/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request) {
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

  if (body?.confirmation !== "DELETE") {
    return NextResponse.json(
      { error: "Confirmation text must be 'DELETE'" },
      { status: 400 }
    );
  }

  // Soft delete in Prisma
  await db.user.update({
    where: { id: user.id },
    data: {
      status: "DELETED",
      deletedAt: new Date(),
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "USER_DELETED",
    entityType: "User",
    entityId: user.id,
    metadata: { reason: "User requested account deletion" },
  });

  // Sign out from Supabase
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.json({
    success: true,
    message: "Your account has been deleted.",
  });
}
