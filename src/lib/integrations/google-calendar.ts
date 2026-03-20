/**
 * Google Calendar token management and sync helpers.
 * Wraps calendar-sync.ts with token refresh, revocation, and auto-sync.
 */

import { createClient } from "@/lib/supabase/server";
import {
  createGoogleCalendarEvent,
  buildMedicalAppointmentEvent,
  buildFiscalDeadlineEvent,
} from "./calendar-sync";

interface CalendarTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
}

function isCalendarTokens(value: unknown): value is CalendarTokens {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.access_token === "string" &&
    typeof obj.refresh_token === "string" &&
    typeof obj.expires_at === "number"
  );
}

export function isCalendarConnected(calendarTokens: unknown): boolean {
  return isCalendarTokens(calendarTokens);
}

/**
 * Reads calendar tokens from DB, refreshes if expired, returns valid access token.
 * Returns null if no tokens or refresh fails.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("calendar_tokens")
    .eq("id", userId)
    .single();

  if (!profile || !isCalendarTokens(profile.calendar_tokens)) {
    return null;
  }

  const tokens = profile.calendar_tokens;
  const bufferMs = 60_000; // 60s buffer before actual expiry

  if (Date.now() < tokens.expires_at - bufferMs) {
    return tokens.access_token;
  }

  // Token expired — refresh it
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokens.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const updatedTokens: CalendarTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token ?? tokens.refresh_token,
      expires_at: Date.now() + (data.expires_in ?? 3600) * 1000,
      scope: data.scope ?? tokens.scope,
    };

    await supabase
      .from("profiles")
      .update({
        calendar_tokens: updatedTokens,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return updatedTokens.access_token;
  } catch {
    return null;
  }
}

/**
 * Revokes Google Calendar access and clears tokens from DB.
 */
export async function revokeCalendarAccess(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("calendar_tokens")
    .eq("id", userId)
    .single();

  if (profile && isCalendarTokens(profile.calendar_tokens)) {
    try {
      await fetch(
        `https://oauth2.googleapis.com/revoke?token=${profile.calendar_tokens.access_token}`,
        { method: "POST" }
      );
    } catch {
      // Best effort — continue with local cleanup
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      calendar_tokens: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { success: false, error: "Erreur lors de la déconnexion du calendrier" };
  }

  return { success: true };
}

/**
 * Best-effort sync: creates a Google Calendar event for a medical appointment.
 * Never throws — silently fails if calendar not connected or API errors.
 */
export async function syncMedicalAppointmentToCalendar(
  userId: string,
  childName: string,
  appointmentType: string,
  appointmentDate: string,
  practitioner?: string | null,
  location?: string | null
): Promise<void> {
  try {
    const accessToken = await getValidAccessToken(userId);
    if (!accessToken) return;

    const event = buildMedicalAppointmentEvent(
      childName,
      appointmentType,
      appointmentDate,
      practitioner ?? undefined,
      location ?? undefined
    );

    await createGoogleCalendarEvent(accessToken, event);
  } catch {
    // Silent failure — calendar sync is best-effort
  }
}

/**
 * Best-effort sync: creates a Google Calendar event for a fiscal deadline.
 */
export async function syncFiscalDeadlineToCalendar(
  userId: string,
  title: string,
  dueDate: string
): Promise<void> {
  try {
    const accessToken = await getValidAccessToken(userId);
    if (!accessToken) return;

    const event = buildFiscalDeadlineEvent(title, dueDate);
    await createGoogleCalendarEvent(accessToken, event);
  } catch {
    // Silent failure
  }
}
