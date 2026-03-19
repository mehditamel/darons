import { describe, it, expect } from "vitest";
import {
  mapFHIRImmunizationToVaccination,
  mapFHIRObservationToGrowthMeasurement,
  mapFHIRObservationsToGrowthMeasurements,
  mapFHIRAllergyIntoleranceToAllergy,
  mapFHIRDocumentReferenceToPrescription,
  mapFHIRVaccineCodeToLocal,
  mapVaccinationToFHIRImmunization,
  mapGrowthMeasurementToFHIRObservations,
  mapAllergyToFHIRAllergyIntolerance,
} from "@/lib/integrations/fhir-mappers";
import type {
  FHIRImmunization,
  FHIRObservation,
  FHIRAllergyIntolerance,
  FHIRDocumentReference,
} from "@/types/fhir";

const MEMBER_ID = "member-123";
const HOUSEHOLD_ID = "household-456";

describe("FHIR Mappers — FHIR → Local", () => {
  describe("mapFHIRImmunizationToVaccination", () => {
    it("maps a completed immunization correctly", () => {
      const fhir: FHIRImmunization = {
        resourceType: "Immunization",
        id: "imm-001",
        meta: { lastUpdated: "2025-06-15T10:00:00Z" },
        status: "completed",
        vaccineCode: {
          coding: [
            { system: "http://snomed.info/sct", code: "836382001", display: "ROR" },
          ],
          text: "ROR (Rougeole-Oreillons-Rubéole)",
        },
        patient: { reference: "Patient/pat-001" },
        occurrenceDateTime: "2025-06-15",
        lotNumber: "LOT-2025-A",
        performer: [{ actor: { display: "Dr. Martin" } }],
        protocolApplied: [{ doseNumberPositiveInt: 1 }],
        note: [{ text: "Bien toléré" }],
      };

      const result = mapFHIRImmunizationToVaccination(fhir, MEMBER_ID);

      expect(result.member_id).toBe(MEMBER_ID);
      expect(result.vaccine_name).toBe("ROR (Rougeole-Oreillons-Rubéole)");
      expect(result.vaccine_code).toBe("ROR");
      expect(result.dose_number).toBe(1);
      expect(result.administered_date).toBe("2025-06-15");
      expect(result.practitioner).toBe("Dr. Martin");
      expect(result.batch_number).toBe("LOT-2025-A");
      expect(result.status).toBe("done");
      expect(result.notes).toBe("Bien toléré");
      expect(result.fhir_resource_id).toBe("imm-001");
      expect(result.sync_source).toBe("fhir");
    });

    it("maps a not-done immunization as skipped", () => {
      const fhir: FHIRImmunization = {
        resourceType: "Immunization",
        id: "imm-002",
        status: "not-done",
        vaccineCode: { text: "DTPCa" },
        patient: { reference: "Patient/pat-001" },
      };

      const result = mapFHIRImmunizationToVaccination(fhir, MEMBER_ID);
      expect(result.status).toBe("skipped");
    });

    it("maps entered-in-error status as skipped", () => {
      const fhir: FHIRImmunization = {
        resourceType: "Immunization",
        id: "imm-003",
        status: "entered-in-error",
        vaccineCode: { text: "Erreur" },
        patient: { reference: "Patient/pat-001" },
      };

      const result = mapFHIRImmunizationToVaccination(fhir, MEMBER_ID);
      expect(result.status).toBe("skipped");
    });

    it("uses default dose number 1 when protocolApplied is missing", () => {
      const fhir: FHIRImmunization = {
        resourceType: "Immunization",
        id: "imm-004",
        status: "completed",
        vaccineCode: { text: "Test" },
        patient: { reference: "Patient/pat-001" },
      };

      const result = mapFHIRImmunizationToVaccination(fhir, MEMBER_ID);
      expect(result.dose_number).toBe(1);
    });
  });

  describe("mapFHIRVaccineCodeToLocal", () => {
    it("maps SNOMED code to local vaccine name", () => {
      const result = mapFHIRVaccineCodeToLocal([
        { system: "http://snomed.info/sct", code: "836382001", display: "ROR" },
      ]);
      expect(result.vaccineName).toBe("ROR");
      expect(result.vaccineCode).toBe("ROR");
    });

    it("maps CVX code to local vaccine name", () => {
      const result = mapFHIRVaccineCodeToLocal([
        { system: "http://hl7.org/fhir/sid/cvx", code: "20", display: "DTaP" },
      ]);
      expect(result.vaccineName).toBe("DTPCa");
      expect(result.vaccineCode).toBe("DTPCa");
    });

    it("falls back to display text for unknown codes", () => {
      const result = mapFHIRVaccineCodeToLocal([
        { system: "http://unknown.org", code: "999", display: "Vaccin inconnu XYZ" },
      ]);
      expect(result.vaccineName).toBe("Vaccin inconnu XYZ");
      expect(result.vaccineCode).toBeNull();
    });

    it("returns default for empty codings", () => {
      const result = mapFHIRVaccineCodeToLocal([]);
      expect(result.vaccineName).toBe("Vaccin inconnu");
      expect(result.vaccineCode).toBeNull();
    });
  });

  describe("mapFHIRObservationToGrowthMeasurement", () => {
    it("maps a weight observation", () => {
      const fhir: FHIRObservation = {
        resourceType: "Observation",
        id: "obs-001",
        status: "final",
        code: {
          coding: [{ system: "http://loinc.org", code: "29463-7", display: "Body weight" }],
        },
        subject: { reference: "Patient/pat-001" },
        effectiveDateTime: "2025-09-15T10:00:00Z",
        valueQuantity: { value: 8.5, unit: "kg" },
      };

      const result = mapFHIRObservationToGrowthMeasurement(fhir, MEMBER_ID);
      expect(result.weight_kg).toBe(8.5);
      expect(result.height_cm).toBeNull();
      expect(result.head_circumference_cm).toBeNull();
      expect(result.measurement_date).toBe("2025-09-15");
      expect(result.sync_source).toBe("fhir");
    });

    it("maps a height observation", () => {
      const fhir: FHIRObservation = {
        resourceType: "Observation",
        id: "obs-002",
        status: "final",
        code: {
          coding: [{ system: "http://loinc.org", code: "3137-7", display: "Body height" }],
        },
        effectiveDateTime: "2025-09-15",
        valueQuantity: { value: 72.5, unit: "cm" },
      };

      const result = mapFHIRObservationToGrowthMeasurement(fhir, MEMBER_ID);
      expect(result.height_cm).toBe(72.5);
      expect(result.weight_kg).toBeNull();
    });

    it("maps a head circumference observation", () => {
      const fhir: FHIRObservation = {
        resourceType: "Observation",
        id: "obs-003",
        status: "final",
        code: {
          coding: [{ system: "http://loinc.org", code: "9843-4", display: "HC" }],
        },
        effectiveDateTime: "2025-09-15",
        valueQuantity: { value: 45.2, unit: "cm" },
      };

      const result = mapFHIRObservationToGrowthMeasurement(fhir, MEMBER_ID);
      expect(result.head_circumference_cm).toBe(45.2);
    });
  });

  describe("mapFHIRObservationsToGrowthMeasurements", () => {
    it("groups observations by date into measurements", () => {
      const observations: FHIRObservation[] = [
        {
          resourceType: "Observation",
          id: "obs-a",
          status: "final",
          code: { coding: [{ system: "http://loinc.org", code: "29463-7" }] },
          effectiveDateTime: "2025-09-15",
          valueQuantity: { value: 8.5, unit: "kg" },
        },
        {
          resourceType: "Observation",
          id: "obs-b",
          status: "final",
          code: { coding: [{ system: "http://loinc.org", code: "3137-7" }] },
          effectiveDateTime: "2025-09-15",
          valueQuantity: { value: 72, unit: "cm" },
        },
        {
          resourceType: "Observation",
          id: "obs-c",
          status: "final",
          code: { coding: [{ system: "http://loinc.org", code: "29463-7" }] },
          effectiveDateTime: "2025-10-01",
          valueQuantity: { value: 9.0, unit: "kg" },
        },
      ];

      const results = mapFHIRObservationsToGrowthMeasurements(observations, MEMBER_ID);
      expect(results).toHaveLength(2);

      const sept = results.find((r) => r.measurement_date === "2025-09-15");
      expect(sept?.weight_kg).toBe(8.5);
      expect(sept?.height_cm).toBe(72);

      const oct = results.find((r) => r.measurement_date === "2025-10-01");
      expect(oct?.weight_kg).toBe(9.0);
    });
  });

  describe("mapFHIRAllergyIntoleranceToAllergy", () => {
    it("maps a high criticality allergy", () => {
      const fhir: FHIRAllergyIntolerance = {
        resourceType: "AllergyIntolerance",
        id: "ai-001",
        meta: { lastUpdated: "2025-08-01T12:00:00Z" },
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "active" }],
        },
        criticality: "high",
        code: { text: "Arachide" },
        patient: { reference: "Patient/pat-001" },
        onsetDateTime: "2025-07-15",
        reaction: [{
          manifestation: [{ text: "Urticaire" }, { text: "Oedème" }],
          severity: "severe",
        }],
        note: [{ text: "Épipen prescrit" }],
      };

      const result = mapFHIRAllergyIntoleranceToAllergy(fhir, MEMBER_ID);
      expect(result.allergen).toBe("Arachide");
      expect(result.severity).toBe("severe");
      expect(result.reaction).toBe("Urticaire, Oedème");
      expect(result.active).toBe(true);
      expect(result.diagnosed_date).toBe("2025-07-15");
      expect(result.notes).toBe("Épipen prescrit");
      expect(result.fhir_resource_id).toBe("ai-001");
    });

    it("maps an inactive allergy correctly", () => {
      const fhir: FHIRAllergyIntolerance = {
        resourceType: "AllergyIntolerance",
        id: "ai-002",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical", code: "resolved" }],
        },
        criticality: "low",
        code: { text: "Lait de vache" },
        patient: { reference: "Patient/pat-001" },
      };

      const result = mapFHIRAllergyIntoleranceToAllergy(fhir, MEMBER_ID);
      expect(result.active).toBe(false);
      expect(result.severity).toBe("mild");
    });
  });

  describe("mapFHIRDocumentReferenceToPrescription", () => {
    it("maps a document reference to a prescription", () => {
      const fhir: FHIRDocumentReference = {
        resourceType: "DocumentReference",
        id: "doc-001",
        status: "current",
        date: "2025-11-01T14:00:00Z",
        author: [{ display: "Dr. Dupont" }],
        description: "Ordonnance antibiotiques",
        content: [{ attachment: { title: "ordonnance.pdf", contentType: "application/pdf" } }],
      };

      const result = mapFHIRDocumentReferenceToPrescription(fhir, MEMBER_ID, HOUSEHOLD_ID);
      expect(result.practitioner).toBe("Dr. Dupont");
      expect(result.prescription_date).toBe("2025-11-01");
      expect(result.notes).toBe("Ordonnance antibiotiques");
      expect(result.fhir_resource_id).toBe("doc-001");
      expect(result.sync_source).toBe("fhir");
      expect(result.household_id).toBe(HOUSEHOLD_ID);
    });
  });
});

