"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  healthExaminationSchema,
  dailyHealthJournalSchema,
  allergySchema,
  type HealthExaminationFormData,
  type DailyHealthJournalFormData,
  type AllergyFormData,
} from "@/lib/validators/health";
import type {
  HealthExamination,
  DailyHealthJournal,
  Allergy,
  Prescription,
  Medication,
} from "@/types/health";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthenticatedUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

// --- Health Examinations ---

export async function getHealthExaminations(
  memberId: string
): Promise<ActionResult<HealthExamination[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("health_examinations")
    .select("*")
    .eq("member_id", memberId)
    .order("exam_number", { ascending: true });

  if (error)
    return { success: false, error: "Erreur lors de la récupération des examens" };

  return {
    success: true,
    data: (data ?? []).map((e) => ({
      id: e.id,
      memberId: e.member_id,
      examNumber: e.exam_number,
      examAgeLabel: e.exam_age_label,
      scheduledDate: e.scheduled_date,
      completedDate: e.completed_date,
      practitioner: e.practitioner,
      weightKg: e.weight_kg ? Number(e.weight_kg) : null,
      heightCm: e.height_cm ? Number(e.height_cm) : null,
      headCircumferenceCm: e.head_circumference_cm
        ? Number(e.head_circumference_cm)
        : null,
      screenExposureNotes: e.screen_exposure_notes,
      tndScreeningNotes: e.tnd_screening_notes,
      notes: e.notes,
      status: e.status,
      createdAt: e.created_at,
    })),
  };
}

export async function createHealthExamination(
  formData: HealthExaminationFormData
): Promise<ActionResult<HealthExamination>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = healthExaminationSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };
  }

  const { data, error } = await supabase
    .from("health_examinations")
    .insert({
      member_id: parsed.data.memberId,
      exam_number: parsed.data.examNumber,
      exam_age_label: parsed.data.examAgeLabel,
      completed_date: parsed.data.completedDate,
      practitioner: parsed.data.practitioner ?? null,
      weight_kg: parsed.data.weightKg ?? null,
      height_cm: parsed.data.heightCm ?? null,
      head_circumference_cm: parsed.data.headCircumferenceCm ?? null,
      screen_exposure_notes: parsed.data.screenExposureNotes ?? null,
      tnd_screening_notes: parsed.data.tndScreeningNotes ?? null,
      notes: parsed.data.notes ?? null,
      status: "completed",
    })
    .select()
    .single();

  if (error)
    return { success: false, error: "Erreur lors de l'enregistrement de l'examen" };

  revalidatePath("/sante-enrichie");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      examNumber: data.exam_number,
      examAgeLabel: data.exam_age_label,
      scheduledDate: data.scheduled_date,
      completedDate: data.completed_date,
      practitioner: data.practitioner,
      weightKg: data.weight_kg ? Number(data.weight_kg) : null,
      heightCm: data.height_cm ? Number(data.height_cm) : null,
      headCircumferenceCm: data.head_circumference_cm
        ? Number(data.head_circumference_cm)
        : null,
      screenExposureNotes: data.screen_exposure_notes,
      tndScreeningNotes: data.tnd_screening_notes,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
    },
  };
}

