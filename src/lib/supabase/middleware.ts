import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeAuthRedirect } from "@/lib/auth/redirect";
import { isProtectedPath } from "@/lib/auth/protected-routes";
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
  const isProtectedRoute = isProtectedPath(request.nextUrl.pathname);

  function redirectWithCookies(url: URL) {
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
    return response;
  }

  function redirectToLogin(unavailable = false) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    if (unavailable) url.searchParams.set("error", "unavailable");
    return redirectWithCookies(url);
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return isProtectedRoute ? redirectToLogin(true) : supabaseResponse;
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

  let session;
  try {
    session = await supabase.auth.getUser();
  } catch {
    return isProtectedRoute ? redirectToLogin(true) : supabaseResponse;
  }
  const user = session.data.user;

  if (!user && isProtectedRoute) {
    return redirectToLogin();
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  if (
    user &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    const url = request.nextUrl.clone();
    const next = safeAuthRedirect(request.nextUrl.searchParams.get("next"));
    return redirectWithCookies(new URL(next, url.origin));
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
        return redirectWithCookies(url);
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
