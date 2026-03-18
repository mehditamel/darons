import { describe, it, expect } from "vitest";
import {
  vaccinationSchema,
  growthMeasurementSchema,
  medicalAppointmentSchema,
  allergySchema,
} from "@/lib/validators/health";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("vaccinationSchema", () => {
  const valid = {
    memberId: validUuid,
    vaccineCode: "DTPCa",
    vaccineName: "Diphtérie-Tétanos-Polio-Coqueluche",
    doseNumber: 1,
    administeredDate: "2025-05-10",
  };

  it("accepte une vaccination valide", () => {
    expect(vaccinationSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un numéro de dose <= 0", () => {
    expect(vaccinationSchema.safeParse({ ...valid, doseNumber: 0 }).success).toBe(false);
  });

  it("refuse une date vide", () => {
    expect(vaccinationSchema.safeParse({ ...valid, administeredDate: "" }).success).toBe(false);
  });
});

describe("growthMeasurementSchema", () => {
  it("accepte une mesure valide", () => {
    const result = growthMeasurementSchema.safeParse({
      memberId: validUuid,
      measurementDate: "2025-06-15",
      weightKg: 5.2,
      heightCm: 55,
    });
    expect(result.success).toBe(true);
  });

  it("accepte des mesures optionnelles (NaN transformé en undefined)", () => {
    const result = growthMeasurementSchema.safeParse({
      memberId: validUuid,
      measurementDate: "2025-06-15",
      weightKg: NaN,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weightKg).toBeUndefined();
    }
  });

  it("refuse un poids négatif", () => {
    const result = growthMeasurementSchema.safeParse({
      memberId: validUuid,
      measurementDate: "2025-06-15",
      weightKg: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe("medicalAppointmentSchema", () => {
  it("accepte un RDV valide", () => {
    const result = medicalAppointmentSchema.safeParse({
      memberId: validUuid,
      appointmentType: "pédiatre",
      appointmentDate: "2025-07-01",
    });
    expect(result.success).toBe(true);
  });

  it("refuse un type de RDV vide", () => {
    const result = medicalAppointmentSchema.safeParse({
      memberId: validUuid,
      appointmentType: "",
      appointmentDate: "2025-07-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("allergySchema", () => {
  it("accepte une allergie valide", () => {
    const result = allergySchema.safeParse({
      memberId: validUuid,
      allergen: "Arachide",
      severity: "severe",
    });
    expect(result.success).toBe(true);
  });

  it("refuse une sévérité invalide", () => {
    const result = allergySchema.safeParse({
      memberId: validUuid,
      allergen: "Arachide",
      severity: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("accepte les 3 niveaux de sévérité", () => {
    for (const severity of ["mild", "moderate", "severe"]) {
      const result = allergySchema.safeParse({
        memberId: validUuid,
        allergen: "Test",
        severity,
      });
      expect(result.success).toBe(true);
    }
  });
});
