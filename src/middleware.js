// src/middleware.js
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Role → home route mapping
const ROLE_HOME = {
  CLIENT: "/client/dashboard",
  STRATEGIST: "/strategist/dashboard",
  ADMIN: "/admin/dashboard",
};

// Route → required role(s)
const PROTECTED_ROUTES = [
  { prefix: "/client", roles: ["CLIENT", "ADMIN"] },
  { prefix: "/strategist", roles: ["STRATEGIST", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/settings", roles: ["CLIENT", "STRATEGIST", "ADMIN"] },
  { prefix: "/app", roles: ["CLIENT", "STRATEGIST", "ADMIN"] },
];

// Auth pages — redirect away if already signed in
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // Create Supabase client scoped to this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user role from user_metadata (set during signup)
  const role = user?.user_metadata?.role || null;

  // Redirect authenticated users away from auth pages
  if (
    user &&
    AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    const home = ROLE_HOME[role] || "/app";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Check protected routes
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route.prefix)) {
      if (!user) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
      if (!route.roles.includes(role)) {
        return NextResponse.redirect(new URL("/403", request.url));
      }
      break;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
