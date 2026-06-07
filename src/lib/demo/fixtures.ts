// Données fictives pour le mode démo public (/demo).
// Aucune donnée réelle, aucune requête base : on alimente les composants
// présentationnels du dashboard pour donner un aperçu sans inscription.
import type { FamilyMember } from "@/types/family";

const DEMO_HOUSEHOLD_ID = "demo-household";

export const DEMO_MEMBERS: FamilyMember[] = [
  {
    id: "demo-mehdi",
    householdId: DEMO_HOUSEHOLD_ID,
    firstName: "Mehdi",
    lastName: "Démo",
    birthDate: "1990-03-15",
    gender: "M",
    memberType: "adult",
    photoUrl: null,
    notes: null,
    gestationalAgeWeeks: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "demo-yasmine",
    householdId: DEMO_HOUSEHOLD_ID,
    firstName: "Yasmine",
    lastName: "Démo",
    birthDate: "1993-05-15",
    gender: "F",
    memberType: "adult",
    photoUrl: null,
    notes: null,
    gestationalAgeWeeks: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "demo-matis",
    householdId: DEMO_HOUSEHOLD_ID,
    firstName: "Matis",
    lastName: "Démo",
    birthDate: "2025-03-10",
    gender: "M",
    memberType: "child",
    photoUrl: null,
    notes: null,
    gestationalAgeWeeks: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

export const DEMO_WEATHER = {
  health: { label: "Santé", status: "good" as const, detail: "Vaccins à jour" },
  budget: { label: "Budget", status: "warning" as const, detail: "+182 € ce mois" },
  admin: { label: "Admin", status: "alert" as const, detail: "1 doc expire bientôt" },
};

export const DEMO_STATS = [
  { label: "Famille", value: "3 membres", tone: "teal" },
  { label: "Vaccins", value: "100%", trend: "8/8 doses", tone: "orange" },
  { label: "Identité", value: "2", trend: "1 expire bientôt", tone: "blue" },
  { label: "Coffre-fort", value: "5 docs", tone: "purple" },
] as const;

export const DEMO_ALERTS = [
  {
    category: "identite",
    title: "Carte d'identité de Yasmine",
    message: "Elle expire dans 2 mois — pense à lancer le renouvellement.",
  },
  {
    category: "sante",
    title: "Examen des 16-18 mois de Matis",
    message: "À planifier avec le pédiatre dans les prochaines semaines.",
  },
  {
    category: "fiscal",
    title: "Déclaration de revenus 2025",
    message: "Avec Matis, tu pourrais économiser ~3 850 € cette année.",
  },
] as const;
