"use server";
import { type ActionResult, getAuthenticatedUser } from "@/lib/actions/safe-action";
import { revalidatePath } from "next/cache";
import {
  referralSchema,
  type ReferralFormData,
} from "@/lib/validators/sharing";
import type { Referral } from "@/types/sharing";

interface ReferralRow {
  id: string;
  referrer_id: string;
  referral_code: string;
  referree_id: string | null;
  referree_email: string | null;
  status: Referral["status"];
  reward_type: Referral["rewardType"];
  reward_applied: boolean;
  created_at: string;
  converted_at: string | null;
}

function mapReferral(row: ReferralRow): Referral {
  return {
    id: row.id,
    referrerId: row.referrer_id,
    referralCode: row.referral_code,
    referreeId: row.referree_id,
    referreeEmail: row.referree_email,
    status: row.status,
    rewardType: row.reward_type,
    rewardApplied: row.reward_applied,
    createdAt: row.created_at,
    convertedAt: row.converted_at,
  };
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CP-";
  const randomBytes = new Uint8Array(6);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(randomBytes[i] % chars.length);
  }
  return code;
}

export async function getMyReferralCode(): Promise<ActionResult<string>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .single();

  if (profile?.referral_code) {
    return { success: true, data: profile.referral_code };
  }

  // Generate code if none exists
  const code = generateReferralCode();
  const { error } = await supabase
    .from("profiles")
    .update({ referral_code: code })
    .eq("id", user.id);

  if (error) return { success: false, error: "Erreur lors de la génération" };

  return { success: true, data: code };
}

export async function getMyReferrals(): Promise<ActionResult<Referral[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération" };

  return { success: true, data: (data ?? []).map(mapReferral) };
}

export async function sendReferralInvite(
  formData: ReferralFormData
): Promise<ActionResult<Referral>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = referralSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  // Check if already referred
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referrer_id", user.id)
    .eq("referree_email", parsed.data.email)
    .single();

  if (existing)
    return {
      success: false,
      error: "Vous avez déjà parrainé cette adresse email",
    };

  const codeResult = await getMyReferralCode();
  if (!codeResult.success || !codeResult.data)
    return { success: false, error: "Code de parrainage introuvable" };

  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: user.id,
      referral_code: codeResult.data,
      referree_email: parsed.data.email,
    })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de l'envoi" };

  revalidatePath("/parrainage");
  return { success: true, data: mapReferral(data) };
}

export async function getReferralStats(): Promise<
  ActionResult<{
    totalInvites: number;
    signedUp: number;
    subscribed: number;
    rewardsEarned: number;
  }>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { data } = await supabase
    .from("referrals")
    .select("status, reward_applied")
    .eq("referrer_id", user.id);

  const referrals = data ?? [];

  return {
    success: true,
    data: {
      totalInvites: referrals.length,
      signedUp: referrals.filter(
        (r) =>
          r.status === "signed_up" ||
          r.status === "subscribed" ||
          r.status === "rewarded"
      ).length,
      subscribed: referrals.filter(
        (r) => r.status === "subscribed" || r.status === "rewarded"
      ).length,
      rewardsEarned: referrals.filter((r) => r.reward_applied).length,
    },
  };
}
