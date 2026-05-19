"use server";
import { revalidatePath } from "next/cache";
import {
  type ActionResult,
  getAuthenticatedUser,
  getUserHouseholdId,
} from "@/lib/actions/safe-action";
import {
  createTrustCardSchema,
  type CreateTrustCardData,
} from "@/lib/validators/trust-card";
import { validateUUID } from "@/lib/validators/common";
import { generateToken, generatePin, hashPin } from "@/lib/trust-card/token";
import type {
  TrustCard,
  TrustCardSection,
  TrustCardWithMember,
} from "@/types/trust-card";

interface TrustCardCreated {
  card: TrustCard;
  pin: string;
  shareUrl: string;
}

function mapCard(row: Record<string, unknown>): TrustCard {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    memberId: row.member_id as string,
    createdBy: row.created_by as string,
    label: (row.label as string) ?? null,
    token: row.token as string,
    sections: (row.sections as TrustCardSection[]) ?? [],
    notes: (row.notes as string) ?? null,
    expiresAt: row.expires_at as string,
    revokedAt: (row.revoked_at as string) ?? null,
    accessCount: (row.access_count as number) ?? 0,
    lastAccessedAt: (row.last_accessed_at as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function createTrustCard(
  payload: CreateTrustCardData
): Promise<ActionResult<TrustCardCreated>> {
  const parsed = createTrustCardSchema.safeParse(payload);
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
  if (!member) return { success: false, error: "Enfant introuvable dans ce foyer" };

  const token = generateToken();
  const pin = generatePin();
  const pinHash = await hashPin(pin);
  const expiresAt = new Date(
    Date.now() + parsed.data.durationHours * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("trust_cards")
    .insert({
      household_id: householdId,
      member_id: parsed.data.memberId,
      created_by: user.id,
      label: parsed.data.label ?? null,
      token,
      pin_hash: pinHash,
      sections: parsed.data.sections,
      notes: parsed.data.notes ?? null,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("[createTrustCard]", error);
    return { success: false, error: "Impossible de créer le carnet" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://darons.app";
  const shareUrl = `${baseUrl}/c/${token}`;

  revalidatePath("/confiance");

  return {
    success: true,
    data: { card: mapCard(data), pin, shareUrl },
  };
}

export async function listTrustCards(): Promise<ActionResult<TrustCardWithMember[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("trust_cards")
    .select("*, family_members!inner(first_name, last_name, birth_date)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  return {
    success: true,
    data: (data ?? []).map((row) => {
      const card = mapCard(row);
      const member = row.family_members as Record<string, unknown>;
      return {
        ...card,
        memberFirstName: member.first_name as string,
        memberLastName: member.last_name as string,
        memberBirthDate: member.birth_date as string,
      };
    }),
  };
}

export async function getTrustCardById(
  id: string
): Promise<ActionResult<TrustCardWithMember>> {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("trust_cards")
    .select("*, family_members!inner(first_name, last_name, birth_date)")
    .eq("id", id)
    .eq("household_id", householdId)
    .single();

  if (error || !data) return { success: false, error: "Carnet introuvable" };

  const card = mapCard(data);
  const member = data.family_members as Record<string, unknown>;

  return {
    success: true,
    data: {
      ...card,
      memberFirstName: member.first_name as string,
      memberLastName: member.last_name as string,
      memberBirthDate: member.birth_date as string,
    },
  };
}

export async function revokeTrustCard(id: string): Promise<ActionResult> {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { error } = await supabase
    .from("trust_cards")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("household_id", householdId)
    .is("revoked_at", null);

  if (error) return { success: false, error: "Impossible de révoquer le carnet" };

  revalidatePath("/confiance");
  revalidatePath(`/confiance/${id}`);
  return { success: true };
}

export async function regeneratePin(id: string): Promise<ActionResult<{ pin: string }>> {
  const uuidCheck = validateUUID(id);
  if (!uuidCheck.valid) return { success: false, error: uuidCheck.error };

  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const newPin = generatePin();
  const newHash = await hashPin(newPin);

  const { error } = await supabase
    .from("trust_cards")
    .update({
      pin_hash: newHash,
      failed_attempts: 0,
      locked_until: null,
    })
    .eq("id", id)
    .eq("household_id", householdId)
    .is("revoked_at", null);

  if (error) return { success: false, error: "Impossible de régénérer le PIN" };

  revalidatePath(`/confiance/${id}`);
  return { success: true, data: { pin: newPin } };
}
