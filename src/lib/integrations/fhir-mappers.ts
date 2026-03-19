/**
 * FHIR <-> Local data mappers
 *
 * Bidirectional mapping between FHIR R4 resources and
 * Cockpit Parental Supabase row types.
 */

import type {
  FHIRImmunization,
  FHIRObservation,
  FHIRAllergyIntolerance,
  FHIRDocumentReference,
  FHIRCoding,
  FHIRCodeableConcept,
} from "@/types/fhir";
import {
  LOINC,
  LOINC_SYSTEM,
  SNOMED_SYSTEM,
  CVX_SYSTEM,
  UNITS_SYSTEM,
  ALLERGY_CLINICAL_STATUS_SYSTEM,
  ALLERGY_VERIFICATION_STATUS_SYSTEM,
} from "@/types/fhir";

// --- Row types (database shape) ---

export interface VaccinationRow {
  member_id: string;
  vaccine_name: string;
  vaccine_code: string | null;
  dose_number: number;
  administered_date: string | null;
  next_due_date: string | null;
  practitioner: string | null;
  batch_number: string | null;
  notes: string | null;
  status: "done" | "pending" | "overdue" | "skipped";
  fhir_resource_id: string | null;
  fhir_last_updated: string | null;
  sync_source: "local" | "fhir";
}

export interface GrowthMeasurementRow {
  member_id: string;
  measurement_date: string;
  weight_kg: number | null;
  height_cm: number | null;
  head_circumference_cm: number | null;
  notes: string | null;
  fhir_resource_id: string | null;
  fhir_last_updated: string | null;
  sync_source: "local" | "fhir";
}

export interface AllergyRow {
  member_id: string;
  allergen: string;
  severity: "mild" | "moderate" | "severe";
  reaction: string | null;
  diagnosed_date: string | null;
  active: boolean;
  notes: string | null;
  fhir_resource_id: string | null;
  fhir_last_updated: string | null;
  sync_source: "local" | "fhir";
}

export interface PrescriptionRow {
  member_id: string;
  household_id: string;
  scan_file_path: string | null;
  ocr_text: string | null;
  medications: unknown[];
  practitioner: string | null;
  prescription_date: string | null;
  notes: string | null;
  fhir_resource_id: string | null;
  fhir_last_updated: string | null;
  sync_source: "local" | "fhir";
}

// --- French vaccine code mapping ---

const VACCINE_CODE_MAP: Record<string, { name: string; code: string }> = {
  // SNOMED CT codes
  "836380009": { name: "DTPCa", code: "DTPCa" },
  "836381008": { name: "DTPCa-Hib-HepB-Polio", code: "Hexavalent" },
  "836374004": { name: "Hépatite B", code: "HepB" },
  "836377006": { name: "Hib", code: "Hib" },
  "836398006": { name: "Pneumocoque", code: "PCV13" },
  "836401009": { name: "Méningocoque C", code: "MenC" },
  "836382001": { name: "ROR", code: "ROR" },
  // CVX codes
  "01": { name: "DTP", code: "DTP" },
  "03": { name: "Rougeole-Oreillons-Rubéole", code: "ROR" },
  "08": { name: "Hépatite B", code: "HepB" },
  "10": { name: "Polio (IPV)", code: "IPV" },
  "17": { name: "Hib", code: "Hib" },
  "20": { name: "DTPCa", code: "DTPCa" },
  "33": { name: "Pneumocoque", code: "PCV13" },
  "114": { name: "Méningocoque C", code: "MenC" },
  "133": { name: "Pneumocoque PCV13", code: "PCV13" },
};

/**
 * Map FHIR vaccine coding to local vaccine name and code
 */
export function mapFHIRVaccineCodeToLocal(
  codings: FHIRCoding[]
): { vaccineName: string; vaccineCode: string | null } {
  for (const coding of codings) {
    if (
      (coding.system === SNOMED_SYSTEM || coding.system === CVX_SYSTEM) &&
      coding.code &&
      VACCINE_CODE_MAP[coding.code]
    ) {
      return {
        vaccineName: VACCINE_CODE_MAP[coding.code].name,
        vaccineCode: VACCINE_CODE_MAP[coding.code].code,
      };
    }
  }

  // Fallback: use display text from first coding
  const display = codings.find((c) => c.display)?.display;
  return {
    vaccineName: display ?? "Vaccin inconnu",
    vaccineCode: null,
  };
}

