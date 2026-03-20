import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fhirDisconnectSchema } from "@/lib/validators/api-routes";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = rateLimit("fhir-disconnect", 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = fhirDisconnectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }
  const { memberId, deleteSyncedData } = parsed.data;

  try {
  // Verify connection exists
  const { data: connection } = await supabase
    .from("mes_connections")
    .select("id, household_id")
    .eq("member_id", memberId)
    .single();

  if (!connection) {
    return NextResponse.json(
      { error: "Aucune connexion Mon Espace Santé trouvée." },
      { status: 404 }
    );
  }

  // Update connection status
  await supabase
    .from("mes_connections")
    .update({
      sync_status: "disconnected",
      access_token_encrypted: null,
      refresh_token_encrypted: null,
      token_expiry: null,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", connection.id);

  // Revoke MES consent
  await supabase
    .from("user_consents")
    .update({ granted: false, revoked_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("consent_type", "mes_health_sync")
    .is("revoked_at", null);

  // Clear FHIR patient ID from family member
  await supabase
    .from("family_members")
    .update({ fhir_patient_id: null })
    .eq("id", memberId);

  // Optionally delete all data synced from FHIR
  if (deleteSyncedData) {
    await Promise.all([
      supabase.from("vaccinations").delete().eq("member_id", memberId).eq("sync_source", "fhir"),
      supabase.from("growth_measurements").delete().eq("member_id", memberId).eq("sync_source", "fhir"),
      supabase.from("allergies").delete().eq("member_id", memberId).eq("sync_source", "fhir"),
      supabase.from("prescriptions").delete().eq("member_id", memberId).eq("sync_source", "fhir"),
    ]);
  }

  return NextResponse.json({
    success: true,
    message: deleteSyncedData
      ? "Connexion supprimée et données synchronisées effacées."
      : "Connexion supprimée. Les données synchronisées ont été conservées.",
  });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
