import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMESClient, isMESConfigured } from "@/lib/integrations/mon-espace-sante";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
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
  const memberId = body.memberId as string;

  if (!memberId) {
    return NextResponse.json(
      { error: "memberId requis" },
      { status: 400 }
    );
  }

  // Verify the member belongs to the user's household
  const { data: member } = await supabase
    .from("family_members")
    .select("id, household_id")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.json(
      { error: "Membre non trouvé" },
      { status: 404 }
    );
  }

  // Check if already connected
  const { data: existing } = await supabase
    .from("mes_connections")
    .select("id, sync_status")
    .eq("member_id", memberId)
    .maybeSingle();

  if (existing && existing.sync_status !== "disconnected") {
    return NextResponse.json(
      { error: "Ce membre est déjà connecté à Mon Espace Santé." },
      { status: 409 }
    );
  }

  // Generate OAuth state for CSRF protection
  const state = randomBytes(32).toString("hex");

  const client = createMESClient();
  const authUrl = client.buildAuthorizationUrl(state, memberId);

  return NextResponse.json({ authUrl, state });
}