export async function updateHealthExamination(
  id: string,
  formData: HealthExaminationFormData
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = healthExaminationSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };
  }

  const { error } = await supabase
    .from("health_examinations")
    .update({
      completed_date: parsed.data.completedDate,
      practitioner: parsed.data.practitioner ?? null,
      weight_kg: parsed.data.weightKg ?? null,
      height_cm: parsed.data.heightCm ?? null,
      head_circumference_cm: parsed.data.headCircumferenceCm ?? null,
      screen_exposure_notes: parsed.data.screenExposureNotes ?? null,
      tnd_screening_notes: parsed.data.tndScreeningNotes ?? null,
      notes: parsed.data.notes ?? null,
      status: "completed",
    })
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la mise à jour de l'examen" };

  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function deleteHealthExamination(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("health_examinations").delete().eq("id", id);
  if (error)
    return { success: false, error: "Erreur lors de la suppression de l'examen" };

  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Daily Health Journal ---

export async function getDailyJournalEntries(
  memberId: string,
  month?: string
): Promise<ActionResult<DailyHealthJournal[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  let query = supabase
    .from("daily_health_journal")
    .select("*")
    .eq("member_id", memberId)
    .order("entry_date", { ascending: false });

  if (month) {
    const startDate = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const endDate = new Date(y, m, 0).toISOString().split("T")[0];
    query = query.gte("entry_date", startDate).lte("entry_date", endDate);
  }

  const { data, error } = await query;

  if (error)
    return { success: false, error: "Erreur lors de la récupération du journal" };

  return {
    success: true,
    data: (data ?? []).map((e) => ({
      id: e.id,
      memberId: e.member_id,
      entryDate: e.entry_date,
      mood: e.mood,
      sleepHours: e.sleep_hours ? Number(e.sleep_hours) : null,
      sleepQuality: e.sleep_quality,
      appetite: e.appetite,
      stools: e.stools,
      screenTimeMinutes: e.screen_time_minutes,
      physicalActivityMinutes: e.physical_activity_minutes ?? null,
      notes: e.notes,
      createdAt: e.created_at,
    })),
  };
}

export async function createDailyJournalEntry(
  formData: DailyHealthJournalFormData
): Promise<ActionResult<DailyHealthJournal>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = dailyHealthJournalSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };
  }

  const { data, error } = await supabase
    .from("daily_health_journal")
    .insert({
      member_id: parsed.data.memberId,
      entry_date: parsed.data.entryDate,
      mood: parsed.data.mood ?? null,
      sleep_hours: parsed.data.sleepHours ?? null,
      sleep_quality: parsed.data.sleepQuality ?? null,
      appetite: parsed.data.appetite ?? null,
      stools: parsed.data.stools ?? null,
      screen_time_minutes: parsed.data.screenTimeMinutes ?? null,
      physical_activity_minutes: parsed.data.physicalActivityMinutes ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "Une entrée existe déjà pour cette date. Modifiez-la plutôt.",
      };
    }
    return {
      success: false,
      error: "Erreur lors de la création de l'entrée",
    };
  }

  revalidatePath("/sante-enrichie");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      entryDate: data.entry_date,
      mood: data.mood,
      sleepHours: data.sleep_hours ? Number(data.sleep_hours) : null,
      sleepQuality: data.sleep_quality,
      appetite: data.appetite,
      stools: data.stools,
      screenTimeMinutes: data.screen_time_minutes,
      physicalActivityMinutes: data.physical_activity_minutes ?? null,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function updateDailyJournalEntry(
  id: string,
  formData: DailyHealthJournalFormData
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = dailyHealthJournalSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };
  }

  const { error } = await supabase
    .from("daily_health_journal")
    .update({
      mood: parsed.data.mood ?? null,
      sleep_hours: parsed.data.sleepHours ?? null,
      sleep_quality: parsed.data.sleepQuality ?? null,
      appetite: parsed.data.appetite ?? null,
      stools: parsed.data.stools ?? null,
      screen_time_minutes: parsed.data.screenTimeMinutes ?? null,
      physical_activity_minutes: parsed.data.physicalActivityMinutes ?? null,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la mise à jour de l'entrée" };

  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function deleteDailyJournalEntry(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("daily_health_journal").delete().eq("id", id);
  if (error)
    return { success: false, error: "Erreur lors de la suppression de l'entrée" };

  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Allergies ---

export async function getAllergies(
  memberId: string
): Promise<ActionResult<Allergy[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("allergies")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error)
    return { success: false, error: "Erreur lors de la récupération des allergies" };

  return {
    success: true,
    data: (data ?? []).map((a) => ({
      id: a.id,
      memberId: a.member_id,
      allergen: a.allergen,
      severity: a.severity,
      reaction: a.reaction,
      diagnosedDate: a.diagnosed_date,
      active: a.active,
      notes: a.notes,
      fhirResourceId: a.fhir_resource_id ?? null,
      fhirLastUpdated: a.fhir_last_updated ?? null,
      syncSource: a.sync_source ?? "local",
      createdAt: a.created_at,
    })),
  };
}

export async function createAllergy(
  formData: AllergyFormData
): Promise<ActionResult<Allergy>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = allergySchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };
  }

  const { data, error } = await supabase
    .from("allergies")
    .insert({
      member_id: parsed.data.memberId,
      allergen: parsed.data.allergen,
      severity: parsed.data.severity,
      reaction: parsed.data.reaction ?? null,
      diagnosed_date: parsed.data.diagnosedDate ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error)
    return { success: false, error: "Erreur lors de l'enregistrement de l'allergie" };

  revalidatePath("/sante-enrichie");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      allergen: data.allergen,
      severity: data.severity,
      reaction: data.reaction,
      diagnosedDate: data.diagnosed_date,
      active: data.active,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function updateAllergy(
  id: string,
  formData: AllergyFormData & { active?: boolean }
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("allergies")
    .update({
      allergen: formData.allergen,
      severity: formData.severity,
      reaction: formData.reaction ?? null,
      diagnosed_date: formData.diagnosedDate ?? null,
      notes: formData.notes ?? null,
      active: formData.active ?? true,
    })
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la mise à jour de l'allergie" };

  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function deleteAllergy(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("allergies").delete().eq("id", id);
  if (error)
    return { success: false, error: "Erreur lors de la suppression de l'allergie" };

  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Prescriptions ---

export async function getPrescriptions(
  memberId: string
): Promise<ActionResult<Prescription[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("member_id", memberId)
    .order("prescription_date", { ascending: false, nullsFirst: false });

  if (error)
    return {
      success: false,
      error: "Erreur lors de la récupération des ordonnances",
    };

  return {
    success: true,
    data: (data ?? []).map((p) => ({
      id: p.id,
      memberId: p.member_id,
      householdId: p.household_id,
      scanFilePath: p.scan_file_path,
      ocrText: p.ocr_text,
      medications: (p.medications as Medication[]) ?? [],
      practitioner: p.practitioner,
      prescriptionDate: p.prescription_date,
      notes: p.notes,
      createdAt: p.created_at,
    })),
  };
}

export async function createPrescription(data: {
  memberId: string;
  householdId: string;
  scanFilePath?: string;
  ocrText?: string;
  medications?: Medication[];
  practitioner?: string;
  prescriptionDate?: string;
  notes?: string;
}): Promise<ActionResult<Prescription>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: result, error } = await supabase
    .from("prescriptions")
    .insert({
      member_id: data.memberId,
      household_id: data.householdId,
      scan_file_path: data.scanFilePath ?? null,
      ocr_text: data.ocrText ?? null,
      medications: data.medications ?? [],
      practitioner: data.practitioner ?? null,
      prescription_date: data.prescriptionDate ?? null,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error)
    return {
      success: false,
      error: "Erreur lors de l'enregistrement de l'ordonnance",
    };

  revalidatePath("/sante-enrichie");

  return {
    success: true,
    data: {
      id: result.id,
      memberId: result.member_id,
      householdId: result.household_id,
      scanFilePath: result.scan_file_path,
      ocrText: result.ocr_text,
      medications: (result.medications as Medication[]) ?? [],
      practitioner: result.practitioner,
      prescriptionDate: result.prescription_date,
      notes: result.notes,
      createdAt: result.created_at,
    },
  };
}

export async function deletePrescription(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("prescriptions").delete().eq("id", id);
  if (error)
    return {
      success: false,
      error: "Erreur lors de la suppression de l'ordonnance",
    };

  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
