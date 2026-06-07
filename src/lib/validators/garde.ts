import { z } from "zod";

const structureTypes = [
  "creche",
  "micro_creche",
  "assistante_maternelle",
  "mam",
  "accueil_loisirs",
  "relais_pe",
] as const;

const favoriteStatuses = [
  "shortlisted",
  "contacted",
  "visited",
  "enrolled",
  "rejected",
] as const;

export const childcareSearchSchema = z.object({
  query: z
    .string()
    .min(2, "Saisissez au moins 2 caractères")
    .max(200, "Maximum 200 caractères"),
  structureType: z.enum(structureTypes).optional(),
  rayonKm: z.number().min(1).max(50).default(10),
});

export type ChildcareSearchFormData = z.infer<typeof childcareSearchSchema>;

export const childcareFavoriteSchema = z.object({
  structureId: z.string().uuid("Structure invalide"),
  notes: z.string().max(500, "Maximum 500 caractères").nullable().default(null),
  status: z.enum(favoriteStatuses).default("shortlisted"),
});

export type ChildcareFavoriteFormData = z.infer<typeof childcareFavoriteSchema>;

export const gardeCostSimulationSchema = z
  .object({
    modeGarde: z.enum(["creche", "assistante_maternelle", "garde_domicile"], {
      required_error: "Le mode de garde est requis",
    }),
    coutMensuelBrut: z
      .number({ required_error: "Le coût mensuel est requis" })
      .min(0, "Le coût ne peut pas être négatif")
      .default(0),
    revenuAnnuel: z
      .number({ required_error: "Le revenu annuel est requis" })
      .min(0, "Le revenu ne peut pas être négatif"),
    nbEnfantsGardes: z
      .number()
      .int()
      .min(1, "Au moins 1 enfant")
      .max(10)
      .default(1),
    // Calcul précis du CMG réformé (assistante maternelle / garde à domicile).
    heuresMensuelles: z
      .number()
      .min(0, "Le nombre d'heures ne peut pas être négatif")
      .max(744, "Maximum 744 heures par mois")
      .optional(),
    coutHoraireReel: z
      .number()
      .min(0, "Le coût horaire ne peut pas être négatif")
      .optional(),
    parentIsole: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const isEmploiDirect =
      data.modeGarde === "assistante_maternelle" ||
      data.modeGarde === "garde_domicile";
    const hasHourly = !!data.heuresMensuelles && !!data.coutHoraireReel;

    if (isEmploiDirect) {
      // Emploi direct : on attend heures + coût horaire (calcul réformé).
      if (!hasHourly) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["heuresMensuelles"],
          message: "Renseigne les heures de garde et le coût horaire.",
        });
      }
    } else if (data.coutMensuelBrut <= 0) {
      // Crèche / micro-crèche : coût mensuel requis.
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coutMensuelBrut"],
        message: "Le coût mensuel est requis.",
      });
    }
  });

export type GardeCostSimulationFormData = z.infer<typeof gardeCostSimulationSchema>;
