import { z } from "zod";
import {
  DAYS,
  clockLabel,
  coverage,
  dateLabel,
  durationLabel,
  profileSchema,
  toMinutes,
  type WorkProfile,
} from "./plan";

const minutes = z.number().int().min(0).max(180);
const adjustmentSchema = z
  .object({
    days: z
      .array(z.number().int().min(0).max(6))
      .min(1)
      .max(7)
      .refine((days) => new Set(days).size === days.length),
    workShift: z.number().int().min(-180).max(180),
    travel: minutes.nullable(),
    careEarlier: minutes,
    careLater: minutes,
  })
  .strict();
export type WorkAdjustment = z.infer<typeof adjustmentSchema>;

function shiftedTime(time: string, offset: number, day: number): string {
  const value = toMinutes(time) + offset;
  if (value < 0 || value >= 1440)
    throw new Error(
      `${DAYS[day]} : cet ajustement dépasse la journée. Réduis le décalage ou l’extension de garde.`,
    );
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

/** A comparison only: never updates the saved plan or confirms a care arrangement. */
export function compareWorkScenario(
  profile: WorkProfile,
  input: WorkAdjustment,
) {
  const current = profileSchema.parse(profile);
  const parsed = adjustmentSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      "Choisis au moins un jour travaillé et des durées entières entre 0 et 180 minutes (décalage : −180 à 180).",
    );
  const adjustment = parsed.data;
  if (adjustment.days.some((day) => !current.days[day].active))
    throw new Error(
      "Le scénario doit concerner uniquement des jours travaillés.",
    );
  const proposed = profileSchema.safeParse({
    ...current,
    careStatus: "pending",
    days: current.days.map((day) =>
      !adjustment.days.includes(day.day)
        ? day
        : {
            ...day,
            workStart: shiftedTime(
              day.workStart,
              adjustment.workShift,
              day.day,
            ),
            workEnd: shiftedTime(day.workEnd, adjustment.workShift, day.day),
            travel: adjustment.travel ?? day.travel,
            careStart: day.careStart
              ? shiftedTime(day.careStart, -adjustment.careEarlier, day.day)
              : "",
            careEnd: day.careEnd
              ? shiftedTime(day.careEnd, adjustment.careLater, day.day)
              : "",
          },
    ),
  });
  if (!proposed.success)
    throw new Error(
      proposed.error.issues.map((issue) => issue.message).join(" "),
    );
  const before = coverage(current);
  const after = coverage(proposed.data);
  const rows = before
    .filter((row) => adjustment.days.includes(row.day))
    .map((row) => ({
      day: row.day,
      before: row,
      after: after.find((item) => item.day === row.day)!,
      current: current.days[row.day],
      proposed: proposed.data.days[row.day],
    }));
  return {
    rows,
    beforeMinutes: rows.reduce(
      (total, row) => total + (row.before.missing ?? 0),
      0,
    ),
    afterMinutes: rows.reduce(
      (total, row) => total + (row.after.missing ?? 0),
      0,
    ),
    knownDays: rows.filter((row) => row.before.missing !== null).length,
    unknownDays: rows.filter((row) => row.before.missing === null).length,
  };
}
export type WorkComparison = ReturnType<typeof compareWorkScenario>;

export function scenarioOutcome(comparison: WorkComparison): string {
  if (!comparison.knownDays)
    return "Horaires de garde inconnus : impossible de mesurer l’effet.";
  const delta = comparison.beforeMinutes - comparison.afterMinutes;
  if (!delta) return "Même durée à organiser avec cette hypothèse.";
  return `${durationLabel(Math.abs(delta))} ${delta > 0 ? "de moins" : "de plus"} à organiser sur les jours comparables.`;
}

export function scenarioSummary(
  profile: WorkProfile,
  adjustment: WorkAdjustment,
  fromExample: boolean,
): string {
  const result = compareWorkScenario(profile, adjustment);
  const hours = (start: string, end: string) =>
    start && end
      ? `${clockLabel(toMinutes(start))}–${clockLabel(toMinutes(end))}`
      : "inconnus";
  const gap = (value: number | null) =>
    value === null ? "à préciser" : durationLabel(value);
  return [
    fromExample
      ? "EXEMPLE FICTIF — Hypothèse de reprise Darons"
      : "Hypothèse de reprise Darons — à discuter",
    `Reprise envisagée : ${dateLabel(profile.returnDate)}`,
    "Aucun horaire proposé n’est un accord. Cette simulation ne modifie pas mon parcours.",
    "",
    ...result.rows.map((row) =>
      [
        DAYS[row.day],
        `Travail : ${hours(row.current.workStart, row.current.workEnd)} → ${hours(row.proposed.workStart, row.proposed.workEnd)}`,
        `Trajet aller : ${row.current.travel} min → ${row.proposed.travel} min`,
        `Garde : ${hours(row.current.careStart, row.current.careEnd)} → ${hours(row.proposed.careStart, row.proposed.careEnd)}`,
        `Temps à organiser : ${gap(row.before.missing)} → ${gap(row.after.missing)}`,
        row.after.gaps.length
          ? `Créneaux restants : ${row.after.gaps.map((item) => `${clockLabel(item.start)}–${clockLabel(item.end)}`).join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    "",
    scenarioOutcome(result),
    result.unknownDays
      ? `${result.unknownDays} jour(s) de garde inconnue exclus de la comparaison des durées.`
      : "",
    "À confirmer ensemble : horaires possibles, accord des personnes concernées, coût éventuel et marge de trajet.",
    "Ce document personnel contient des horaires familiaux. Choisir son destinataire ; le document professionnel séparé est disponible dans Ma reprise.",
  ]
    .filter((line) => line !== "")
    .join("\n\n");
}
