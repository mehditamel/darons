"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { familyMemberSchema, householdSchema, profileSchema, type FamilyMemberFormData, type HouseholdFormData, type ProfileFormData } from "@/lib/validators/family";
import { validateUUID } from "@/lib/validators/common";
import type { ActionResult } from "@/lib/actions/safe-action";
import type { FamilyMember, Household } from "@/types/family";

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

export async function createHousehold(
  formData: HouseholdFormData
): Promise<ActionResult<Household>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = householdSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  // Check if user already has a household
  const { data: existing } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (existing) {
    return {
      success: true,
      data: {
        id: existing.id,
        name: parsed.data.name,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
      },
    };
  }

  const { data, error } = await supabase
    .from("households")
    .insert({
      name: parsed.data.name,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la création du foyer" };

  revalidatePath("/dashboard");
  revalidatePath("/parametres");

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
      gestationalAgeWeeks: m.gestational_age_weeks ?? null,
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
      gestationalAgeWeeks: data.gestational_age_weeks ?? null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  };
}

export async function updateGestationalAge(
  memberId: string,
  gestationalAgeWeeks: number | null
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("family_members")
    .update({ gestational_age_weeks: gestationalAgeWeeks })
    .eq("id", memberId);

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/sante");
  revalidatePath("/sante-enrichie");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function updateFamilyMember(
  id: string,
  formData: FamilyMemberFormData
): Promise<ActionResult> {
  try {
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
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function deleteFamilyMember(id: string): Promise<ActionResult> {
  try {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };
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
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function updateProfile(
  formData: ProfileFormData
): Promise<ActionResult> {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return { success: false, error: "Non authentifié" };

    const parsed = profileSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Données invalides" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { success: false, error: "Erreur lors de la mise à jour du profil" };

    revalidatePath("/parametres");
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
