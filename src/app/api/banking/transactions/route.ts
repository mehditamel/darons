import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bridgeClient, isBridgeConfigured } from "@/lib/integrations/bridge";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = rateLimit("banking-transactions", 20, 60_000);
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

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");
  const since = searchParams.get("since") || undefined;

  if (!accountId) {
    return NextResponse.json(
      { error: "Le paramètre accountId est requis." },
      { status: 400 }
    );
  }

  try {
    const accessToken = await bridgeClient.authenticate(
      user.email!,
      user.id
    );
    const transactions = await bridgeClient.getTransactions(
      accessToken,
      Number(accountId),
      since
    );

    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer les transactions." },
      { status: 500 }
    );
  }
}
