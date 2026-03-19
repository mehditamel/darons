/**
 * FHIR Sync Service
 *
 * Orchestrates data synchronization between Mon Espace Santé (FHIR)
 * and the local Supabase database. Supports pull (FHIR → local) sync.
 * Push sync (local → FHIR) to be added when the API supports write operations.
 *
 * Conflict resolution: FHIR data wins for records with sync_source='fhir'.
 * Local-only records (sync_source='local') are never overwritten.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { MonEspaceSanteClient, FHIRAuthError } from "./mon-espace-sante";
import {
  mapFHIRImmunizationToVaccination,
  mapFHIRObservationsToGrowthMeasurements,
  mapFHIRAllergyIntoleranceToAllergy,
  mapFHIRDocumentReferenceToPrescription,
} from "./fhir-mappers";
import type { FHIRResourceType, FHIRSyncDirection } from "@/types/fhir";

// --- Types ---

export interface SyncResult {
  resourceType: FHIRResourceType;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface FullSyncResult {
  success: boolean;
  results: SyncResult[];
  totalSynced: number;
  error?: string;
}

interface SyncLogInput {
  householdId: string;
  memberId: string;
  resourceType: FHIRResourceType;
  direction: FHIRSyncDirection;
  result: SyncResult;
}

// --- Sync Log ---

async function writeSyncLog(
  supabase: SupabaseClient,
  input: SyncLogInput
): Promise<void> {
  await supabase.from("fhir_sync_log").insert({
    household_id: input.householdId,
    member_id: input.memberId,
    resource_type: input.resourceType,
    direction: input.direction,
    records_synced: input.result.created + input.result.updated,
    records_created: input.result.created,
    records_updated: input.result.updated,
    records_skipped: input.result.skipped,
    status: input.result.errors.length > 0 ? "partial" : "success",
    error_message: input.result.errors.length > 0 ? input.result.errors.join("; ") : null,
    completed_at: new Date().toISOString(),
  });
}

// --- Resource Sync Functions ---

async function syncVaccinations(
  client: MonEspaceSanteClient,
  supabase: SupabaseClient,
  memberId: string,
  patientId: string
): Promise<SyncResult> {
  const result: SyncResult = { resourceType: "Immunization", created: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const fhirImmunizations = await client.searchImmunizations(patientId);

    for (const fhirImm of fhirImmunizations) {
      if (!fhirImm.id) {
        result.skipped++;
        continue;
      }

      try {
        const row = mapFHIRImmunizationToVaccination(fhirImm, memberId);

        // Check if already exists by FHIR resource ID
        const { data: existing } = await supabase
          .from("vaccinations")
          .select("id, fhir_last_updated, sync_source")
          .eq("member_id", memberId)
          .eq("fhir_resource_id", fhirImm.id)
          .maybeSingle();

        if (existing) {
          // Only update if FHIR data is newer
          const fhirUpdated = fhirImm.meta?.lastUpdated;
          const localUpdated = existing.fhir_last_updated;

          if (fhirUpdated && localUpdated && new Date(fhirUpdated) <= new Date(localUpdated)) {
            result.skipped++;
            continue;
          }

          await supabase
            .from("vaccinations")
            .update(row)
            .eq("id", existing.id);
          result.updated++;
        } else {
          await supabase.from("vaccinations").insert(row);
          result.created++;
        }
      } catch (err) {
        result.errors.push(`Immunization ${fhirImm.id}: ${err instanceof Error ? err.message : "erreur inconnue"}`);
      }
    }
  } catch (err) {
    result.errors.push(`Fetch Immunizations: ${err instanceof Error ? err.message : "erreur inconnue"}`);
  }

  return result;
}

async function syncGrowthMeasurements(
  client: MonEspaceSanteClient,
  supabase: SupabaseClient,
  memberId: string,
  patientId: string
): Promise<SyncResult> {
  const result: SyncResult = { resourceType: "Observation", created: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const observations = await client.searchObservations(patientId);
    const measurements = mapFHIRObservationsToGrowthMeasurements(observations, memberId);

    for (const row of measurements) {
      if (!row.fhir_resource_id) {
        result.skipped++;
        continue;
      }

      try {
        const { data: existing } = await supabase
          .from("growth_measurements")
          .select("id, fhir_last_updated")
          .eq("member_id", memberId)
          .eq("fhir_resource_id", row.fhir_resource_id)
          .maybeSingle();

        if (existing) {
          const fhirUpdated = row.fhir_last_updated;
          const localUpdated = existing.fhir_last_updated;

          if (fhirUpdated && localUpdated && new Date(fhirUpdated) <= new Date(localUpdated)) {
            result.skipped++;
            continue;
          }

          await supabase
            .from("growth_measurements")
            .update(row)
            .eq("id", existing.id);
          result.updated++;
        } else {
          await supabase.from("growth_measurements").insert(row);
          result.created++;
        }
      } catch (err) {
        result.errors.push(`Observation ${row.fhir_resource_id}: ${err instanceof Error ? err.message : "erreur inconnue"}`);
      }
    }
  } catch (err) {
    result.errors.push(`Fetch Observations: ${err instanceof Error ? err.message : "erreur inconnue"}`);
  }

  return result;
}

async function syncAllergies(
  client: MonEspaceSanteClient,
  supabase: SupabaseClient,
  memberId: string,
  patientId: string
): Promise<SyncResult> {
  const result: SyncResult = { resourceType: "AllergyIntolerance", created: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const fhirAllergies = await client.searchAllergyIntolerances(patientId);

    for (const fhirAllergy of fhirAllergies) {
      if (!fhirAllergy.id) {
        result.skipped++;
        continue;
      }

      try {
        const row = mapFHIRAllergyIntoleranceToAllergy(fhirAllergy, memberId);

        const { data: existing } = await supabase
          .from("allergies")
          .select("id, fhir_last_updated")
          .eq("member_id", memberId)
          .eq("fhir_resource_id", fhirAllergy.id)
          .maybeSingle();

        if (existing) {
          const fhirUpdated = fhirAllergy.meta?.lastUpdated;
          const localUpdated = existing.fhir_last_updated;

          if (fhirUpdated && localUpdated && new Date(fhirUpdated) <= new Date(localUpdated)) {
            result.skipped++;
            continue;
          }

          await supabase
            .from("allergies")
            .update(row)
            .eq("id", existing.id);
          result.updated++;
        } else {
          await supabase.from("allergies").insert(row);
          result.created++;
        }
      } catch (err) {
        result.errors.push(`AllergyIntolerance ${fhirAllergy.id}: ${err instanceof Error ? err.message : "erreur inconnue"}`);
      }
    }
  } catch (err) {
    result.errors.push(`Fetch AllergyIntolerances: ${err instanceof Error ? err.message : "erreur inconnue"}`);
  }

  return result;
}

async function syncDocuments(
  client: MonEspaceSanteClient,
  supabase: SupabaseClient,
  memberId: string,
  householdId: string,
  patientId: string
): Promise<SyncResult> {
  const result: SyncResult = { resourceType: "DocumentReference", created: 0, updated: 0, skipped: 0, errors: [] };

  try {
    const fhirDocs = await client.searchDocumentReferences(patientId);

    for (const fhirDoc of fhirDocs) {
      if (!fhirDoc.id) {
        result.skipped++;
        continue;
      }

      try {
        const { data: existing } = await supabase
          .from("prescriptions")
          .select("id")
          .eq("member_id", memberId)
          .eq("fhir_resource_id", fhirDoc.id)
          .maybeSingle();

        if (existing) {
          result.skipped++;
          continue;
        }

        const row = mapFHIRDocumentReferenceToPrescription(fhirDoc, memberId, householdId);
        await supabase.from("prescriptions").insert(row);
        result.created++;
      } catch (err) {
        result.errors.push(`DocumentReference ${fhirDoc.id}: ${err instanceof Error ? err.message : "erreur inconnue"}`);
      }
    }
  } catch (err) {
    result.errors.push(`Fetch DocumentReferences: ${err instanceof Error ? err.message : "erreur inconnue"}`);
  }

  return result;
}

// --- Main Sync Orchestrator ---

/**
 * Synchronize all health data for a family member from Mon Espace Santé
 */
