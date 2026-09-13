import { z } from "zod";
import { FOCUSES, MISSIONS, OWNERS, STAGES } from "@/lib/family-plan/catalog";

export const familyProfileSchema = z
  .object({
    stages: z
      .array(z.enum(STAGES))
      .min(1, "Choisis au moins une étape.")
      .max(4)
      .refine((items) => new Set(items).size === items.length),
    focus: z.enum(FOCUSES),
    minutes: z.union([z.literal(10), z.literal(20), z.literal(40)]),
  })
  .strict();

export const calendarDateSchema = z
  .string()
  .regex(/^20\d{2}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Choisis une date valide entre 2000 et 2099.");

const missionStateSchema = z
  .object({
    id: z
      .string()
      .max(60)
      .refine((id) => MISSIONS.some((mission) => mission.id === id)),
    owner: z.enum(OWNERS),
    date: calendarDateSchema.or(z.literal("")),
    completed: z.tuple([z.boolean(), z.boolean(), z.boolean()]),
  })
  .strict();

export const familyPlanSchema = z
  .object({
    version: z.literal(1),
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
    profile: familyProfileSchema,
    missions: z.array(missionStateSchema).min(1).max(3),
  })
  .strict()
  .superRefine((plan, context) => {
    const ids = plan.missions.map((item) => item.id);
    const definitions = plan.missions.map((item) =>
      MISSIONS.find((mission) => mission.id === item.id),
    );
    if (
      new Set(ids).size !== ids.length ||
      definitions.some(
        (mission) =>
          !mission ||
          mission.focus !== plan.profile.focus ||
          !mission.stages.some((stage) => plan.profile.stages.includes(stage)),
      ) ||
      definitions.reduce(
        (total, mission) => total + (mission?.minutes ?? 0),
        0,
      ) > plan.profile.minutes
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cette sauvegarde ne contient pas un plan cohérent.",
      });
    }
  });

export type FamilyProfile = z.infer<typeof familyProfileSchema>;
export type MissionState = z.infer<typeof missionStateSchema>;
export type FamilyPlan = z.infer<typeof familyPlanSchema>;
