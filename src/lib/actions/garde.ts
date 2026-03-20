"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  childcareFavoriteSchema,
  type ChildcareFavoriteFormData,
} from "@/lib/validators/garde";
import type {
  ChildcareStructure,
  ChildcareFavorite,
  ChildcareStructureType,
} from "@/types/garde";

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

function mapStructure(row: Record<string, unknown>): ChildcareStructure {
  return {
    id: row.id as string,
    externalId: (row.external_id as string) ?? null,
    name: row.name as string,
    structureType: row.structure_type as ChildcareStructureType,
    address: (row.address as string) ?? null,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    capacity: row.capacity ? Number(row.capacity) : null,
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    website: (row.website as string) ?? null,
    hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : null,
    openingHours: (row.opening_hours as Record<string, string>) ?? null,
    activities: (row.activities as string[]) ?? [],
    rating: row.rating ? Number(row.rating) : null,
    lastUpdated: row.last_updated as string,
    createdAt: row.created_at as string,
  };
}

function mapFavorite(row: Record<string, unknown>): ChildcareFavorite {
  const structure = row.childcare_structures
    ? mapStructure(row.childcare_structures as Record<string, unknown>)
    : undefined;

  return {
    id: row.id as string,
    householdId: row.household_id as string,
    structureId: row.structure_id as string,
    notes: (row.notes as string) ?? null,
    status: row.status as ChildcareFavorite["status"],
    createdAt: row.created_at as string,
    structure,
  };
}

// ── Search Structures ──

export async function getChildcareStructures(filters?: {
  structureType?: ChildcareStructureType;
  query?: string;
}): Promise<ActionResult<ChildcareStructure[]>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  let query = supabase
    .from("childcare_structures")
    .select("*")
    .order("name", { ascending: true });

  if (filters?.structureType) {
    query = query.eq("structure_type", filters.structureType);
  }

  if (filters?.query) {
    query = query.or(
      `name.ilike.%${filters.query}%,address.ilike.%${filters.query}%`
    );
  }

  const { data, error } = await query.limit(50);
  if (error)
    return {
      success: false,
      error: "Erreur lors de la recherche de structures",
    };

  return { success: true, data: (data ?? []).map(mapStructure) };
}

// ── Favorites ──

export async function getChildcareFavorites(): Promise<
  ActionResult<ChildcareFavorite[]>
> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("childcare_favorites")
    .select("*, childcare_structures(*)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error)
    return {
      success: false,
      error: "Erreur lors de la récupération des favoris",
    };

  return { success: true, data: (data ?? []).map(mapFavorite) };
}

export async function addChildcareFavorite(
  formData: ChildcareFavoriteFormData
): Promise<ActionResult<ChildcareFavorite>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const parsed = childcareFavoriteSchema.safeParse(formData);
  if (!parsed.success)
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Données invalides",
    };

  const householdId = await getUserHouseholdId(supabase, user.id);
  if (!householdId) return { success: false, error: "Foyer introuvable" };

  const { data, error } = await supabase
    .from("childcare_favorites")
    .insert({
      household_id: householdId,
      structure_id: parsed.data.structureId,
      notes: parsed.data.notes,
      status: parsed.data.status,
    })
    .select("*, childcare_structures(*)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Cette structure est déjà dans vos favoris" };
    }
    return { success: false, error: "Erreur lors de l'ajout aux favoris" };
  }

  revalidatePath("/garde");
  return { success: true, data: mapFavorite(data) };
}

export async function updateChildcareFavorite(
  id: string,
  updates: { notes?: string | null; status?: ChildcareFavorite["status"] }
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const updateData: Record<string, unknown> = {};
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.status !== undefined) updateData.status = updates.status;

  const { error } = await supabase
    .from("childcare_favorites")
    .update(updateData)
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la mise à jour" };

  revalidatePath("/garde");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

