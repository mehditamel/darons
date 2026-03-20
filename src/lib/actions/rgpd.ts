"use server";
import { createClient } from "@/lib/supabase/server";

// ── Types ──

export interface ConsentRecord {
  id: string;
  consentType: string;
  granted: boolean;
  grantedAt: string;
  revokedAt: string | null;
}
// ── Get user consents ──

export async function getUserConsents(): Promise<{
  data: ConsentRecord[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Non authentifié" };

  const { data, error } = await supabase
    .from("user_consents")
    .select("id, consent_type, granted, granted_at, revoked_at")
    .eq("user_id", user.id)
    .order("consent_type");

  if (error) return { data: null, error: error.message };

  return {
    data: (data ?? []).map((row) => ({
      id: row.id,
      consentType: row.consent_type,
      granted: row.granted,
      grantedAt: row.granted_at,
      revokedAt: row.revoked_at,
    })),
    error: null,
  };
}

// ── Update a consent ──

export async function updateUserConsent(
  consentType: string,
  granted: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Non authentifié" };

  // Check if consent exists
  const { data: existing } = await supabase
    .from("user_consents")
    .select("id")
    .eq("user_id", user.id)
    .eq("consent_type", consentType)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("user_consents")
      .update({
        granted,
        granted_at: granted ? new Date().toISOString() : undefined,
        revoked_at: !granted ? new Date().toISOString() : null,
      })
      .eq("id", existing.id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("user_consents").insert({
      user_id: user.id,
      consent_type: consentType,
      granted,
    });
    if (error) return { success: false, error: error.message };
  }

  return { success: true, error: null };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Export all user data (RGPD droit d'accès / portabilité) ──

export async function exportUserData(): Promise<{
  data: Record<string, unknown> | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: null, error: "Non authentifié" };

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Get household
  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (!household) {
    return {
      data: { profile, household: null },
      error: null,
    };
  }

  // Fetch all related data in parallel
  const [
    familyMembers,
    identityDocs,
    vaccinations,
    appointments,
    growthMeasurements,
    documents,
    milestones,
    journalEntries,
    activities,
    schooling,
    fiscalYears,
    budgetEntries,
    cafAllocations,
    consents,
  ] = await Promise.all([
    supabase.from("family_members").select("*").eq("household_id", household.id),
    supabase.from("identity_documents").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("vaccinations").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("medical_appointments").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("growth_measurements").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("documents").select("*").eq("household_id", household.id),
    supabase.from("development_milestones").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("parent_journal").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("activities").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("schooling").select("*").in(
      "member_id",
      (await supabase.from("family_members").select("id").eq("household_id", household.id)).data?.map((m) => m.id) ?? []
    ),
    supabase.from("fiscal_years").select("*").eq("household_id", household.id),
    supabase.from("budget_entries").select("*").eq("household_id", household.id),
    supabase.from("caf_allocations").select("*").eq("household_id", household.id),
    supabase.from("user_consents").select("*").eq("user_id", user.id),
  ]);

  return {
    data: {
      exported_at: new Date().toISOString(),
      profile,
      household,
      family_members: familyMembers.data ?? [],
      identity_documents: identityDocs.data ?? [],
      vaccinations: vaccinations.data ?? [],
      medical_appointments: appointments.data ?? [],
      growth_measurements: growthMeasurements.data ?? [],
      documents: documents.data ?? [],
      development_milestones: milestones.data ?? [],
      parent_journal: journalEntries.data ?? [],
      activities: activities.data ?? [],
      schooling: schooling.data ?? [],
      fiscal_years: fiscalYears.data ?? [],
      budget_entries: budgetEntries.data ?? [],
      caf_allocations: cafAllocations.data ?? [],
      consents: consents.data ?? [],
    },
    error: null,
  };
}

// ── Request account deletion (30-day grace period) ──

export async function requestAccountDeletion(
  reason?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Non authentifié" };

  // Check for existing pending request
  const { data: existing } = await supabase
    .from("account_deletion_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .single();

  if (existing) {
    return {
      success: false,
      error: "Une demande de suppression est déjà en cours.",
    };
  }

  const { error } = await supabase
    .from("account_deletion_requests")
    .insert({
      user_id: user.id,
      reason: reason ?? null,
    });

  if (error) return { success: false, error: error.message };

  return { success: true, error: null };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Cancel account deletion ──

export async function cancelAccountDeletion(): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("account_deletion_requests")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) return { success: false, error: error.message };

  return { success: true, error: null };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Check if deletion is pending ──

export async function getDeletionStatus(): Promise<{
  pending: boolean;
  scheduledAt: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { pending: false, scheduledAt: null };

  const { data } = await supabase
    .from("account_deletion_requests")
    .select("scheduled_deletion_at")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .single();

  return {
    pending: !!data,
    scheduledAt: data?.scheduled_deletion_at ?? null,
  };
}
