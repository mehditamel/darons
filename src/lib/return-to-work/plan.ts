import { z } from "zod";
import {
  addCalendarDays,
  foldCalendarLine,
  localCalendarDate,
} from "@/lib/family-plan/plan";

export const REPRISE_STORAGE_NAME = "darons.return-to-work.v1";
export const MAX_REPRISE_BYTES = 24 * 1024;
export const DAYS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
] as const;
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Renseigne un horaire valide.");
const optionalTime = z.union([z.literal(""), time]);
const date = z
  .string()
  .regex(/^20\d{2}-\d{2}-\d{2}$/, "Choisis une date entre 2000 et 2099.")
  .refine((value) => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Choisis une date valide.");
export const TOPICS = {
  hours: "Horaires, déplacements et réunions",
  workload: "Priorités et charge de travail à la reprise",
  benefits: "Aides, contacts et dispositifs de l’entreprise",
  leave: "Dates de congé et démarches à vérifier avec les RH",
  training: "Évolutions du poste et besoins de formation",
} as const;
const topic = z.enum(["hours", "workload", "benefits", "leave", "training"]);
const rowSchema = z
  .object({
    day: z.number().int().min(0).max(6),
    active: z.boolean(),
    workStart: optionalTime,
    workEnd: optionalTime,
    travel: z.number().int().min(0).max(180),
    careStart: optionalTime,
    careEnd: optionalTime,
  })
  .strict();
export type WorkDay = z.infer<typeof rowSchema>;
export const toMinutes = (value: string) =>
  Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
export const clockLabel = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")} h ${String(minutes % 60).padStart(2, "0")}`;
export const durationLabel = (minutes: number) =>
  minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${String(minutes % 60).padStart(2, "0")}` : ""}`;
export const dateLabel = (value: string) =>
  value.split("-").reverse().join("/");

export const profileSchema = z
  .object({
    returnDate: date.refine(
      (value) => value <= "2099-12-01",
      "Choisis une reprise au plus tard le 1er décembre 2099.",
    ),
    careStatus: z.enum(["confirmed", "pending", "searching"]),
    backup: z.enum(["yes", "no", "unknown"]),
    topics: z
      .array(topic)
      .min(1, "Choisis au moins un sujet pour ton échange professionnel.")
      .max(5)
      .refine((items) => new Set(items).size === items.length),
    days: z
      .array(rowSchema)
      .length(7)
      .refine(
        (rows) => rows.every((row, index) => row.day === index),
        "Les jours de la semaine sont incohérents.",
      ),
  })
  .strict()
  .superRefine((profile, ctx) => {
    const issue = (message: string, path: (string | number)[]) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, message, path });
    if (!profile.days.some((row) => row.active))
      issue("Choisis au moins un jour travaillé.", ["days"]);
    for (const row of profile.days.filter((item) => item.active)) {
      const prefix = `${DAYS[row.day]} : `;
      if (!row.workStart || !row.workEnd) {
        issue(prefix + "précise le début et la fin du travail.", [
          "days",
          row.day,
          "workStart",
        ]);
        continue;
      }
      const start = toMinutes(row.workStart),
        end = toMinutes(row.workEnd);
      if (end <= start || start - row.travel < 0 || end + row.travel > 1440) {
        issue(
          prefix +
            "cette version prévoit le travail et les trajets dans une même journée. Vérifie les horaires.",
          ["days", row.day, "workEnd"],
        );
      }
      if (Boolean(row.careStart) !== Boolean(row.careEnd))
        issue(
          prefix +
            "renseigne les deux horaires de garde, ou laisse-les tous les deux vides.",
          ["days", row.day, "careStart"],
        );
      if (
        row.careStart &&
        row.careEnd &&
        toMinutes(row.careEnd) <= toMinutes(row.careStart)
      )
        issue(
          prefix + "la fin de garde doit être après le début, le même jour.",
          ["days", row.day, "careEnd"],
        );
    }
  });
export type WorkProfile = z.infer<typeof profileSchema>;
export const ACTION_IDS = [
  "care",
  "meeting",
  "backup",
  "handoff",
  "week",
  "month",
] as const;
const actionSchema = z
  .object({ id: z.enum(ACTION_IDS), date, done: z.boolean() })
  .strict();
export const workPlanSchema = z
  .object({
    version: z.literal(1),
    fromExample: z.boolean().default(false),
    id: z.string().uuid(),
    profile: profileSchema,
    actions: z
      .array(actionSchema)
      .length(6)
      .refine((items) =>
        ACTION_IDS.every(
          (id) => items.filter((item) => item.id === id).length === 1,
        ),
      ),
  })
  .strict();
export type WorkPlan = z.infer<typeof workPlanSchema>;

