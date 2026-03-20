"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fiscalYearSaveSchema, type FiscalYearSaveData } from "@/lib/validators/fiscal";
import type { FiscalYear } from "@/types/fiscal";

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

async function getUserHouseholdId(supabase: ReturnType<typeof createClient>, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", userId)
    .single();
  return data?.id ?? null;
}

function mapRow(row: Record<string, unknown>): FiscalYear {
  return {
    id: row.id as string,
    householdId: row.household_id as string,
    year: row.year as number,
    nbParts: row.nb_parts as number,
    revenuNetImposable: row.revenu_net_imposable as number | null,
    impotBrut: row.impot_brut as number | null,
    creditsImpot: (row.credits_impot as Record<string, number>) ?? {},
    impotNet: row.impot_net as number | null,
    tmi: row.tmi as number | null,
    tauxEffectif: row.taux_effectif as number | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
  };
}

export async function getFiscalYears(): Promise<ActionResult<FiscalYear[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("fiscal_years")
    .select("*")
    .eq("household_id", householdId)
    .order("year", { ascending: false });

  if (error) return { success: false, error: "Erreur lors de la récupération des données fiscales" };

  return {
    success: true,
    data: (data ?? []).map(mapRow),
  };
}

export async function getFiscalYear(year: number): Promise<ActionResult<FiscalYear>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("fiscal_years")
    .select("*")
    .eq("household_id", householdId)
    .eq("year", year)
    .single();

  if (error) return { success: false, error: "Année fiscale introuvable" };

  return { success: true, data: mapRow(data) };
}

export async function saveFiscalYear(input: FiscalYearSaveData): Promise<ActionResult<FiscalYear>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = fiscalYearSaveSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const row = {
    household_id: householdId,
    year: parsed.data.year,
    nb_parts: parsed.data.nbParts,
    revenu_net_imposable: parsed.data.revenuNetImposable,
    impot_brut: parsed.data.impotBrut,
    credits_impot: parsed.data.creditsImpot,
    impot_net: parsed.data.impotNet,
    tmi: parsed.data.tmi,
    taux_effectif: parsed.data.tauxEffectif,
    notes: parsed.data.notes ?? null,
  };

  const { data, error } = await supabase
    .from("fiscal_years")
    .upsert(row, { onConflict: "household_id,year" })
    .select()
    .single();

  if (error) return { success: false, error: "Erreur lors de la sauvegarde" };

  revalidatePath("/fiscal");
  return { success: true, data: mapRow(data) };
}

export async function deleteFiscalYear(id: string): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("fiscal_years")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/fiscal");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}
