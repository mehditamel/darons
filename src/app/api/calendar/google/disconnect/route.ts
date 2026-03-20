import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revokeCalendarAccess } from "@/lib/integrations/google-calendar";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const result = await revokeCalendarAccess(user.id);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error ?? "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