export async function removeChildcareFavorite(
  id: string
): Promise<ActionResult> {
  try {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  const { error } = await supabase
    .from("childcare_favorites")
    .delete()
    .eq("id", id);

  if (error)
    return { success: false, error: "Erreur lors de la suppression" };

  revalidatePath("/garde");
  return { success: true };
  } catch {
    return { success: false, error: "Une erreur inattendue est survenue" };
  }
}

// ── Seed demo data ──

const DEMO_STRUCTURES: Omit<ChildcareStructure, "id" | "createdAt" | "lastUpdated">[] = [
  {
    externalId: null,
    name: "Crèche Les Petits Explorateurs",
    structureType: "creche",
    address: "15 Rue de la République, 13001 Marseille",
    latitude: 43.2965,
    longitude: 5.3698,
    capacity: 40,
    phone: "04 91 12 34 56",
    email: "contact@petits-explorateurs.fr",
    website: null,
    hourlyRate: 3.50,
    openingHours: { lun_ven: "7h30 - 18h30" },
    activities: ["éveil musical", "motricité", "peinture"],
    rating: 4.2,
  },
  {
    externalId: null,
    name: "Micro-crèche Bout'chou",
    structureType: "micro_creche",
    address: "42 Boulevard Longchamp, 13001 Marseille",
    latitude: 43.3008,
    longitude: 5.3878,
    capacity: 12,
    phone: "04 91 23 45 67",
    email: "boutchou@email.fr",
    website: null,
    hourlyRate: 4.20,
    openingHours: { lun_ven: "7h00 - 19h00" },
    activities: ["jardin", "éveil sensoriel", "yoga bébé"],
    rating: 4.6,
  },
  {
    externalId: null,
    name: "Marie Dupont — Assistante maternelle",
    structureType: "assistante_maternelle",
    address: "8 Rue des Oliviers, 13005 Marseille",
    latitude: 43.2892,
    longitude: 5.3941,
    capacity: 4,
    phone: "06 12 34 56 78",
    email: null,
    website: null,
    hourlyRate: 3.80,
    openingHours: { lun_ven: "7h30 - 18h00" },
    activities: ["promenade au parc", "lecture", "jeux d'eau"],
    rating: 4.8,
  },
  {
    externalId: null,
    name: "MAM Les Petits Pas",
    structureType: "mam",
    address: "25 Rue Paradis, 13006 Marseille",
    latitude: 43.2894,
    longitude: 5.3762,
    capacity: 16,
    phone: "04 91 34 56 78",
    email: "mam.petitspas@email.fr",
    website: null,
    hourlyRate: 4.00,
    openingHours: { lun_ven: "7h30 - 18h30" },
    activities: ["éveil musical", "arts plastiques", "motricité"],
    rating: 4.4,
  },
  {
    externalId: null,
    name: "Crèche municipale Castellane",
    structureType: "creche",
    address: "Place Castellane, 13006 Marseille",
    latitude: 43.2847,
    longitude: 5.3858,
    capacity: 60,
    phone: "04 91 45 67 89",
    email: "creche.castellane@mairie-marseille.fr",
    website: null,
    hourlyRate: 2.80,
    openingHours: { lun_ven: "7h00 - 18h30" },
    activities: ["psychomotricité", "jardinage", "contes"],
    rating: 4.0,
  },
  {
    externalId: null,
    name: "Sophie Martin — Assistante maternelle",
    structureType: "assistante_maternelle",
    address: "12 Rue d'Aubagne, 13001 Marseille",
    latitude: 43.2945,
    longitude: 5.3786,
    capacity: 3,
    phone: "06 23 45 67 89",
    email: null,
    website: null,
    hourlyRate: 3.60,
    openingHours: { lun_ven: "8h00 - 17h30" },
    activities: ["sorties au parc", "éveil musical"],
    rating: 4.5,
  },
  {
    externalId: null,
    name: "Micro-crèche Soleil d'Or",
    structureType: "micro_creche",
    address: "67 Avenue du Prado, 13008 Marseille",
    latitude: 43.2741,
    longitude: 5.3889,
    capacity: 10,
    phone: "04 91 56 78 90",
    email: "soleildor@micro-creche.fr",
    website: null,
    hourlyRate: 4.50,
    openingHours: { lun_ven: "7h30 - 19h00" },
    activities: ["bilinguisme anglais", "éveil nature", "danse"],
    rating: 4.7,
  },
  {
    externalId: null,
    name: "Crèche Les Oliviers",
    structureType: "creche",
    address: "33 Rue Saint-Ferréol, 13001 Marseille",
    latitude: 43.2957,
    longitude: 5.3753,
    capacity: 45,
    phone: "04 91 67 89 01",
    email: "lesoliviers@creche.fr",
    website: null,
    hourlyRate: 3.20,
    openingHours: { lun_ven: "7h30 - 18h30" },
    activities: ["peinture", "musique", "psychomotricité"],
    rating: 4.1,
  },
  {
    externalId: null,
    name: "MAM Les Petites Étoiles",
    structureType: "mam",
    address: "5 Rue de Rome, 13001 Marseille",
    latitude: 43.2973,
    longitude: 5.3784,
    capacity: 12,
    phone: "04 91 78 90 12",
    email: "petitesetoiles@mam.fr",
    website: null,
    hourlyRate: 3.90,
    openingHours: { lun_ven: "7h30 - 18h00" },
    activities: ["Montessori", "sorties nature", "cuisine"],
    rating: 4.5,
  },
  {
    externalId: null,
    name: "Nadia Benali — Assistante maternelle",
    structureType: "assistante_maternelle",
    address: "18 Cours Julien, 13006 Marseille",
    latitude: 43.2930,
    longitude: 5.3834,
    capacity: 4,
    phone: "06 34 56 78 90",
    email: null,
    website: null,
    hourlyRate: 3.70,
    openingHours: { lun_ven: "7h00 - 18h00" },
    activities: ["contes", "activités manuelles", "jardin"],
    rating: 4.6,
  },
  {
    externalId: null,
    name: "Relais Petite Enfance Centre-ville",
    structureType: "relais_pe",
    address: "10 Rue Colbert, 13001 Marseille",
    latitude: 43.2962,
    longitude: 5.3723,
    capacity: null,
    phone: "04 91 89 01 23",
    email: "rpe.centre@mairie-marseille.fr",
    website: null,
    hourlyRate: null,
    openingHours: { mar_ven: "9h00 - 17h00", sam: "9h00 - 12h00" },
    activities: ["information garde", "ateliers parents", "médiation"],
    rating: 4.3,
  },
  {
    externalId: null,
    name: "Crèche La Farandole",
    structureType: "creche",
    address: "22 Rue Breteuil, 13006 Marseille",
    latitude: 43.2872,
    longitude: 5.3746,
    capacity: 35,
    phone: "04 91 90 12 34",
    email: "farandole@creche.fr",
    website: null,
    hourlyRate: 3.10,
    openingHours: { lun_ven: "7h30 - 18h30" },
    activities: ["jeux libres", "musique", "lecture"],
    rating: 3.9,
  },
];

export async function seedChildcareStructures(): Promise<ActionResult<number>> {
  const { user, supabase } = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Non authentifié" };

  // Check if structures already exist
  const { count } = await supabase
    .from("childcare_structures")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    return { success: true, data: count };
  }

  const rows = DEMO_STRUCTURES.map((s) => ({
    external_id: s.externalId,
    name: s.name,
    structure_type: s.structureType,
    address: s.address,
    latitude: s.latitude,
    longitude: s.longitude,
    capacity: s.capacity,
    phone: s.phone,
    email: s.email,
    website: s.website,
    hourly_rate: s.hourlyRate,
    opening_hours: s.openingHours,
    activities: s.activities,
    rating: s.rating,
  }));

  const { error } = await supabase.from("childcare_structures").insert(rows);

  if (error)
    return {
      success: false,
      error: "Erreur lors de l'insertion des données de démo",
    };

  revalidatePath("/garde");
  return { success: true, data: rows.length };
}