// --- FHIR → Local mappers ---

/**
 * Map a FHIR Immunization to a local vaccination row
 */
export function mapFHIRImmunizationToVaccination(
  fhir: FHIRImmunization,
  memberId: string
): Partial<VaccinationRow> {
  const { vaccineName, vaccineCode } = mapFHIRVaccineCodeToLocal(
    fhir.vaccineCode.coding ?? []
  );

  const doseNumber =
    fhir.protocolApplied?.[0]?.doseNumberPositiveInt ?? 1;

  const practitionerDisplay =
    fhir.performer?.[0]?.actor.display ?? null;

  let status: VaccinationRow["status"] = "pending";
  if (fhir.status === "completed") status = "done";
  else if (fhir.status === "not-done") status = "skipped";
  else if (fhir.status === "entered-in-error") status = "skipped";

  return {
    member_id: memberId,
    vaccine_name: fhir.vaccineCode.text ?? vaccineName,
    vaccine_code: vaccineCode,
    dose_number: doseNumber,
    administered_date: fhir.occurrenceDateTime ?? null,
    practitioner: practitionerDisplay,
    batch_number: fhir.lotNumber ?? null,
    notes: fhir.note?.[0]?.text ?? null,
    status,
    fhir_resource_id: fhir.id ?? null,
    fhir_last_updated: fhir.meta?.lastUpdated ?? null,
    sync_source: "fhir",
  };
}

/**
 * Map FHIR Observation(s) to growth measurement rows.
 * Groups observations by date into single measurement rows.
 */
export function mapFHIRObservationsToGrowthMeasurements(
  observations: FHIRObservation[],
  memberId: string
): Partial<GrowthMeasurementRow>[] {
  // Group observations by date
  const byDate = new Map<string, FHIRObservation[]>();
  for (const obs of observations) {
    const date = obs.effectiveDateTime?.split("T")[0] ?? "unknown";
    const group = byDate.get(date) ?? [];
    group.push(obs);
    byDate.set(date, group);
  }

  return Array.from(byDate.entries()).map(([date, obs]) => {
    const row: Partial<GrowthMeasurementRow> = {
      member_id: memberId,
      measurement_date: date,
      weight_kg: null,
      height_cm: null,
      head_circumference_cm: null,
      notes: null,
      fhir_resource_id: obs[0]?.id ?? null,
      fhir_last_updated: obs[0]?.meta?.lastUpdated ?? null,
      sync_source: "fhir",
    };

    for (const o of obs) {
      const loincCode = o.code.coding?.find((c) => c.system === LOINC_SYSTEM)?.code;
      const value = o.valueQuantity?.value ?? null;

      if (loincCode === LOINC.BODY_WEIGHT && value !== null) {
        row.weight_kg = value;
      } else if (loincCode === LOINC.BODY_HEIGHT && value !== null) {
        row.height_cm = value;
      } else if (loincCode === LOINC.HEAD_CIRCUMFERENCE && value !== null) {
        row.head_circumference_cm = value;
      }

      if (o.note?.[0]?.text && !row.notes) {
        row.notes = o.note[0].text;
      }
    }

    return row;
  });
}

/**
 * Map a single FHIR Observation to a partial growth measurement
 */
export function mapFHIRObservationToGrowthMeasurement(
  fhir: FHIRObservation,
  memberId: string
): Partial<GrowthMeasurementRow> {
  const loincCode = fhir.code.coding?.find((c) => c.system === LOINC_SYSTEM)?.code;
  const value = fhir.valueQuantity?.value ?? null;
  const date = fhir.effectiveDateTime?.split("T")[0] ?? "";

  const row: Partial<GrowthMeasurementRow> = {
    member_id: memberId,
    measurement_date: date,
    weight_kg: null,
    height_cm: null,
    head_circumference_cm: null,
    notes: fhir.note?.[0]?.text ?? null,
    fhir_resource_id: fhir.id ?? null,
    fhir_last_updated: fhir.meta?.lastUpdated ?? null,
    sync_source: "fhir",
  };

  if (loincCode === LOINC.BODY_WEIGHT) row.weight_kg = value;
  else if (loincCode === LOINC.BODY_HEIGHT) row.height_cm = value;
  else if (loincCode === LOINC.HEAD_CIRCUMFERENCE) row.head_circumference_cm = value;

  return row;
}