export function blankProfile(): WorkProfile {
  return {
    returnDate: "",
    careStatus: "pending",
    backup: "unknown",
    topics: ["hours", "workload", "benefits"],
    days: DAYS.map((_, day) => ({
      day,
      active: day < 5,
      workStart: "",
      workEnd: "",
      travel: 0,
      careStart: "",
      careEnd: "",
    })),
  };
}
export function exampleProfile(now = new Date()): WorkProfile {
  const profile = blankProfile();
  return {
    ...profile,
    returnDate: addCalendarDays(localCalendarDate(now), 28),
    careStatus: "confirmed",
    backup: "no",
    days: profile.days.map((row) => ({
      ...row,
      workStart: "09:00",
      workEnd: "17:30",
      travel: 30,
      careStart: "08:00",
      careEnd: "17:00",
    })),
  };
}

export function coverage(profile: WorkProfile) {
  const validated = profileSchema.parse(profile);
  return validated.days
    .filter((row) => row.active)
    .map((row) => {
      const start = toMinutes(row.workStart) - row.travel;
      const end = toMinutes(row.workEnd) + row.travel;
      if (!row.careStart || !row.careEnd)
        return {
          day: row.day,
          start,
          end,
          missing: null,
          gaps: [] as { start: number; end: number }[],
        };
      const careStart = toMinutes(row.careStart),
        careEnd = toMinutes(row.careEnd);
      const gaps = [
        { start, end: Math.min(end, careStart) },
        { start: Math.max(start, careEnd), end },
      ].filter((gap) => gap.end > gap.start);
      return {
        day: row.day,
        start,
        end,
        missing: gaps.reduce((total, gap) => total + gap.end - gap.start, 0),
        gaps,
      };
    });
}

export function createWorkPlan(
  profile: WorkProfile,
  id: string,
  now = new Date(),
  fromExample = false,
): WorkPlan {
  const validated = profileSchema.parse(profile);
  const today = localCalendarDate(now);
  const offsets = [-21, -14, -7, -3, 7, 30];
  return workPlanSchema.parse({
    version: 1,
    fromExample,
    id,
    profile: validated,
    actions: ACTION_IDS.map((actionId, index) => {
      const suggested = addCalendarDays(validated.returnDate, offsets[index]);
      return {
        id: actionId,
        done: false,
        date: suggested < today ? today : suggested,
      };
    }),
  });
}

export function actionDetails(
  id: (typeof ACTION_IDS)[number],
  profile: WorkProfile,
) {
  const gapCount = coverage(profile).filter(
    (row) => row.missing !== null && row.missing > 0,
  ).length;
  const details = {
    care: {
      title:
        profile.careStatus === "searching"
          ? "Identifier une solution de garde"
          : gapCount
            ? "Résoudre les créneaux non couverts"
            : "Confirmer l’accueil et ses horaires",
      text: gapCount
        ? `${gapCount} journée(s) présentent un décalage. Choisis avec la personne qui garde ton enfant un horaire, un relais ou un ajustement à discuter au travail.`
        : "Vérifie les jours, les horaires, la date de début et le temps d’adaptation avec la structure ou la personne concernée. Un horaire saisi n’est pas une place réservée.",
      href: "/outils/simulateur-garde",
      link: "Estimer le coût de garde",
    },
    meeting: {
      title: "Préparer l’échange avec les RH ou le manager",
      text: "Utilise le document professionnel ci-dessous pour discuter des priorités, des horaires et des aides. Vérifie les congés et les éventuelles démarches de reprise applicables à ta situation.",
      href: "#document-rh",
      link: "Préparer mon document",
    },
    backup: {
      title:
        profile.backup === "yes"
          ? "Confirmer le relais en cas d’imprévu"
          : "Prévoir quoi faire en cas d’imprévu",
      text:
        profile.backup === "yes"
          ? "Demande l’accord du relais, vérifie sa disponibilité et choisis comment le joindre. Prévois aussi les moments où il ne sera pas disponible."
          : "Si aucun proche ne peut aider, identifie les solutions avec le mode de garde et le contact à prévenir au travail. Ne suppose pas qu’une personne sera disponible.",
      href: "/outils/plan-famille",
      link: "Organiser les prochaines actions",
    },
    handoff: {
      title: "Tester une journée et préparer le relais",
      text: "Teste le trajet, le dépôt et la récupération avec une marge réaliste. Prépare les informations utiles à la garde dans le Carnet de Confiance et choisis ce que tu transmets.",
      href: "/confiance",
      link: "Ouvrir mon Carnet de Confiance",
    },
    week: {
      title: "Faire le point après la première semaine",
      text: "Reprends les horaires réellement vécus : quels trajets débordent, quel relais manque, quelles priorités professionnelles sont à ajuster ? Note un changement concret à essayer.",
      href: "#semaine",
      link: "Revoir mon organisation",
    },
    month: {
      title: "Ajuster l’organisation après un mois",
      text: "Vérifie avec les personnes concernées ce qui fonctionne et ce qui doit changer. Revois la charge de travail, le mode de garde et la répartition des trajets.",
      href: "#document-rh",
      link: "Reprendre les sujets de discussion",
    },
  };
  return details[id];
}

