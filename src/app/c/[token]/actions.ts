"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPin } from "@/lib/trust-card/token";
import { loadTrustCardPayload } from "@/lib/trust-card/data";
import { verifyPinSchema } from "@/lib/validators/trust-card";
import type { TrustCardPayload, TrustCardSection } from "@/types/trust-card";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 60;

export type VerifyResult =
  | { status: "ok"; payload: TrustCardPayload }
  | { status: "invalid_token" }
  | { status: "revoked" }
  | { status: "expired" }
  | { status: "locked"; until: string }
  | { status: "wrong_pin"; remaining: number }
  | { status: "error"; message: string };

export async function verifyPinAndGetCard(
  token: string,
  pin: string
): Promise<VerifyResult> {
  const parsed = verifyPinSchema.safeParse({ token, pin });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const supabase = createAdminClient();

  const { data: card, error } = await supabase
    .from("trust_cards")
    .select("*")
    .eq("token", parsed.data.token)
    .maybeSingle();

  if (error || !card) return { status: "invalid_token" };

  if (card.revoked_at) return { status: "revoked" };
  if (new Date(card.expires_at) < new Date()) return { status: "expired" };

  if (card.locked_until && new Date(card.locked_until) > new Date()) {
    return { status: "locked", until: card.locked_until };
  }

  const pinValid = await verifyPin(parsed.data.pin, card.pin_hash);

  if (!pinValid) {
    const failedAttempts = (card.failed_attempts ?? 0) + 1;
    const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;
    const lockUntil = shouldLock
      ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
      : null;

    await supabase
      .from("trust_cards")
      .update({
        failed_attempts: failedAttempts,
        locked_until: lockUntil,
      })
      .eq("id", card.id);

    if (shouldLock) return { status: "locked", until: lockUntil! };
    return {
      status: "wrong_pin",
      remaining: MAX_FAILED_ATTEMPTS - failedAttempts,
    };
  }

  await supabase
    .from("trust_cards")
    .update({
      failed_attempts: 0,
      locked_until: null,
      access_count: (card.access_count ?? 0) + 1,
      last_accessed_at: new Date().toISOString(),
    })
    .eq("id", card.id);

  const payload = await loadTrustCardPayload(supabase, {
    memberId: card.member_id,
    sections: card.sections as TrustCardSection[],
    notes: card.notes,
    expiresAt: card.expires_at,
  });

  if (!payload) {
    return { status: "error", message: "Impossible de charger les informations" };
  }

  return { status: "ok", payload };
}
