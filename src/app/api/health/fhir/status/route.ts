import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMESConfigured } from "@/lib/integrations/mon-espace-sante";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit("fhir-status", 10, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json({ error: "memberId requis" }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
  const configured = isMESConfigured();

  // Get connection info
  const { data: connection } = await supabase
    .from("mes_connections")
    .select("sync_status, last_sync_at, error_message, consent_granted_at, mes_patient_id")
    .eq("member_id", memberId)
    .maybeSingle();

  // Get latest sync logs
  const { data: syncLogs } = await supabase
    .from("fhir_sync_log")
    .select("resource_type, status, records_synced, records_created, records_updated, completed_at")
    .eq("member_id", memberId)
    .order("completed_at", { ascending: false })
    .limit(10);

  // Count synced records per resource type
  const { data: vaccCount } = await supabase
    .from("vaccinations")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("sync_source", "fhir");

  const { data: growthCount } = await supabase
    .from("growth_measurements")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("sync_source", "fhir");

  const { data: allergyCount } = await supabase
    .from("allergies")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("sync_source", "fhir");

  return NextResponse.json({
    configured,
    connected: !!connection && connection.sync_status !== "disconnected",
    connection: connection
      ? {
          status: connection.sync_status,
          lastSyncAt: connection.last_sync_at,
          errorMessage: connection.error_message,
          consentGrantedAt: connection.consent_granted_at,
        }
      : null,
    syncedCounts: {
      vaccinations: vaccCount?.length ?? 0,
      growthMeasurements: growthCount?.length ?? 0,
      allergies: allergyCount?.length ?? 0,
    },
    recentSyncLogs: (syncLogs ?? []).map((log: Record<string, unknown>) => ({
      resourceType: log.resource_type,
      status: log.status,
      recordsSynced: log.records_synced,
      recordsCreated: log.records_created,
      recordsUpdated: log.records_updated,
      completedAt: log.completed_at,
    })),
  });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
