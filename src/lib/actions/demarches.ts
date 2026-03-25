"use server";
import { type ActionResult, getAuthenticatedUser, getUserHouseholdId } from "@/lib/actions/safe-action";
import { revalidatePath } from "next/cache";
import {
  administrativeTaskSchema,
  type AdministrativeTaskFormData,
} from "@/lib/validators/demarches";
import { DEMARCHES_CHECKLIST_TEMPLATES } from "@/lib/constants";
import type { AdministrativeTask } from "@/types/demarches";
import { addMonths, format } from "date-fns";

function mapTask(row: Record<string, unknown>): AdministrativeTask {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    memberId: (row.member_id as string) ?? null,
    title: row.title as string,
    description: (row.description as string) ?? null,
    category: row.category as AdministrativeTask["category"],
    dueDate: (row.due_date as string) ?? null,
    triggerAgeMonths: row.trigger_age_months
      ? Number(row.trigger_age_months)
      : null,
    completed: row.completed as boolean,
    completedAt: (row.completed_at as string) ?? null,
    url: (row.url as string) ?? null,
    templateId: (row.template_id as string) ?? null,
    priority: row.priority as AdministrativeTask["priority"],
    createdAt: row.created_at as string,
  };
}

// ── Get All Tasks ──

export async function getAdministrativeTasks(): Promise<
  ActionResult<AdministrativeTask[]>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("administrative_tasks")
    .select("*")
    .eq("household_id", householdId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error)
    return {
      success: false,
      error: "Erreur lors de la récupération des démarches",
    };

  return { success: true, data: (data ?? []).map(mapTask) };
}

// ── Create Task ──

export async function createAdministrativeTask(
  formData: AdministrativeTaskFormData
): Promise<ActionResult<AdministrativeTask>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = administrativeTaskSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("administrative_tasks")
    .insert({
      household_id: householdId,
      member_id: parsed.data.memberId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      due_date: parsed.data.dueDate,
      priority: parsed.data.priority,
      url: parsed.data.url,
      completed: parsed.data.completed,
    })
    .select()
    .single();

  if (error)
    return { success: false, error: "Erreur lors de la création de la démarche" };

  revalidatePath("/demarches");
  return { success: true, data: mapTask(data) };
}

// ── Update Task ──

export async function updateAdministrativeTask(
  id: string,
  formData: AdministrativeTaskFormData
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = administrativeTaskSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const { error } = await supabase
    .from("administrative_tasks")
    .update({
      member_id: parsed.data.memberId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      due_date: parsed.data.dueDate,
      priority: parsed.data.priority,
      url: parsed.data.url,
      completed: parsed.data.completed,
      completed_at: parsed.data.completed ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/demarches");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Toggle Task ──

export async function toggleAdministrativeTask(
  id: string
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  // Get current state
  const { data: current, error: fetchError } = await supabase
    .from("administrative_tasks")
    .select("completed")
    .eq("id", id)
    .single();

  if (fetchError || !current)
    return { success: false, error: "Démarche introuvable" };

  const newCompleted = !current.completed;

  const { error } = await supabase
    .from("administrative_tasks")
    .update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/demarches");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Delete Task ──

export async function deleteAdministrativeTask(
  id: string
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("administrative_tasks")
    .delete()
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/demarches");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Generate Tasks from Templates ──

export async function generateTasksFromTemplates(
  memberId: string,
  birthDate: string
): Promise<ActionResult<number>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  // Check if tasks already exist for this member
  const { count } = await supabase
    .from("administrative_tasks")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId)
    .eq("member_id", memberId)
    .not("template_id", "is", null);

  if (count && count > 0) {
    return { success: true, data: 0 };
  }

  const birthDateObj = new Date(birthDate);
  const now = new Date();

  const tasks = DEMARCHES_CHECKLIST_TEMPLATES.map((template) => {
    const targetDate = addMonths(birthDateObj, template.triggerAgeMonths);
    const isPast = targetDate < now;

    return {
      household_id: householdId,
      member_id: memberId,
      title: template.title,
      description: template.description,
      category: template.category,
      due_date: format(targetDate, "yyyy-MM-dd"),
      trigger_age_months: template.triggerAgeMonths,
      completed: isPast && template.triggerAgeMonths <= 0,
      completed_at:
        isPast && template.triggerAgeMonths <= 0
          ? format(targetDate, "yyyy-MM-dd'T'HH:mm:ss")
          : null,
      url: "url" in template ? (template.url as string) : null,
      template_id: template.id,
      priority: template.priority,
    };
  });

  const { error } = await supabase
    .from("administrative_tasks")
    .insert(tasks);

  if (error)
    return {
      success: false,
      error: "Erreur lors de la génération des démarches",
    };

  revalidatePath("/demarches");
  return { success: true, data: tasks.length };
}