export async function syncMemberHealth(
  supabase: SupabaseClient,
  client: MonEspaceSanteClient,
  memberId: string,
  householdId: string,
  mesPatientId: string
): Promise<FullSyncResult> {
  // Mark connection as syncing
  await supabase
    .from("mes_connections")
    .update({ sync_status: "syncing", error_message: null })
    .eq("member_id", memberId);

  const results: SyncResult[] = [];

  try {
    // Run all syncs in parallel
    const [vaccResult, growthResult, allergyResult, docResult] = await Promise.all([
      syncVaccinations(client, supabase, memberId, mesPatientId),
      syncGrowthMeasurements(client, supabase, memberId, mesPatientId),
      syncAllergies(client, supabase, memberId, mesPatientId),
      syncDocuments(client, supabase, memberId, householdId, mesPatientId),
    ]);

    results.push(vaccResult, growthResult, allergyResult, docResult);

    // Write sync logs
    await Promise.all(
      results.map((r) =>
        writeSyncLog(supabase, {
          householdId,
          memberId,
          resourceType: r.resourceType,
          direction: "pull",
          result: r,
        })
      )
    );

    const totalSynced = results.reduce(
      (sum, r) => sum + r.created + r.updated,
      0
    );
    const hasErrors = results.some((r) => r.errors.length > 0);

    // Update connection status
    await supabase
      .from("mes_connections")
      .update({
        sync_status: hasErrors ? "error" : "connected",
        last_sync_at: new Date().toISOString(),
        error_message: hasErrors
          ? results.flatMap((r) => r.errors).join("; ").slice(0, 500)
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("member_id", memberId);

    return { success: true, results, totalSynced };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erreur de synchronisation";

    const newStatus = err instanceof FHIRAuthError ? "token_expired" : "error";

    await supabase
      .from("mes_connections")
      .update({
        sync_status: newStatus,
        error_message: errorMessage.slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq("member_id", memberId);

    return { success: false, results, totalSynced: 0, error: errorMessage };
  }
}

/**
 * Get the latest sync log entries for a member
 */
export async function getSyncHistory(
  supabase: SupabaseClient,
  memberId: string,
  limit: number = 10
): Promise<{ resourceType: string; status: string; recordsSynced: number; completedAt: string }[]> {
  const { data } = await supabase
    .from("fhir_sync_log")
    .select("resource_type, status, records_synced, completed_at")
    .eq("member_id", memberId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    resourceType: row.resource_type,
    status: row.status,
    recordsSynced: row.records_synced,
    completedAt: row.completed_at,
  }));
}
