import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMESClient, isMESConfigured } from "@/lib/integrations/mon-espace-sante";
import { syncMemberHealth } from "@/lib/integrations/fhir-sync";
import { fhirMemberSchema } from "@/lib/validators/api-routes";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const limited = rateLimit("fhir-sync", 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  if (!isMESConfigured()) {
    return NextResponse.json(
      { error: "L'intégration Mon Espace Santé n'est pas configurée." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = fhirMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }
  const { memberId } = parsed.data;

  // Get connection info
  const { data: connection } = await supabase
    .from("mes_connections")
    .select("*")
    .eq("member_id", memberId)
    .single();

  if (!connection) {
    return NextResponse.json(
      { error: "Aucune connexion Mon Espace Santé trouvée pour ce membre." },
      { status: 404 }
    );
  }

  if (connection.sync_status === "disconnected") {
    return NextResponse.json(
      { error: "La connexion Mon Espace Santé a été déconnectée." },
      { status: 400 }
    );
  }

  if (connection.sync_status === "syncing") {
    return NextResponse.json(
      { error: "Une synchronisation est déjà en cours." },
      { status: 409 }
    );
  }

  try {
    const client = createMESClient();

    // Check if token needs refresh
    const tokenExpiry = connection.token_expiry ? new Date(connection.token_expiry) : null;
    const isExpired = !tokenExpiry || tokenExpiry.getTime() < Date.now() + 60_000;

    if (isExpired && connection.refresh_token_encrypted) {
      const newTokens = await client.refreshToken(connection.refresh_token_encrypted);

      await supabase
        .from("mes_connections")
        .update({
          access_token_encrypted: newTokens.access_token,
          refresh_token_encrypted: newTokens.refresh_token ?? connection.refresh_token_encrypted,
          token_expiry: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", connection.id);

      client.setTokens(newTokens.access_token, new Date(Date.now() + newTokens.expires_in * 1000));
    } else if (connection.access_token_encrypted) {
      client.setTokens(
        connection.access_token_encrypted,
        tokenExpiry ?? new Date(Date.now() + 3600_000)
      );
    } else {
      return NextResponse.json(
        { error: "Pas de token d'accès valide. Reconnexion nécessaire." },
        { status: 401 }
      );
    }

    const result = await syncMemberHealth(
      supabase,
      client,
      memberId,
      connection.household_id,
      connection.mes_patient_id
    );

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur de synchronisation";
    return NextResponse.json(
      { error: message, success: false },
      { status: 500 }
    );
  }
}
