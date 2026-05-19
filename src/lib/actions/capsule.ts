"use server";
import { revalidatePath } from "next/cache";
import {
  type ActionResult,
  getAuthenticatedUser,
  getUserHouseholdId,
} from "@/lib/actions/safe-action";
import { validateUUID } from "@/lib/validators/common";
import {
  ACCEPTED_MEMORY_MIMES,
  MAX_MEMORY_SIZE_BYTES,
  generateRecapSchema,
  type GenerateRecapData,
} from "@/lib/validators/capsule";
import {
  aggregatePeriodData,
  quarterBoundsForDate,
  yearBoundsForDate,
} from "@/lib/capsule/aggregator";
import { generateRecapContent } from "@/lib/capsule/generator";
import { periodLabel, type CapsuleRecap, type CapsuleRecapWithMember, type Memory, type MemoryWithUrl } from "@/types/capsule";

function mapMemory(row: Record<string, unknown>): Memory {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    memberId: row.member_id as string,
    memoryType: row.memory_type as Memory["memoryType"],
    filePath: (row.file_path as string) ?? null,
    mimeType: (row.mime_type as string) ?? null,
    fileSize: (row.file_size as number) ?? null,
    caption: (row.caption as string) ?? null,
    memoryDate: row.memory_date as string,
    tags: (row.tags as string[]) ?? null,
    createdBy: (row.created_by as string) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapRecap(row: Record<string, unknown>): CapsuleRecap {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    memberId: row.member_id as string,
    periodType: row.period_type as CapsuleRecap["periodType"],
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    title: (row.title as string) ?? null,
    content: row.content as CapsuleRecap["content"],
    coverMemoryId: (row.cover_memory_id as string) ?? null,
    status: row.status as CapsuleRecap["status"],
    errorMessage: (row.error_message as string) ?? null,
    generatedAt: row.generated_at as string,
  };
}

