import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revokeCalendarAccess } from "@/lib/integrations/google-calendar";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const limited = rateLimit("calendar-disconnect", 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
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
    const result = await revokeCalendarAccess(user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Erreur lors de la déconnexion" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
