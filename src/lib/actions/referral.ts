"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  referralSchema,
  type ReferralFormData,
} from "@/lib/validators/sharing";
import type { Referral } from "@/types/sharing";

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

function mapReferral(row: Record<string, unknown>): Referral {
  return {
    id: row.id as string,
    referrerId: row.referrer_id as string,
    referralCode: row.referral_code as string,
    referreeId: (row.referree_id as string) ?? null,
    referreeEmail: (row.referree_email as string) ?? null,
    status: row.status as Referral["status"],
    rewardType: row.reward_type as Referral["rewardType"],
    rewardApplied: row.reward_applied as boolean,
    createdAt: row.created_at as string,
    convertedAt: (row.converted_at as string) ?? null,
  };
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CP-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
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