/**
 * Map FHIR AllergyIntolerance to local allergy row
 */
export function mapFHIRAllergyIntoleranceToAllergy(
  fhir: FHIRAllergyIntolerance,
  memberId: string
): Partial<AllergyRow> {
  const allergen = fhir.code?.text ?? fhir.code?.coding?.[0]?.display ?? "Allergène inconnu";

  let severity: AllergyRow["severity"] = "moderate";
  if (fhir.criticality === "low") severity = "mild";
  else if (fhir.criticality === "high") severity = "severe";

  const reactionText =
    fhir.reaction?.[0]?.manifestation
      ?.map((m) => m.text ?? m.coding?.[0]?.display)
      .filter(Boolean)
      .join(", ") ?? null;

  const clinicalCode = fhir.clinicalStatus?.coding?.find(
    (c) => c.system === ALLERGY_CLINICAL_STATUS_SYSTEM
  )?.code;
  const active = clinicalCode !== "inactive" && clinicalCode !== "resolved";

  return {
    member_id: memberId,
    allergen,
    severity,
    reaction: reactionText,
    diagnosed_date: fhir.onsetDateTime?.split("T")[0] ?? fhir.recordedDate?.split("T")[0] ?? null,
    active,
    notes: fhir.note?.[0]?.text ?? null,
    fhir_resource_id: fhir.id ?? null,
    fhir_last_updated: fhir.meta?.lastUpdated ?? null,
    sync_source: "fhir",
  };
}

/**
 * Map FHIR DocumentReference to a local prescription row
 */
export function mapFHIRDocumentReferenceToPrescription(
  fhir: FHIRDocumentReference,
  memberId: string,
  householdId: string
): Partial<PrescriptionRow> {
  const authorDisplay = fhir.author?.[0]?.display ?? null;

  return {
    member_id: memberId,
    household_id: householdId,
    scan_file_path: null, // Documents stay on MES, not downloaded
    ocr_text: null,
    medications: [],
    practitioner: authorDisplay,
    prescription_date: fhir.date?.split("T")[0] ?? null,
    notes: fhir.description ?? fhir.content?.[0]?.attachment?.title ?? null,
    fhir_resource_id: fhir.id ?? null,
    fhir_last_updated: fhir.meta?.lastUpdated ?? null,
    sync_source: "fhir",
  };
}

// --- Local → FHIR mappers ---

interface LocalVaccination {
  vaccineName: string;
  vaccineCode: string | null;
  doseNumber: number;
  administeredDate: string | null;
  practitioner: string | null;
  batchNumber: string | null;
  notes: string | null;
  status: string;
}

/**
 * Map local vaccination to FHIR Immunization
 */
export function mapVaccinationToFHIRImmunization(
  vaccination: LocalVaccination,
  patientRef: string
): FHIRImmunization {
  let fhirStatus: FHIRImmunization["status"] = "not-done";
  if (vaccination.status === "done") fhirStatus = "completed";
  else if (vaccination.status === "skipped") fhirStatus = "not-done";

  const coding: FHIRCoding[] = [];
  if (vaccination.vaccineCode) {
    // Try to find SNOMED code
    const entry = Object.entries(VACCINE_CODE_MAP).find(
      ([, v]) => v.code === vaccination.vaccineCode
    );
    if (entry) {
      const [code] = entry;
      coding.push({
        system: code.length <= 3 ? CVX_SYSTEM : SNOMED_SYSTEM,
        code,
        display: vaccination.vaccineName,
      });
    }
  }

  return {
    resourceType: "Immunization",
    status: fhirStatus,
    vaccineCode: {
      coding: coding.length > 0 ? coding : undefined,
      text: vaccination.vaccineName,
    },
    patient: { reference: patientRef },
    occurrenceDateTime: vaccination.administeredDate ?? undefined,
    lotNumber: vaccination.batchNumber ?? undefined,
    performer: vaccination.practitioner
      ? [{ actor: { display: vaccination.practitioner } }]
      : undefined,
    protocolApplied: [
      { doseNumberPositiveInt: vaccination.doseNumber },
    ],
    note: vaccination.notes ? [{ text: vaccination.notes }] : undefined,
  };
}

