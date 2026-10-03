// src/app/api/auth/callback/route.js
// Supabase OAuth & email-verification callback handler
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { logSignIn } from "@/lib/audit";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error(
        "[Auth Callback] Code exchange failed:",
        exchangeError.message
      );
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
    }

    const supabaseUser = data?.user;
    if (supabaseUser) {
      // Sync/update Prisma user
      const role = supabaseUser.user_metadata?.role || "CLIENT";
      const existingUser = await db.user.findUnique({
        where: { email: supabaseUser.email },
      });

      let prismaUser;
      if (existingUser) {
        prismaUser = await db.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: new Date(),
            name:
              supabaseUser.user_metadata?.full_name ||
              supabaseUser.user_metadata?.name ||
              existingUser.name,
            image: supabaseUser.user_metadata?.avatar_url || existingUser.image,
            updatedAt: new Date(),
          },
        });
      } else {
        prismaUser = await db.user.create({
          data: {
            email: supabaseUser.email,
            name:
              supabaseUser.user_metadata?.full_name ||
              supabaseUser.user_metadata?.name ||
              null,
            image: supabaseUser.user_metadata?.avatar_url || null,
            role,
            emailVerified: new Date(),
          },
        });
        // Default prefs
        await db.notificationPreference
          .create({ data: { userId: prismaUser.id } })
          .catch(() => null);
      }

      // Audit log
      await logSignIn(prismaUser.id, {
        provider: supabaseUser.app_metadata?.provider,
      });

      // Role-based redirect
      const roleHome = {
        CLIENT: "/client/dashboard",
        STRATEGIST: "/strategist/dashboard",
        ADMIN: "/admin/dashboard",
      };
      const redirectTo = next.startsWith("/") ? next : roleHome[role] || "/app";
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
