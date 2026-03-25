"use server";
import { type ActionResult, getAuthenticatedUser, getUserHouseholdId } from "@/lib/actions/safe-action";
import { revalidatePath } from "next/cache";
import { documentUploadSchema, type DocumentUploadFormData } from "@/lib/validators/documents";
import type { Document } from "@/types/budget";
import { validateUUID } from "@/lib/validators/common";


export interface DocumentWithMember extends Document {
  memberFirstName?: string;
  memberLastName?: string;
}

export async function getDocuments(filters?: {
  category?: string;
  memberId?: string;
  search?: string;
}): Promise<ActionResult<DocumentWithMember[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  let query = supabase
    .from("documents")
    .select(`
      *,
      family_members(first_name, last_name)
    `)
    .eq("household_id", householdId)
    .order("uploaded_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.memberId) {
    query = query.eq("member_id", filters.memberId);
  }
  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: "Erreur lors de la récupération des documents" };

  return {
    success: true,
    data: (data ?? []).map((d) => ({
      id: d.id,
      householdId: d.household_id,
      memberId: d.member_id,
      category: d.category,
      title: d.title,
      description: d.description,
      filePath: d.file_path,
      fileSize: d.file_size,
      mimeType: d.mime_type,
      tags: d.tags,
      uploadedAt: d.uploaded_at,
      memberFirstName: d.family_members?.first_name,
      memberLastName: d.family_members?.last_name,
    })),
  };
}

export async function uploadDocument(
  formData: FormData
): Promise<ActionResult<Document>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "Aucun fichier sélectionné" };

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, error: "Le fichier dépasse la taille maximale (10 Mo)" };
  }

  const metadata = {
    title: formData.get("title") as string,
    category: formData.get("category") as string,
    memberId: (formData.get("memberId") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = documentUploadSchema.safeParse(metadata);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const memberFolder = parsed.data.memberId ?? "household";
  const filePath = `${householdId}/${memberFolder}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: "Erreur lors de l'upload du fichier" };
  }

  const { data, error: insertError } = await supabase
    .from("documents")
    .insert({
      household_id: householdId,
      member_id: parsed.data.memberId ?? null,
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      tags: parsed.data.tags ?? null,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from("documents").remove([filePath]);
    return { success: false, error: "Erreur lors de l'enregistrement du document" };
  }

  revalidatePath("/documents");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: data.id,
      householdId: data.household_id,
      memberId: data.member_id,
      category: data.category,
      title: data.title,
      description: data.description,
      filePath: data.file_path,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      tags: data.tags,
      uploadedAt: data.uploaded_at,
    },
  };
}

export async function getDocumentSignedUrl(
  filePath: string
): Promise<ActionResult<string>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 3600);

  if (error) return { success: false, error: "Erreur lors de la génération du lien" };

  return { success: true, data: data.signedUrl };
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  try {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: doc } = await supabase
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .single();

  if (doc?.file_path) {
    await supabase.storage.from("documents").remove([doc.file_path]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { success: false, error: "Erreur lors de la suppression du document" };

  revalidatePath("/documents");
  revalidatePath("/dashboard");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
