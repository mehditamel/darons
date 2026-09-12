import { addMonths, format, isValid, parseISO, startOfDay } from "date-fns";
import { VACCINATION_SCHEDULE } from "@/lib/constants";

export const VACCINATION_REFERENCE_YEAR = 2026;
export const VACCINATION_REFERENCE_URL = "https://vaccination-info-service.fr/La-vaccination-au-cours-de-la-vie/Nourrissons-et-enfants-de-la-naissance-a-10-ans";

// Reference for the PUBLIC infant tool. Historical medical records and their
// reminder rules must be reviewed separately, with the child's vaccination history.
export const PUBLIC_INFANT_VACCINATIONS = [
  ...VACCINATION_SCHEDULE.filter((vaccine) => vaccine.code !== "MenC"),
  { code: "MenACWY", name: "Méningocoques ACWY", doses: [
    { doseNumber: 1, ageMonths: 6, label: "6 mois" },
    { doseNumber: 2, ageMonths: 12, label: "12 mois" },
  ] },
  { code: "MenB", name: "Méningocoque B", doses: [
    { doseNumber: 1, ageMonths: 3, label: "3 mois" },
    { doseNumber: 2, ageMonths: 5, label: "5 mois" },
    { doseNumber: 3, ageMonths: 12, label: "12 mois" },
  ] },
];

export function publicVaccinationDates(value: string, today = new Date()) {
  if (!value) return { error: null, dates: null };
  const birth = parseISO(value);
  if (!isValid(birth) || format(birth, "yyyy-MM-dd") !== value) return { error: "Saisis une date de naissance valide.", dates: null };
  if (birth > startOfDay(today)) return { error: "La date de naissance ne peut pas être dans le futur.", dates: null };
  if (value < "2025-01-01") return { error: "Cet outil présente le schéma du nourrisson depuis 2025. Pour un enfant né avant cette date, fais vérifier son carnet et les éventuels rattrapages par un professionnel de santé.", dates: null };
  return { error: null, dates: PUBLIC_INFANT_VACCINATIONS.flatMap((vaccine) => vaccine.doses.map((dose) => ({
    ...dose, vaccineCode: vaccine.code, vaccineName: vaccine.name,
    scheduledDate: addMonths(birth, dose.ageMonths),
    isPast: addMonths(birth, dose.ageMonths) < startOfDay(today),
  }))).sort((a, b) => a.ageMonths - b.ageMonths) };
}
