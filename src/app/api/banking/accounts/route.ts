import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bridgeClient, isBridgeConfigured } from "@/lib/integrations/bridge";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const limited = rateLimit("banking-accounts", 20, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  if (!isBridgeConfigured()) {
    return NextResponse.json(
      { error: "L'agrégation bancaire n'est pas encore configurée." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const accessToken = await bridgeClient.authenticate(
      user.email!,
      user.id
    );
    const accounts = await bridgeClient.getAccounts(accessToken);

    return NextResponse.json({ accounts });
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer les comptes bancaires." },
      { status: 500 }
    );
  }
}