export function employerBrief(
  plan: WorkPlan,
  selectedTopics: WorkProfile["topics"],
): string {
  const validated = workPlanSchema.parse(plan);
  const topics = z.array(topic).max(5).parse(selectedTopics);
  const questions = {
    hours:
      "Quels horaires, déplacements et créneaux de réunion pouvons-nous convenir ? Quelles adaptations sont envisageables et comment les confirmer ?",
    workload:
      "Quelles sont les trois priorités à la reprise ? Quelles tâches peuvent attendre ? Quand faisons-nous un premier point sur la charge ?",
    benefits:
      "Quels dispositifs, aides à la garde, contacts RH ou services du CSE sont accessibles ? Quelles conditions et démarches faut-il vérifier ?",
    leave:
      "Pouvons-nous confirmer les dates et les formalités de congé, ainsi que les démarches de reprise applicables à ma situation ?",
    training:
      "Qu’est-ce qui a changé pendant mon absence ? Quels points de formation ou d’évolution du poste devons-nous aborder ?",
  };
  return [
    validated.fromExample
      ? "EXEMPLE À ADAPTER — Préparer ma reprise"
      : "Préparer ma reprise — document de discussion",
    `Date de reprise envisagée : ${dateLabel(validated.profile.returnDate)} (à confirmer ensemble)`,
    "",
    ...topics.map(
      (key) =>
        `${TOPICS[key]}\n${questions[key]}\nDécision / responsable / prochaine date : à compléter ensemble.\n`,
    ),
    "Prochain point de suivi : à convenir ensemble.",
    "Document préparatoire personnel. Il ne constitue ni une demande formelle de congé ni un accord de l’employeur.",
  ].join("\n");
}

export function personalSummary(plan: WorkPlan): string {
  const validated = workPlanSchema.parse(plan);
  return [
    validated.fromExample
      ? "EXEMPLE À ADAPTER — Ma reprise Darons"
      : "Ma reprise Darons — récapitulatif personnel",
    `Reprise envisagée : ${dateLabel(validated.profile.returnDate)}`,
    "Horaires saisis, à confirmer avec les personnes concernées.",
    ...coverage(validated.profile).map(
      (row) =>
        `${DAYS[row.day]} : besoin de relais de ${clockLabel(row.start)} à ${clockLabel(row.end)} — ${row.missing === null ? "horaires de garde à préciser" : row.missing ? `${durationLabel(row.missing)} à organiser` : "pas de décalage horaire identifié"}.`,
    ),
    `Solution de garde : ${validated.profile.careStatus === "confirmed" ? "déclarée confirmée" : "à confirmer"}.`,
    "",
    ...validated.actions.map(
      (action) =>
        `${action.done ? "[fait]" : "[à faire]"} ${dateLabel(action.date)} — ${actionDetails(action.id, validated.profile).title}`,
    ),
    "Dates d’organisation choisies, sans valeur d’échéance légale. Ce récapitulatif contient des informations familiales ; choisis à qui tu le transmets.",
  ].join("\n");
}

export function exportWorkCalendar(plan: WorkPlan, now = new Date()): string {
  const validated = workPlanSchema.parse(plan);
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Darons.app//Ma reprise//FR",
    "CALSCALE:GREGORIAN",
  ];
  for (const action of validated.actions.filter((item) => !item.done)) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${validated.id}-${action.id}@darons.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${action.date.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${addCalendarDays(action.date, 1).replace(/-/g, "")}`,
      `SUMMARY:${validated.fromExample ? "[Exemple] " : ""}${actionDetails(action.id, validated.profile).title}`,
      "DESCRIPTION:Repère personnel Darons à adapter. Ce n’est pas une échéance légale.",
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  return (
    [...lines, "END:VCALENDAR"].map(foldCalendarLine).join("\r\n") + "\r\n"
  );
}
export function parseWorkPlan(text: string): WorkPlan {
  if (new TextEncoder().encode(text).length > MAX_REPRISE_BYTES)
    throw new Error("La sauvegarde dépasse 24 Ko.");
  try {
    return workPlanSchema.parse(JSON.parse(text));
  } catch {
    throw new Error(
      "Cette sauvegarde de reprise est illisible ou incompatible. Le parcours actuel est conservé.",
    );
  }
}
