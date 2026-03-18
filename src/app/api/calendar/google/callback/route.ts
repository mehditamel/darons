import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google OAuth2 callback for Calendar sync
// Exchanges authorization code for access/refresh tokens

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/parametres?calendar_error=access_denied", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/parametres?calendar_error=no_code", request.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId || !clientSecret || !appUrl) {
    return NextResponse.redirect(
      new URL("/parametres?calendar_error=config_missing", request.url)
    );
  }

  try {
    // Verify the user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?redirect=/parametres", request.url)
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${appUrl}/api/calendar/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        new URL("/parametres?calendar_error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Store tokens in the user's profile
    const calendarTokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      scope: tokens.scope,
    };

    await supabase
      .from("profiles")
      .update({
        calendar_tokens: calendarTokens,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.redirect(
      new URL("/parametres?calendar_connected=true", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/parametres?calendar_error=unknown", request.url)
    );
  }
}
