import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  HAS_HOUSEHOLD_COOKIE,
  HAS_HOUSEHOLD_COOKIE_MAX_AGE,
} from "@/lib/auth/household-cookie";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured yet — let the request through without auth
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes: only dashboard-related paths require authentication
  const PROTECTED_PREFIXES = [
    "/dashboard", "/identite", "/sante", "/documents", "/scolarite",
    "/activites", "/developpement", "/fiscal", "/budget", "/garde",
    "/demarches", "/sante-enrichie", "/parametres", "/partage",
    "/depenses-partagees", "/parrainage", "/admin", "/onboarding",
    "/confiance", "/capsule",
  ];
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect new users (without household) to onboarding.
  // Fast path: once a household has been seen we cache it in a cookie to avoid a
  // DB roundtrip on every protected navigation. The cookie is set on household
  // creation and cleared on deletion; here we self-heal if it is missing.
  if (user && isProtectedRoute && request.nextUrl.pathname !== "/onboarding") {
    const hasHouseholdCookie =
      request.cookies.get(HAS_HOUSEHOLD_COOKIE)?.value === "1";

    if (!hasHouseholdCookie) {
      const { data: household } = await supabase
        .from("households")
        .select("id")
        .eq("owner_id", user.id)
        .single();

      if (!household) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      supabaseResponse.cookies.set(HAS_HOUSEHOLD_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: HAS_HOUSEHOLD_COOKIE_MAX_AGE,
      });
    }
  }

  return supabaseResponse;
}
