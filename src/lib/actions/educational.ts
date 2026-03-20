"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  activitySchema,
  schoolingSchema,
  milestoneSchema,
  journalEntrySchema,
  type ActivityFormData,
  type SchoolingFormData,
  type MilestoneFormData,
  type JournalEntryFormData,
} from "@/lib/validators/educational";
import type { Activity, Schooling } from "@/types/educational";
import type { DevelopmentMilestone, ParentJournalEntry } from "@/types/health";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

// --- Activities ---

export async function getActivities(memberId: string): Promise<ActionResult<Activity[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("member_id", memberId)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (error) return { success: false, error: "Erreur lors de la récupération des activités" };

  return {
    success: true,
    data: (data ?? []).map((a) => ({
      id: a.id,
      memberId: a.member_id,
      name: a.name,
      category: a.category,
      provider: a.provider,
      schedule: a.schedule,
      costMonthly: a.cost_monthly ? Number(a.cost_monthly) : null,
      startDate: a.start_date,
      endDate: a.end_date,
      active: a.active,
      notes: a.notes,
      createdAt: a.created_at,
    })),
  };
}

export async function createActivity(formData: ActivityFormData): Promise<ActionResult<Activity>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = activitySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("activities")
    .insert({
      member_id: parsed.data.memberId,
      name: parsed.data.name,
      category: parsed.data.category ?? null,
      provider: parsed.data.provider ?? null,
      schedule: parsed.data.schedule ?? null,
      cost_monthly: parsed.data.costMonthly ?? null,
      start_date: parsed.data.startDate ?? null,
      end_date: parsed.data.endDate ?? null,
      active: parsed.data.active ?? true,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création de l'activité" };

  revalidatePath("/activites");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      name: data.name,
      category: data.category,
      provider: data.provider,
      schedule: data.schedule,
      costMonthly: data.cost_monthly ? Number(data.cost_monthly) : null,
      startDate: data.start_date,
      endDate: data.end_date,
      active: data.active,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function updateActivity(
  id: string,
  formData: ActivityFormData
): Promise<ActionResult<Activity>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = activitySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("activities")
    .update({
      name: parsed.data.name,
      category: parsed.data.category ?? null,
      provider: parsed.data.provider ?? null,
      schedule: parsed.data.schedule ?? null,
      cost_monthly: parsed.data.costMonthly ?? null,
      start_date: parsed.data.startDate ?? null,
      end_date: parsed.data.endDate ?? null,
      active: parsed.data.active ?? true,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la modification de l'activité" };

  revalidatePath("/activites");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      name: data.name,
      category: data.category,
      provider: data.provider,
      schedule: data.schedule,
      costMonthly: data.cost_monthly ? Number(data.cost_monthly) : null,
      startDate: data.start_date,
      endDate: data.end_date,
      active: data.active,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression de l'activité" };

  revalidatePath("/activites");
  revalidatePath("/dashboard");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Schooling ---

export async function getSchooling(memberId: string): Promise<ActionResult<Schooling[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("schooling")
    .select("*")
    .eq("member_id", memberId)
    .order("school_year", { ascending: true });

  if (error) return { success: false, error: "Erreur lors de la récupération de la scolarité" };

  return {
    success: true,
    data: (data ?? []).map((s) => ({
      id: s.id,
      memberId: s.member_id,
      schoolYear: s.school_year,
      level: s.level,
      establishment: s.establishment,
      teacher: s.teacher,
      className: s.class_name,
      notes: s.notes,
      createdAt: s.created_at,
    })),
  };
}

export async function createSchooling(formData: SchoolingFormData): Promise<ActionResult<Schooling>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = schoolingSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("schooling")
    .insert({
      member_id: parsed.data.memberId,
      school_year: parsed.data.schoolYear,
      level: parsed.data.level,
      establishment: parsed.data.establishment ?? null,
      teacher: parsed.data.teacher ?? null,
      class_name: parsed.data.className ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de l'ajout de l'année scolaire" };

  revalidatePath("/scolarite");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      schoolYear: data.school_year,
      level: data.level,
      establishment: data.establishment,
      teacher: data.teacher,
      className: data.class_name,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function updateSchooling(
  id: string,
  formData: SchoolingFormData
): Promise<ActionResult<Schooling>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = schoolingSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("schooling")
    .update({
      school_year: parsed.data.schoolYear,
      level: parsed.data.level,
      establishment: parsed.data.establishment ?? null,
      teacher: parsed.data.teacher ?? null,
      class_name: parsed.data.className ?? null,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la modification de l'année scolaire" };

  revalidatePath("/scolarite");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      schoolYear: data.school_year,
      level: data.level,
      establishment: data.establishment,
      teacher: data.teacher,
      className: data.class_name,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function deleteSchooling(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("schooling").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression de l'année scolaire" };

  revalidatePath("/scolarite");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Development Milestones ---

export async function getMilestones(memberId: string): Promise<ActionResult<DevelopmentMilestone[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("development_milestones")
    .select("*")
    .eq("member_id", memberId)
    .order("expected_age_months", { ascending: true, nullsFirst: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des jalons" };

  return {
    success: true,
    data: (data ?? []).map((m) => ({
      id: m.id,
      memberId: m.member_id,
      category: m.category,
      milestoneName: m.milestone_name,
      expectedAgeMonths: m.expected_age_months,
      achievedDate: m.achieved_date,
      notes: m.notes,
      createdAt: m.created_at,
    })),
  };
}

export async function createMilestone(
  formData: MilestoneFormData
): Promise<ActionResult<DevelopmentMilestone>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = milestoneSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("development_milestones")
    .insert({
      member_id: parsed.data.memberId,
      category: parsed.data.category,
      milestone_name: parsed.data.milestoneName,
      expected_age_months: parsed.data.expectedAgeMonths ?? null,
      achieved_date: parsed.data.achievedDate ?? null,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de l'ajout du jalon" };

  revalidatePath("/developpement");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      category: data.category,
      milestoneName: data.milestone_name,
      expectedAgeMonths: data.expected_age_months,
      achievedDate: data.achieved_date,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function updateMilestone(
  id: string,
  formData: MilestoneFormData
): Promise<ActionResult<DevelopmentMilestone>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = milestoneSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("development_milestones")
    .update({
      category: parsed.data.category,
      milestone_name: parsed.data.milestoneName,
      expected_age_months: parsed.data.expectedAgeMonths ?? null,
      achieved_date: parsed.data.achievedDate ?? null,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la modification du jalon" };

  revalidatePath("/developpement");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      category: data.category,
      milestoneName: data.milestone_name,
      expectedAgeMonths: data.expected_age_months,
      achievedDate: data.achieved_date,
      notes: data.notes,
      createdAt: data.created_at,
    },
  };
}

export async function deleteMilestone(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("development_milestones").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression du jalon" };

  revalidatePath("/developpement");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// --- Parent Journal ---

export async function getJournalEntries(
  memberId: string
): Promise<ActionResult<ParentJournalEntry[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("parent_journal")
    .select("*")
    .eq("member_id", memberId)
    .order("entry_date", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération du journal" };

  return {
    success: true,
    data: (data ?? []).map((j) => ({
      id: j.id,
      memberId: j.member_id,
      entryDate: j.entry_date,
      content: j.content,
      mood: j.mood,
      tags: j.tags ?? [],
      createdAt: j.created_at,
    })),
  };
}

export async function createJournalEntry(
  formData: JournalEntryFormData
): Promise<ActionResult<ParentJournalEntry>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = journalEntrySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("parent_journal")
    .insert({
      member_id: parsed.data.memberId,
      entry_date: parsed.data.entryDate,
      content: parsed.data.content,
      mood: parsed.data.mood ?? null,
      tags: parsed.data.tags ?? [],
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de l'ajout de l'entrée" };

  revalidatePath("/developpement");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      entryDate: data.entry_date,
      content: data.content,
      mood: data.mood,
      tags: data.tags ?? [],
      createdAt: data.created_at,
    },
  };
}

export async function updateJournalEntry(
  id: string,
  formData: JournalEntryFormData
): Promise<ActionResult<ParentJournalEntry>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = journalEntrySchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("parent_journal")
    .update({
      entry_date: parsed.data.entryDate,
      content: parsed.data.content,
      mood: parsed.data.mood ?? null,
      tags: parsed.data.tags ?? [],
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la modification de l'entrée" };

  revalidatePath("/developpement");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      entryDate: data.entry_date,
      content: data.content,
      mood: data.mood,
      tags: data.tags ?? [],
      createdAt: data.created_at,
    },
  };
}

export async function deleteJournalEntry(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase.from("parent_journal").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression de l'entrée" };

  revalidatePath("/developpement");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