export async function uploadMemory(formData: FormData): Promise<ActionResult<Memory>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const memberId = formData.get("memberId") as string;
  const caption = (formData.get("caption") as string) || null;
  const memoryDate =
    (formData.get("memoryDate") as string) || new Date().toISOString().slice(0, 10);
  const file = formData.get("file") as File | null;

  const uuidCheck = validateUUID(memberId);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  if (!file) return { success: false, error: "Aucun fichier sélectionné" };
  if (file.size > MAX_MEMORY_SIZE_BYTES) {
    return { success: false, error: "Fichier trop lourd (max 10 Mo)" };
  }
  if (!ACCEPTED_MEMORY_MIMES.includes(file.type)) {
    return { success: false, error: "Format non supporté (JPEG, PNG, WebP, HEIC, MP4)" };
  }

  const isVideo = file.type.startsWith("video/");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filePath = `${householdId}/${memberId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("memories")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[uploadMemory]", uploadError);
    return { success: false, error: "Erreur lors de l'upload" };
  }

  const { data, error } = await supabase
    .from("memories")
    .insert({
      household_id: householdId,
      member_id: memberId,
      memory_type: isVideo ? "video" : "photo",
      file_path: filePath,
      mime_type: file.type,
      file_size: file.size,
      caption,
      memory_date: memoryDate,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !data) {
    await supabase.storage.from("memories").remove([filePath]);
    return { success: false, error: "Erreur d'enregistrement du souvenir" };
  }

  revalidatePath("/capsule");
  revalidatePath(`/capsule/${memberId}`);
  return { success: true, data: mapMemory(data) };
}

export async function listMemories(
  memberId: string
): Promise<ActionResult<MemoryWithUrl[]>> {
  const uuidCheck = validateUUID(memberId);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("member_id", memberId)
    .eq("household_id", householdId)
    .order("memory_date", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  const memories = (data ?? []).map(mapMemory);

  const signed = await Promise.all(
    memories.map(async (m) => {
      if (!m.filePath) return { ...m, signedUrl: null };
      const { data: urlData } = await supabase.storage
        .from("memories")
        .createSignedUrl(m.filePath, 3600);
      return { ...m, signedUrl: urlData?.signedUrl ?? null };
    })
  );

  return { success: true, data: signed };
}

export async function deleteMemory(id: string): Promise<ActionResult> {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: memory } = await supabase
    .from("memories")
    .select("file_path, member_id")
    .eq("id", id)
    .single();

  if (memory?.file_path) {
    await supabase.storage.from("memories").remove([memory.file_path]);
  }

  const { error } = await supabase.from("memories").delete().eq("id", id);
  if (error) return { success: false, error: "Suppression impossible" };

  revalidatePath("/capsule");
  if (memory) revalidatePath(`/capsule/${memory.member_id}`);
  return { success: true };
}

export async function generateRecap(
  payload: GenerateRecapData
): Promise<ActionResult<CapsuleRecap>> {
  const parsed = generateRecapSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data: member } = await supabase
    .from("family_members")
    .select("id")
    .eq("id", parsed.data.memberId)
    .eq("household_id", householdId)
    .single();
  if (!member) return { success: false, error: "Enfant introuvable" };

  const label = periodLabel(parsed.data.periodType, parsed.data.periodStart);
  const aggregated = await aggregatePeriodData(
    supabase,
    parsed.data.memberId,
    parsed.data.periodStart,
    parsed.data.periodEnd,
    label
  );
  if (!aggregated) return { success: false, error: "Impossible de charger les données" };

  let content;
  try {
    content = await generateRecapContent(aggregated);
  } catch (e) {
    console.error("[generateRecap]", e);
    return { success: false, error: "L'IA n'a pas pu générer le récap. Réessaie." };
  }

  const { data: existing } = await supabase
    .from("capsule_recaps")
    .select("id")
    .eq("member_id", parsed.data.memberId)
    .eq("period_type", parsed.data.periodType)
    .eq("period_start", parsed.data.periodStart)
    .maybeSingle();

  const baseRow = {
    household_id: householdId,
    member_id: parsed.data.memberId,
    period_type: parsed.data.periodType,
    period_start: parsed.data.periodStart,
    period_end: parsed.data.periodEnd,
    title: content.title,
    content,
    status: "ready" as const,
    generated_at: new Date().toISOString(),
  };

  let row;
  if (existing) {
    const { data, error } = await supabase
      .from("capsule_recaps")
      .update(baseRow)
      .eq("id", existing.id)
      .select()
      .single();
    if (error || !data) return { success: false, error: "Erreur d'enregistrement" };
    row = data;
  } else {
    const { data, error } = await supabase
      .from("capsule_recaps")
      .insert(baseRow)
      .select()
      .single();
    if (error || !data) return { success: false, error: "Erreur d'enregistrement" };
    row = data;
  }

  revalidatePath("/capsule");
  revalidatePath(`/capsule/${parsed.data.memberId}`);
  return { success: true, data: mapRecap(row) };
}

export async function listRecapsForMember(
  memberId: string
): Promise<ActionResult<CapsuleRecap[]>> {
  const uuidCheck = validateUUID(memberId);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("capsule_recaps")
    .select("*")
    .eq("member_id", memberId)
    .eq("household_id", householdId)
    .order("period_start", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  return { success: true, data: (data ?? []).map(mapRecap) };
}

export async function getRecapById(
  id: string
): Promise<ActionResult<CapsuleRecapWithMember>> {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("capsule_recaps")
    .select("*, family_members!inner(first_name, last_name)")
    .eq("id", id)
    .eq("household_id", householdId)
    .single();

  if (error || !data) return { success: false, error: "Récap introuvable" };

  const recap = mapRecap(data);
  const member = data.family_members as Record<string, unknown>;
  return {
    success: true,
    data: {
      ...recap,
      memberFirstName: member.first_name as string,
      memberLastName: member.last_name as string,
    },
  };
}

export async function suggestNextPeriod(
  memberId: string
): Promise<ActionResult<{ periodType: "quarter"; periodStart: string; periodEnd: string; label: string }>> {
  const uuidCheck = validateUUID(memberId);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const now = new Date();
  const lastQuarterDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const bounds = quarterBoundsForDate(lastQuarterDate);
  return {
    success: true,
    data: {
      periodType: "quarter",
      periodStart: bounds.start,
      periodEnd: bounds.end,
      label: periodLabel("quarter", bounds.start),
    },
  };
}

export { quarterBoundsForDate, yearBoundsForDate };
