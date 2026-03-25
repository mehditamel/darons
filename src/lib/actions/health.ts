"use server";
import { type ActionResult, getAuthenticatedUser } from "@/lib/actions/safe-action";
import { revalidatePath } from "next/cache";
import {
  vaccinationSchema,
  growthMeasurementSchema,
  medicalAppointmentSchema,
  type VaccinationFormData,
  type GrowthMeasurementFormData,
  type MedicalAppointmentFormData,
} from "@/lib/validators/health";
import type { Vaccination, GrowthMeasurement, MedicalAppointment } from "@/types/health";
import { syncMedicalAppointmentToCalendar } from "@/lib/integrations/google-calendar";
import { validateUUID } from "@/lib/validators/common";

// --- Vaccinations ---

export async function getVaccinations(memberId: string): Promise<ActionResult<Vaccination[]>> {
  const uuidCheck = validateUUID(memberId);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("vaccinations")
    .select("*")
    .eq("member_id", memberId)
    .order("administered_date", { ascending: true, nullsFirst: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des vaccins" };

  return {
    success: true,
    data: (data ?? []).map((v) => ({
      id: v.id,
      memberId: v.member_id,
      vaccineName: v.vaccine_name,
      vaccineCode: v.vaccine_code,
      doseNumber: v.dose_number,
      administeredDate: v.administered_date,
      nextDueDate: v.next_due_date,
      practitioner: v.practitioner,
      batchNumber: v.batch_number,
      notes: v.notes,
      status: v.status,
      fhirResourceId: v.fhir_resource_id ?? null,
      fhirLastUpdated: v.fhir_last_updated ?? null,
      syncSource: v.sync_source ?? "local",
      createdAt: v.created_at,
    })),
  };
}

export async function getVaccinationsByMembers(memberIds: string[]): Promise<ActionResult<Vaccination[]>> {
  if (memberIds.length === 0) return { success: true, data: [] };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("vaccinations")
    .select("*")
    .in("member_id", memberIds)
    .order("administered_date", { ascending: true, nullsFirst: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des vaccins" };

  return {
    success: true,
    data: (data ?? []).map((v) => ({
      id: v.id,
      memberId: v.member_id,
      vaccineName: v.vaccine_name,
      vaccineCode: v.vaccine_code,
      doseNumber: v.dose_number,
      administeredDate: v.administered_date,
      nextDueDate: v.next_due_date,
      practitioner: v.practitioner,
      batchNumber: v.batch_number,
      notes: v.notes,
      status: v.status,
      fhirResourceId: v.fhir_resource_id ?? null,
      fhirLastUpdated: v.fhir_last_updated ?? null,
      syncSource: v.sync_source ?? "local",
      createdAt: v.created_at,
    })),
  };
}

export async function createVaccination(
  formData: VaccinationFormData
): Promise<ActionResult<Vaccination>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = vaccinationSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("vaccinations")
    .insert({
      member_id: parsed.data.memberId,
      vaccine_name: parsed.data.vaccineName,
      vaccine_code: parsed.data.vaccineCode,
      dose_number: parsed.data.doseNumber,
      administered_date: parsed.data.administeredDate,
      practitioner: parsed.data.practitioner ?? null,
      batch_number: parsed.data.batchNumber ?? null,
      notes: parsed.data.notes ?? null,
      status: "done",
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de l'enregistrement du vaccin" };

  revalidatePath("/sante");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      vaccineName: data.vaccine_name,
      vaccineCode: data.vaccine_code,
      doseNumber: data.dose_number,
      administeredDate: data.administered_date,
      nextDueDate: data.next_due_date,
      practitioner: data.practitioner,
      batchNumber: data.batch_number,
      notes: data.notes,
      status: data.status,
      createdAt: data.created_at,
    },
  };
}

export async function deleteVaccination(id: string): Promise<ActionResult> {
  try {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("vaccinations").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression du vaccin" };

  revalidatePath("/sante");
  revalidatePath("/dashboard");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Growth Measurements ---

export async function getGrowthMeasurements(
  memberId: string
): Promise<ActionResult<GrowthMeasurement[]>> {
  const uuidCheck = validateUUID(memberId);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("growth_measurements")
    .select("*")
    .eq("member_id", memberId)
    .order("measurement_date", { ascending: true });

  if (error) return { success: false, error: "Erreur lors de la récupération des mesures" };

  return {
    success: true,
    data: (data ?? []).map((m) => ({
      id: m.id,
      memberId: m.member_id,
      measurementDate: m.measurement_date,
      weightKg: m.weight_kg ? Number(m.weight_kg) : null,
      heightCm: m.height_cm ? Number(m.height_cm) : null,
      headCircumferenceCm: m.head_circumference_cm ? Number(m.head_circumference_cm) : null,
      notes: m.notes,
      fhirResourceId: m.fhir_resource_id ?? null,
      fhirLastUpdated: m.fhir_last_updated ?? null,
      syncSource: m.sync_source ?? "local",
      createdAt: m.created_at,
    })),
  };
}

export async function createGrowthMeasurement(
  formData: GrowthMeasurementFormData
): Promise<ActionResult<GrowthMeasurement>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = growthMeasurementSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("growth_measurements")
    .insert({
      member_id: parsed.data.memberId,
      measurement_date: parsed.data.measurementDate,
      weight_kg: parsed.data.weightKg ?? null,
      height_cm: parsed.data.heightCm ?? null,
      head_circumference_cm: parsed.data.headCircumferenceCm ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de l'enregistrement de la mesure" };

  revalidatePath("/sante");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      measurementDate: data.measurement_date,
      weightKg: data.weight_kg ? Number(data.weight_kg) : null,
      heightCm: data.height_cm ? Number(data.height_cm) : null,
      headCircumferenceCm: data.head_circumference_cm ? Number(data.head_circumference_cm) : null,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function deleteGrowthMeasurement(id: string): Promise<ActionResult> {
  try {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("growth_measurements").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression de la mesure" };

  revalidatePath("/sante");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Medical Appointments ---

export async function getMedicalAppointments(
  memberId: string
): Promise<ActionResult<MedicalAppointment[]>> {
  const uuidCheck = validateUUID(memberId);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("medical_appointments")
    .select("*")
    .eq("member_id", memberId)
    .order("appointment_date", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des RDV" };

  return {
    success: true,
    data: (data ?? []).map((a) => ({
      id: a.id,
      memberId: a.member_id,
      appointmentType: a.appointment_type,
      practitioner: a.practitioner,
      location: a.location,
      appointmentDate: a.appointment_date,
      notes: a.notes,
      completed: a.completed,
      createdAt: a.created_at,
    })),
  };
}

export async function getUpcomingAppointments(
  limit = 5
): Promise<ActionResult<MedicalAppointment[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!household) return { success: true, data: [] };

  const { data: memberIds } = await supabase
    .from("family_members")
    .select("id")
    .eq("household_id", household.id);

  if (!memberIds || memberIds.length === 0) return { success: true, data: [] };

  const ids = memberIds.map((m) => m.id);
  const today = new Date().toISOString();

  const { data, error } = await supabase
    .from("medical_appointments")
    .select("*")
    .in("member_id", ids)
    .eq("completed", false)
    .gte("appointment_date", today)
    .order("appointment_date", { ascending: true })
    .limit(limit);

  if (error) return { success: false, error: "Erreur lors de la récupération des RDV" };

  return {
    success: true,
    data: (data ?? []).map((a) => ({
      id: a.id,
      memberId: a.member_id,
      appointmentType: a.appointment_type,
      practitioner: a.practitioner,
      location: a.location,
      appointmentDate: a.appointment_date,
      notes: a.notes,
      completed: a.completed,
      createdAt: a.created_at,
    })),
  };
}

export async function createMedicalAppointment(
  formData: MedicalAppointmentFormData
): Promise<ActionResult<MedicalAppointment>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = medicalAppointmentSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("medical_appointments")
    .insert({
      member_id: parsed.data.memberId,
      appointment_type: parsed.data.appointmentType,
      practitioner: parsed.data.practitioner ?? null,
      location: parsed.data.location ?? null,
      appointment_date: parsed.data.appointmentDate,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création du RDV" };

  revalidatePath("/sante");

  // Best-effort: sync to Google Calendar if connected
  const { data: member } = await supabase
    .from("family_members")
    .select("first_name")
    .eq("id", data.member_id)
    .single();

  // Best-effort calendar sync — don't block the response
  syncMedicalAppointmentToCalendar(
    user.id,
    member?.first_name ?? "Enfant",
    data.appointment_type,
    data.appointment_date,
    data.practitioner,
    data.location
  ).catch(() => {
    // Calendar sync is best-effort; failures are non-blocking
  });

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      appointmentType: data.appointment_type,
      practitioner: data.practitioner,
      location: data.location,
      appointmentDate: data.appointment_date,
      notes: data.notes,
      completed: data.completed,
      createdAt: data.created_at,
    },
  };
}

export async function toggleAppointmentCompleted(
  id: string,
  completed: boolean
): Promise<ActionResult> {
  try {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("medical_appointments")
    .update({ completed })
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la mise à jour du RDV" };

  revalidatePath("/sante");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function deleteMedicalAppointment(id: string): Promise<ActionResult> {
  try {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("medical_appointments").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression du RDV" };

  revalidatePath("/sante");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
