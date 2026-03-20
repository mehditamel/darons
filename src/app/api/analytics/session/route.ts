import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const limited = rateLimit("analytics-session", 30, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
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
    const today = new Date().toISOString().split("T")[0];

    await supabase.from("user_sessions").upsert(
      {
        user_id: user.id,
        session_date: today,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: "user_id,session_date" }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
