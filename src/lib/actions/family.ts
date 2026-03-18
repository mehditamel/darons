"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { familyMemberSchema, type FamilyMemberFormData } from "@/lib/validators/family";
import type { FamilyMember, Household } from "@/types/family";

export type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { user: null, supabase };
  }
  return { user, supabase };
}

export async function getHousehold(): Promise<ActionResult<Household>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("households")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error) return { success: false, error: "Foyer introuvable" };

  return {
    success: true,
    data: {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      createdAt: data.created_at,
    },
  };
}

export async function getFamilyMembers(): Promise<ActionResult<FamilyMember[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!household) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("household_id", household.id)
    .order("member_type", { ascending: false })
    .order("birth_date", { ascending: true });

  if (error) return { success: false, error: "Erreur lors de la récupération des membres" };

  return {
    success: true,
    data: (data ?? []).map((m) => ({
      id: m.id,
      householdId: m.household_id,
      firstName: m.first_name,
      lastName: m.last_name,
      birthDate: m.birth_date,
      gender: m.gender,
      memberType: m.member_type,
      photoUrl: m.photo_url,
      notes: m.notes,
      createdAt: m.created_at,
      updatedAt: m.updated_at,
    })),
  };
}

export async function createFamilyMember(
  formData: FamilyMemberFormData
): Promise<ActionResult<FamilyMember>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = familyMemberSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!household) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("family_members")
    .insert({
      household_id: household.id,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      birth_date: parsed.data.birthDate,
      gender: parsed.data.gender,
      member_type: parsed.data.memberType,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création du membre" };

  revalidatePath("/parametres");
  revalidatePath("/dashboard");
  revalidatePath("/identite");
  revalidatePath("/sante");

  return {
    success: true,
    data: {
      id: data.id,
      householdId: data.household_id,
      firstName: data.first_name,
      lastName: data.last_name,
      birthDate: data.birth_date,
      gender: data.gender,
      memberType: data.member_type,
      photoUrl: data.photo_url,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function updateFamilyMember(
  id: string,
  formData: FamilyMemberFormData
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = familyMemberSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { error } = await supabase
    .from("family_members")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      birth_date: parsed.data.birthDate,
      gender: parsed.data.gender,
      member_type: parsed.data.memberType,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la mise à jour du membre" };

  revalidatePath("/parametres");
  revalidatePath("/dashboard");
  revalidatePath("/identite");
  revalidatePath("/sante");

  return { success: true };
}

export async function deleteFamilyMember(id: string): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la suppression du membre" };

  revalidatePath("/parametres");
  revalidatePath("/dashboard");
  revalidatePath("/identite");
  revalidatePath("/sante");

  return { success: true };
}
