import { NextRequest, NextResponse } from "next/server";

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

    // TODO: Store tokens securely in Supabase for the authenticated user
    // For now, redirect with success status
    // In production: encrypt and store refresh_token in user profile or dedicated table
    void tokens;

    return NextResponse.redirect(
      new URL("/parametres?calendar_connected=true", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/parametres?calendar_error=unknown", request.url)
    );
  }
}
