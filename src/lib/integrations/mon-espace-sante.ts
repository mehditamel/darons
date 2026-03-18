/**
 * Mon Espace Santé — Préparation intégration FHIR/HL7
 *
 * L'API Mon Espace Santé utilise le standard FHIR R4 (HL7).
 * L'intégration nécessite un référencement auprès de l'ANS
 * (Agence du Numérique en Santé).
 *
 * Prérequis pour l'intégration :
 * 1. Référencement auprès de l'ANS (dossier de conformité)
 * 2. Certification HDS (Hébergeur de Données de Santé)
 * 3. Respect du cadre d'interopérabilité des systèmes de santé (CI-SIS)
 * 4. Implémentation du protocole d'authentification Pro Santé Connect
 *
 * Ressources FHIR ciblées :
 * - Patient : données démographiques de l'enfant
 * - Immunization : vaccinations administrées
 * - Observation : mesures de croissance (poids, taille, PC)
 * - DocumentReference : documents du DMP (ordonnances, CR)
 *
 * Calendrier prévisionnel :
 * - API FHIR Mon Espace Santé : disponibilité fin 2026
 * - Intégration Cockpit Parental : à planifier après référencement ANS
 */

// FHIR R4 types (simplified subset)

export interface FHIRPatient {
  resourceType: "Patient";
  id: string;
  name: Array<{
    family: string;
    given: string[];
  }>;
  birthDate: string;
  gender: "male" | "female";
}

export interface FHIRImmunization {
  resourceType: "Immunization";
  id: string;
  patient: { reference: string };
  vaccineCode: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  occurrenceDateTime: string;
  status: "completed" | "entered-in-error" | "not-done";
  doseQuantity?: {
    value: number;
    unit: string;
  };
}

export interface FHIRObservation {
  resourceType: "Observation";
  id: string;
  subject: { reference: string };
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  valueQuantity: {
    value: number;
    unit: string;
  };
  effectiveDateTime: string;
  status: "final" | "preliminary" | "amended";
}

// Stub functions — to be implemented when API becomes available

export async function syncVaccinations(
  _patientId: string
): Promise<FHIRImmunization[]> {
  // TODO: Implement when Mon Espace Santé FHIR API is available
  throw new Error(
    "L'intégration Mon Espace Santé n'est pas encore disponible. " +
      "L'API FHIR est prévue pour fin 2026."
  );
}

export async function syncGrowthMeasurements(
  _patientId: string
): Promise<FHIRObservation[]> {
  // TODO: Implement when Mon Espace Santé FHIR API is available
  throw new Error(
    "L'intégration Mon Espace Santé n'est pas encore disponible."
  );
}

export async function getPatient(
  _patientId: string
): Promise<FHIRPatient | null> {
  // TODO: Implement when Mon Espace Santé FHIR API is available
  return null;
}
