"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  invitationSchema,
  type InvitationFormData,
} from "@/lib/validators/sharing";
import type { HouseholdInvitation, HouseholdMember } from "@/types/sharing";

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

async function getUserHouseholdId(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return data?.id ?? null;
}

// ── Invitations ──

function mapInvitation(row: Record<string, unknown>): HouseholdInvitation {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    inviterId: row.inviter_id as string,
    inviteeEmail: row.invitee_email as string,
    role: row.role as HouseholdInvitation["role"],
    token: row.token as string,
    status: row.status as HouseholdInvitation["status"],
    expiresAt: row.expires_at as string,
    acceptedAt: (row.accepted_at as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getHouseholdInvitations(): Promise<
  ActionResult<HouseholdInvitation[]>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("household_invitations")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  return { success: true, data: (data ?? []).map(mapInvitation) };
}

export async function sendInvitation(
  formData: InvitationFormData
): Promise<ActionResult<HouseholdInvitation>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = invitationSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  // Check if already invited
  const { data: existing } = await supabase
    .from("household_invitations")
    .select("id")
    .eq("household_id", householdId)
    .eq("invitee_email", parsed.data.email)
    .eq("status", "pending")
    .single();

  if (existing)
    return {
      success: false,
      error: "Cette personne a déjà une invitation en attente",
    };

  const { data, error } = await supabase
    .from("household_invitations")
    .insert({
      household_id: householdId,
      inviter_id: user.id,
      invitee_email: parsed.data.email,
      role: parsed.data.role,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de l'envoi" };

  revalidatePath("/partage");
  return { success: true, data: mapInvitation(data) };
}

export async function cancelInvitation(id: string): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("household_invitations")
    .update({ status: "expired" })
    .eq("id", id)
    .eq("inviter_id", user.id);

  if (error) return { success: false, error: "Erreur lors de l'annulation" };

  revalidatePath("/partage");
  return { success: true };
}

export async function acceptInvitation(token: string): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: invitation, error: fetchError } = await supabase
    .from("household_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (fetchError || !invitation)
    return { success: false, error: "Invitation introuvable ou expirée" };

  if (new Date(invitation.expires_at) < new Date())
    return { success: false, error: "L'invitation a expiré" };

  // Add user to household
  const { error: memberError } = await supabase
    .from("household_members")
    .insert({
      household_id: invitation.household_id,
      user_id: user.id,
      role: invitation.role,
    });

  if (memberError)
    return { success: false, error: "Erreur lors de l'ajout au foyer" };

  // Mark invitation as accepted
  await supabase
    .from("household_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  revalidatePath("/dashboard");
  return { success: true };
}

// ── Household Members ──

function mapHouseholdMember(row: Record<string, unknown>): HouseholdMember {
  const profile = row.profiles as Record<string, unknown> | null;
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    userId: row.user_id as string,
    role: row.role as HouseholdMember["role"],
    joinedAt: row.joined_at as string,
    profile: profile
      ? {
          email: profile.email as string,
          firstName: profile.first_name as string,
          lastName: profile.last_name as string,
          avatarUrl: (profile.avatar_url as string) ?? null,
        }
      : undefined,
  };
}

export async function getHouseholdMembers(): Promise<
  ActionResult<HouseholdMember[]>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("household_members")
    .select("*, profiles(email, first_name, last_name, avatar_url)")
    .eq("household_id", householdId)
    .order("joined_at", { ascending: true });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  return { success: true, data: (data ?? []).map(mapHouseholdMember) };
}

export async function removeHouseholdMember(
  memberId: string
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  // Cannot remove yourself if you're the owner
  const { data: member } = await supabase
    .from("household_members")
    .select("role, user_id")
    .eq("id", memberId)
    .single();

  if (member?.role === "owner")
    return {
      success: false,
      error: "Impossible de retirer le propriétaire du foyer",
    };

  const { error } = await supabase
    .from("household_members")
    .delete()
    .eq("id", memberId);

  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/partage");
  return { success: true };
}

export async function updateMemberRole(
  memberId: string,
  role: "partner" | "viewer" | "nanny"
): Promise<ActionResult> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("household_members")
    .update({ role })
    .eq("id", memberId);

  if (error) return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/partage");
  return { success: true };
}
