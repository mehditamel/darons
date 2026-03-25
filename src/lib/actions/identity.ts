"use server";
import { type ActionResult, getAuthenticatedUser, getUserHouseholdId } from "@/lib/actions/safe-action";
import { revalidatePath } from "next/cache";
import { identityDocumentSchema, type IdentityDocumentFormData } from "@/lib/validators/family";
import type { IdentityDocument } from "@/types/family";
import { validateUUID } from "@/lib/validators/common";


export interface IdentityDocumentWithMember extends IdentityDocument {
  memberFirstName: string;
  memberLastName: string;
}

export async function getIdentityDocuments(): Promise<ActionResult<IdentityDocumentWithMember[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("identity_documents")
    .select(`
      *,
      family_members!inner(first_name, last_name, household_id)
    `)
    .eq("family_members.household_id", householdId)
    .order("expiry_date", { ascending: true, nullsFirst: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des documents" };

  return {
    success: true,
    data: (data ?? []).map((d) => ({
      id: d.id,
      memberId: d.member_id,
      documentType: d.document_type,
      documentNumber: d.document_number,
      issueDate: d.issue_date,
      expiryDate: d.expiry_date,
      issuingAuthority: d.issuing_authority,
      filePath: d.file_path,
      status: d.status,
      createdAt: d.created_at,
      memberFirstName: d.family_members.first_name,
      memberLastName: d.family_members.last_name,
    })),
  };
}

export async function getExpiringDocuments(): Promise<ActionResult<IdentityDocumentWithMember[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const { data, error } = await supabase
    .from("identity_documents")
    .select(`
      *,
      family_members!inner(first_name, last_name, household_id)
    `)
    .eq("family_members.household_id", householdId)
    .not("expiry_date", "is", null)
    .lte("expiry_date", sixMonthsFromNow.toISOString().split("T")[0])
    .order("expiry_date", { ascending: true });

  if (error) return { success: false, error: "Erreur lors de la récupération des alertes" };

  return {
    success: true,
    data: (data ?? []).map((d) => ({
      id: d.id,
      memberId: d.member_id,
      documentType: d.document_type,
      documentNumber: d.document_number,
      issueDate: d.issue_date,
      expiryDate: d.expiry_date,
      issuingAuthority: d.issuing_authority,
      filePath: d.file_path,
      status: d.status,
      createdAt: d.created_at,
      memberFirstName: d.family_members.first_name,
      memberLastName: d.family_members.last_name,
    })),
  };
}

export async function createIdentityDocument(
  formData: IdentityDocumentFormData
): Promise<ActionResult<IdentityDocument>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = identityDocumentSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data, error } = await supabase
    .from("identity_documents")
    .insert({
      member_id: parsed.data.memberId,
      document_type: parsed.data.documentType,
      document_number: parsed.data.documentNumber ?? null,
      issue_date: parsed.data.issueDate ?? null,
      expiry_date: parsed.data.expiryDate ?? null,
      issuing_authority: parsed.data.issuingAuthority ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création du document" };

  revalidatePath("/identite");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: {
      id: data.id,
      memberId: data.member_id,
      documentType: data.document_type,
      documentNumber: data.document_number,
      issueDate: data.issue_date,
      expiryDate: data.expiry_date,
      issuingAuthority: data.issuing_authority,
      filePath: data.file_path,
      status: data.status,
      createdAt: data.created_at,
    },
  };
}

export async function updateIdentityDocument(
  id: string,
  formData: IdentityDocumentFormData
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = identityDocumentSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase
    .from("identity_documents")
    .update({
      member_id: parsed.data.memberId,
      document_type: parsed.data.documentType,
      document_number: parsed.data.documentNumber ?? null,
      issue_date: parsed.data.issueDate ?? null,
      expiry_date: parsed.data.expiryDate ?? null,
      issuing_authority: parsed.data.issuingAuthority ?? null,
    })
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la mise à jour du document" };

  revalidatePath("/identite");
  revalidatePath("/dashboard");

  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function deleteIdentityDocument(id: string): Promise<ActionResult> {
  try {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("identity_documents")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la suppression du document" };

  revalidatePath("/identite");
  revalidatePath("/dashboard");

  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
