import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { getValidAccessToken } from "@/lib/integrations/google-calendar";
import {
  createGoogleCalendarEvent,
  listGoogleCalendarEvents,
  buildMedicalAppointmentEvent,
  buildFiscalDeadlineEvent,
} from "@/lib/integrations/calendar-sync";
import { createCalendarEventSchema } from "@/lib/validators/calendar";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limited = rateLimit(`calendar-events:${user.id}`, 20, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques secondes." },
      { status: 429 }
    );
  }

  try {
  const body = await request.json();
  const parsed = createCalendarEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const accessToken = await getValidAccessToken(user.id);
  if (!accessToken) {
    return NextResponse.json(
      { error: "Calendrier non connecté. Connectez Google Calendar dans les paramètres." },
      { status: 400 }
    );
  }

  const { type, entityId } = parsed.data;

  if (type === "medical") {
    const { data: appointment } = await supabase
      .from("medical_appointments")
      .select("appointment_type, appointment_date, practitioner, location, member_id")
      .eq("id", entityId)
      .single();

    if (!appointment) {
      return NextResponse.json({ error: "RDV introuvable" }, { status: 404 });
    }

    const { data: member } = await supabase
      .from("family_members")
      .select("first_name")
      .eq("id", appointment.member_id)
      .single();

    const event = buildMedicalAppointmentEvent(
      member?.first_name ?? "Enfant",
      appointment.appointment_type,
      appointment.appointment_date,
      appointment.practitioner ?? undefined,
      appointment.location ?? undefined
    );

    const result = await createGoogleCalendarEvent(accessToken, event);
    if (!result.success) {
      return NextResponse.json(
        { error: "Impossible de créer l'événement dans Google Calendar" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, eventId: result.eventId });
  }

  if (type === "fiscal") {
    const { data: fiscalYear } = await supabase
      .from("fiscal_years")
      .select("year, notes")
      .eq("id", entityId)
      .single();

    if (!fiscalYear) {
      return NextResponse.json({ error: "Données fiscales introuvables" }, { status: 404 });
    }

    const title = fiscalYear.notes ?? `Échéance fiscale ${fiscalYear.year}`;
    const dueDate = `${fiscalYear.year}-05-25`;
    const event = buildFiscalDeadlineEvent(title, dueDate);

    const result = await createGoogleCalendarEvent(accessToken, event);
    if (!result.success) {
      return NextResponse.json(
        { error: "Impossible de créer l'événement dans Google Calendar" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, eventId: result.eventId });
  }

  return NextResponse.json({ error: "Type non supporté" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limited = rateLimit(`calendar-events:${user.id}`, 20, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques secondes." },
      { status: 429 }
    );
  }

  try {
    const accessToken = await getValidAccessToken(user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: "Calendrier non connecté" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin") ?? undefined;
    const timeMax = searchParams.get("timeMax") ?? undefined;

    const result = await listGoogleCalendarEvents(accessToken, "primary", timeMin, timeMax);
    if (!result.success) {
      return NextResponse.json(
        { error: "Impossible de récupérer les événements" },
        { status: 502 }
      );
    }

    return NextResponse.json({ events: result.events });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