describe("FHIR Mappers — Local → FHIR", () => {
  describe("mapVaccinationToFHIRImmunization", () => {
    it("maps a local vaccination to FHIR Immunization", () => {
      const result = mapVaccinationToFHIRImmunization(
        {
          vaccineName: "ROR",
          vaccineCode: "ROR",
          doseNumber: 1,
          administeredDate: "2026-03-12",
          practitioner: "Dr. Martin",
          batchNumber: "LOT-123",
          notes: "RAS",
          status: "done",
        },
        "Patient/pat-001"
      );

      expect(result.resourceType).toBe("Immunization");
      expect(result.status).toBe("completed");
      expect(result.vaccineCode.text).toBe("ROR");
      expect(result.patient.reference).toBe("Patient/pat-001");
      expect(result.occurrenceDateTime).toBe("2026-03-12");
      expect(result.lotNumber).toBe("LOT-123");
      expect(result.protocolApplied?.[0]?.doseNumberPositiveInt).toBe(1);
      expect(result.performer?.[0]?.actor.display).toBe("Dr. Martin");
      expect(result.note?.[0]?.text).toBe("RAS");
    });

    it("maps skipped status to not-done", () => {
      const result = mapVaccinationToFHIRImmunization(
        {
          vaccineName: "Test",
          vaccineCode: null,
          doseNumber: 1,
          administeredDate: null,
          practitioner: null,
          batchNumber: null,
          notes: null,
          status: "skipped",
        },
        "Patient/pat-001"
      );

      expect(result.status).toBe("not-done");
    });
  });

  describe("mapGrowthMeasurementToFHIRObservations", () => {
    it("creates observations for each measurement type", () => {
      const results = mapGrowthMeasurementToFHIRObservations(
        {
          measurementDate: "2025-09-15",
          weightKg: 8.5,
          heightCm: 72,
          headCircumferenceCm: 45,
          notes: "Visite mois 6",
        },
        "Patient/pat-001"
      );

      expect(results).toHaveLength(3);

      const weight = results.find((o) => o.code.coding?.[0]?.code === "29463-7");
      expect(weight?.valueQuantity?.value).toBe(8.5);
      expect(weight?.valueQuantity?.unit).toBe("kg");

      const height = results.find((o) => o.code.coding?.[0]?.code === "3137-7");
      expect(height?.valueQuantity?.value).toBe(72);

      const hc = results.find((o) => o.code.coding?.[0]?.code === "9843-4");
      expect(hc?.valueQuantity?.value).toBe(45);
    });

    it("omits observations for null measurements", () => {
      const results = mapGrowthMeasurementToFHIRObservations(
        {
          measurementDate: "2025-09-15",
          weightKg: 8.5,
          heightCm: null,
          headCircumferenceCm: null,
          notes: null,
        },
        "Patient/pat-001"
      );

      expect(results).toHaveLength(1);
      expect(results[0].code.coding?.[0]?.code).toBe("29463-7");
    });
  });

  describe("mapAllergyToFHIRAllergyIntolerance", () => {
    it("maps a severe active allergy", () => {
      const result = mapAllergyToFHIRAllergyIntolerance(
        {
          allergen: "Arachide",
          severity: "severe",
          reaction: "Anaphylaxie",
          diagnosedDate: "2025-07-15",
          active: true,
          notes: "Épipen requis",
        },
        "Patient/pat-001"
      );

      expect(result.resourceType).toBe("AllergyIntolerance");
      expect(result.code?.text).toBe("Arachide");
      expect(result.criticality).toBe("high");
      expect(result.clinicalStatus?.coding?.[0]?.code).toBe("active");
      expect(result.reaction?.[0]?.manifestation?.[0]?.text).toBe("Anaphylaxie");
      expect(result.reaction?.[0]?.severity).toBe("severe");
    });

    it("maps an inactive mild allergy", () => {
      const result = mapAllergyToFHIRAllergyIntolerance(
        {
          allergen: "Pollen",
          severity: "mild",
          reaction: null,
          diagnosedDate: null,
          active: false,
          notes: null,
        },
        "Patient/pat-001"
      );

      expect(result.criticality).toBe("low");
      expect(result.clinicalStatus?.coding?.[0]?.code).toBe("inactive");
      expect(result.reaction).toBeUndefined();
      expect(result.note).toBeUndefined();
    });
  });
});
