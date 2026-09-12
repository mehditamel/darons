import {
  familyPlanSchema,
  familyProfileSchema,
  type FamilyPlan,
  type FamilyProfile,
} from "@/lib/validators/family-plan";
import { getMission, OWNER_LABELS, selectMissions } from "./catalog";

export const PLAN_STORAGE_NAME = "darons.family-plan.v1";
export const MAX_PLAN_BYTES = 64 * 1024;

export function localCalendarDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function addCalendarDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createFamilyPlan(
  profile: FamilyProfile,
  id: string,
  now = new Date(),
): FamilyPlan {
  const validated = familyProfileSchema.parse(profile);
  return familyPlanSchema.parse({
    version: 1,
    id,
    createdAt: now.toISOString(),
    profile: validated,
    missions: selectMissions(validated).map((mission, index) => ({
      id: mission.id,
      owner: "undecided",
      date: addCalendarDays(localCalendarDate(now), index * 2 + 1),
      completed: [false, false, false],
    })),
  });
}

export function parseFamilyPlan(text: string): FamilyPlan {
  if (new TextEncoder().encode(text).length > MAX_PLAN_BYTES)
    throw new Error("Cette sauvegarde est trop volumineuse (64 Ko maximum).");
  try {
    return familyPlanSchema.parse(JSON.parse(text));
  } catch {
    throw new Error(
      "Cette sauvegarde Darons est illisible ou incompatible. Le plan actuel est conservé.",
    );
  }
}

export function planHandoff(plan: FamilyPlan): string {
  const pending = plan.missions.filter(
    (state) => !state.completed.every(Boolean),
  );
  return [
    "Mon plan Darons — à se répartir ensemble",
    "Les jours proposés sont à confirmer avec la personne concernée.",
    ...pending.map((state) => {
      const mission = getMission(state.id);
      const date = state.date
        ? state.date.split("-").reverse().join("/")
        : "à choisir";
      return `\n${mission.title} (${mission.minutes} min environ)\nResponsable proposé : ${OWNER_LABELS[state.owner]}\nJour choisi : ${date}\n${mission.steps.map((step, index) => `${state.completed[index] ? "[fait]" : "[à faire]"} ${step}`).join("\n")}${mission.href ? `\nOutil : https://darons.app${mission.href}` : ""}`;
    }),
  ].join("\n");
}

function escapeCalendarText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

// RFC 5545: fold on UTF-8 octet boundaries, including the continuation space.
export function foldCalendarLine(line: string): string {
  const encoder = new TextEncoder();
  let result = "";
  let size = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    if (size + length > 75) {
      result += "\r\n ";
      size = 1;
    }
    result += character;
    size += length;
  }
  return result;
}

export function exportPlanCalendar(plan: FamilyPlan, now = new Date()): string {
  const validated = familyPlanSchema.parse(plan);
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Darons.app//Mon plan Darons//FR",
    "CALSCALE:GREGORIAN",
  ];
  for (const state of validated.missions) {
    if (!state.date || state.completed.every(Boolean)) continue;
    const mission = getMission(state.id);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${validated.id}-${state.id}@darons.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${state.date.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${addCalendarDays(state.date, 1).replace(/-/g, "")}`,
      `SUMMARY:${escapeCalendarText(mission.title)}`,
      `DESCRIPTION:${escapeCalendarText(planHandoff({ ...validated, missions: [state] }))}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  return (
    [...lines, "END:VCALENDAR"].map(foldCalendarLine).join("\r\n") + "\r\n"
  );
}
