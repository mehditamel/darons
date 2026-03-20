import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bridgeClient, isBridgeConfigured } from "@/lib/integrations/bridge";
import { rateLimit } from "@/lib/rate-limit";
import { bankingConnectSchema } from "@/lib/validators/api-routes";

export async function POST(request: Request) {
  const limited = rateLimit("banking-connect", 5, 60_000);
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

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bankingConnectSchema.safeParse(body);
    const callbackUrl =
      parsed.data?.callbackUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/budget?bank_connected=true`;

    const accessToken = await bridgeClient.authenticate(
      user.email!,
      user.id
    );
    const connectUrl = await bridgeClient.getConnectUrl(
      accessToken,
      callbackUrl
    );

    return NextResponse.json({ connectUrl });
  } catch {
    return NextResponse.json(
      { error: "Impossible de se connecter au service bancaire." },
      { status: 500 }
    );
  }
}
