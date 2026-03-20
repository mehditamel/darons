import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dispatchNotification } from "@/lib/integrations/notifications";
import { rateLimit } from "@/lib/rate-limit";
import type { PlanName } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const limited = rateLimit("notif-dispatch", 10, 60_000);
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

  const body = await request.json();
  const { type, subject, htmlBody, smsBody } = body as {
    type: string;
    subject: string;
    htmlBody: string;
    smsBody?: string;
  };

  if (!type || !subject || !htmlBody) {
    return NextResponse.json(
      { error: "type, subject et htmlBody sont requis" },
      { status: 400 }
    );
  }

  // Get profile and household
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });
  }

  const plan = (profile.subscription_plan ?? "free") as PlanName;

  const result = await dispatchNotification(household.id, profile.email, plan, {
    type,
    subject,
    htmlBody,
    smsBody,
  });

  return NextResponse.json(result);
}