interface LocalGrowthMeasurement {
  measurementDate: string;
  weightKg: number | null;
  heightCm: number | null;
  headCircumferenceCm: number | null;
  notes: string | null;
}

/**
 * Map local growth measurement to FHIR Observation(s)
 * Returns one Observation per measurement type
 */
export function mapGrowthMeasurementToFHIRObservations(
  measurement: LocalGrowthMeasurement,
  patientRef: string
): FHIRObservation[] {
  const observations: FHIRObservation[] = [];

  const makeObs = (
    loincCode: string,
    display: string,
    value: number,
    unit: string,
    unitCode: string
  ): FHIRObservation => ({
    resourceType: "Observation",
    status: "final",
    category: [{
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/observation-category",
        code: "vital-signs",
        display: "Vital Signs",
      }],
    }],
    code: {
      coding: [{ system: LOINC_SYSTEM, code: loincCode, display }],
    },
    subject: { reference: patientRef },
    effectiveDateTime: measurement.measurementDate,
    valueQuantity: {
      value,
      unit,
      system: UNITS_SYSTEM,
      code: unitCode,
    },
    note: measurement.notes ? [{ text: measurement.notes }] : undefined,
  });

  if (measurement.weightKg !== null) {
    observations.push(makeObs(LOINC.BODY_WEIGHT, LOINC.BODY_WEIGHT_DISPLAY, measurement.weightKg, "kg", "kg"));
  }
  if (measurement.heightCm !== null) {
    observations.push(makeObs(LOINC.BODY_HEIGHT, LOINC.BODY_HEIGHT_DISPLAY, measurement.heightCm, "cm", "cm"));
  }
  if (measurement.headCircumferenceCm !== null) {
    observations.push(makeObs(LOINC.HEAD_CIRCUMFERENCE, LOINC.HEAD_CIRCUMFERENCE_DISPLAY, measurement.headCircumferenceCm, "cm", "cm"));
  }

  return observations;
}

interface LocalAllergy {
  allergen: string;
  severity: "mild" | "moderate" | "severe";
  reaction: string | null;
  diagnosedDate: string | null;
  active: boolean;
  notes: string | null;
}

/**
 * Map local allergy to FHIR AllergyIntolerance
 */
export function mapAllergyToFHIRAllergyIntolerance(
  allergy: LocalAllergy,
  patientRef: string
): FHIRAllergyIntolerance {
  const clinicalCode = allergy.active ? "active" : "inactive";
  const criticalityMap: Record<string, FHIRAllergyIntolerance["criticality"]> = {
    mild: "low",
    moderate: "low",
    severe: "high",
  };

  const fhir: FHIRAllergyIntolerance = {
    resourceType: "AllergyIntolerance",
    clinicalStatus: {
      coding: [{
        system: ALLERGY_CLINICAL_STATUS_SYSTEM,
        code: clinicalCode,
      }],
    },
    verificationStatus: {
      coding: [{
        system: ALLERGY_VERIFICATION_STATUS_SYSTEM,
        code: "confirmed",
      }],
    },
    criticality: criticalityMap[allergy.severity],
    code: { text: allergy.allergen },
    patient: { reference: patientRef },
    onsetDateTime: allergy.diagnosedDate ?? undefined,
    note: allergy.notes ? [{ text: allergy.notes }] : undefined,
  };

  if (allergy.reaction) {
    fhir.reaction = [{
      manifestation: [{ text: allergy.reaction }],
      severity: allergy.severity,
    }];
  }

  return fhir;
}

// --- Helpers ---

/**
 * Extract a text value from a FHIR CodeableConcept
 */
export function extractCodeableConceptText(concept?: FHIRCodeableConcept): string | null {
  if (!concept) return null;
  return concept.text ?? concept.coding?.[0]?.display ?? null;
}
