// Google Calendar sync integration
// Uses Google Calendar API v3 REST endpoints

interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
}

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEvent,
  calendarId: string = "primary"
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error?.message ?? `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, eventId: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur création événement";
    return { success: false, error: message };
  }
}

export async function listGoogleCalendarEvents(
  accessToken: string,
  calendarId: string = "primary",
  timeMin?: string,
  timeMax?: string
): Promise<{ success: boolean; events?: CalendarEvent[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (timeMin) params.set("timeMin", timeMin);
    if (timeMax) params.set("timeMax", timeMax);
    params.set("singleEvents", "true");
    params.set("orderBy", "startTime");

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, events: data.items };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur récupération événements";
    return { success: false, error: message };
  }
}

// Build a calendar event from app data (medical appointment, vaccine reminder, etc.)
export function buildMedicalAppointmentEvent(
  childName: string,
  appointmentType: string,
  dateTime: string,
  practitioner?: string,
  location?: string
): CalendarEvent {
  const start = new Date(dateTime);
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min default

  return {
    summary: `${appointmentType} — ${childName}`,
    description: [
      practitioner && `Praticien : ${practitioner}`,
      location && `Lieu : ${location}`,
      "Créé par Darons",
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: start.toISOString(), timeZone: "Europe/Paris" },
    end: { dateTime: end.toISOString(), timeZone: "Europe/Paris" },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 60 },
        { method: "email", minutes: 1440 }, // 24h before
      ],
    },
  };
}

export function buildFiscalDeadlineEvent(
  title: string,
  dueDate: string
): CalendarEvent {
  const date = new Date(dueDate);
  date.setHours(9, 0, 0, 0);
  const end = new Date(date.getTime() + 60 * 60 * 1000);

  return {
    summary: `[Fiscal] ${title}`,
    description: "Rappel échéance fiscale — Darons",
    start: { dateTime: date.toISOString(), timeZone: "Europe/Paris" },
    end: { dateTime: end.toISOString(), timeZone: "Europe/Paris" },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 1440 }, // 24h before
        { method: "email", minutes: 10080 }, // 7 days before
      ],
    },
  };
}
