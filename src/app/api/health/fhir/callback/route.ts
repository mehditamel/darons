import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMESClient, isMESConfigured } from "@/lib/integrations/mon-espace-sante";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!isMESConfigured()) {
    return NextResponse.redirect(`${appUrl}/sante?error=mes_not_configured`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${appUrl}/sante?error=mes_auth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/sante?error=mes_invalid_callback`);
  }

  // Parse state: format is "randomHex:memberId"
  const colonIndex = state.lastIndexOf(":");
  if (colonIndex === -1) {
    return NextResponse.redirect(`${appUrl}/sante?error=mes_invalid_state`);
  }
  const memberId = state.slice(colonIndex + 1);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/login?redirect=/sante`);
  }

  // Verify member belongs to user's household
  const { data: member } = await supabase
    .from("family_members")
    .select("id, household_id, first_name")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.redirect(`${appUrl}/sante?error=mes_member_not_found`);
  }

  try {
    const client = createMESClient();
    const tokenData = await client.exchangeCode(code);

    // For now, use the memberId as the MES patient ID
    // In production, the token exchange would return the patient identifier
    const mesPatientId = `patient-${memberId}`;

    // Store or update the connection
    await supabase
      .from("mes_connections")
      .upsert({
        member_id: memberId,
        household_id: member.household_id,
        mes_patient_id: mesPatientId,
        access_token_encrypted: tokenData.access_token,
        refresh_token_encrypted: tokenData.refresh_token ?? null,
        token_expiry: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        consent_granted_at: new Date().toISOString(),
        sync_status: "connected",
        error_message: null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "member_id",
      });

    // Update the family member's FHIR patient ID
    await supabase
      .from("family_members")
      .update({ fhir_patient_id: mesPatientId })
      .eq("id", memberId);

    // Record consent
    await supabase.from("user_consents").insert({
      user_id: user.id,
      consent_type: "mes_health_sync",
      granted: true,
    });

    return NextResponse.redirect(
      `${appUrl}/sante?mes_connected=true&member=${encodeURIComponent(member.first_name)}`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.redirect(
      `${appUrl}/sante?error=mes_exchange_failed&details=${encodeURIComponent(message)}`
    );
  }
}
