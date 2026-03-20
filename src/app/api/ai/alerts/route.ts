import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callClaude, parseJsonResponse } from "@/lib/ai/anthropic";
import { PROACTIVE_ALERTS_PROMPT } from "@/lib/ai/prompts";
import { rateLimit } from "@/lib/rate-limit";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AiAlertItem {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  message: string;
  action_url: string | null;
  due_date: string | null;
}

export async function POST() {
  const limited = rateLimit("ai-alerts", 5, 60_000);
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

  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!household) {
    return NextResponse.json({ error: "Foyer introuvable" }, { status: 404 });
  }

  // Collect all household data for AI analysis
  const [membersRes, docsRes, vaccsRes, fiscalRes, allocsRes, examsRes] = await Promise.all([
    supabase.from("family_members").select("*").eq("household_id", household.id),
    supabase
      .from("identity_documents")
      .select("*, family_members!inner(first_name, household_id)")
      .eq("family_members.household_id", household.id),
    supabase
      .from("vaccinations")
      .select("*, family_members!inner(first_name, birth_date, household_id)")
      .eq("family_members.household_id", household.id),
    supabase
      .from("fiscal_years")
      .select("*")
      .eq("household_id", household.id)
      .order("year", { ascending: false })
      .limit(1),
    supabase.from("caf_allocations").select("*").eq("household_id", household.id).eq("active", true),
    supabase
      .from("health_examinations")
      .select("*, family_members!inner(first_name, birth_date, household_id)")
      .eq("family_members.household_id", household.id),
  ]);

  // Check recently sent alerts to avoid duplicates
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentAlerts } = await supabase
    .from("proactive_alerts")
    .select("title")
    .eq("household_id", household.id)
    .gte("created_at", sevenDaysAgo.toISOString());

  const now = new Date();
  const userMessage = `DONNÉES FOYER : ${JSON.stringify({
    membres: membersRes.data ?? [],
    documents: docsRes.data ?? [],
    vaccinations: vaccsRes.data ?? [],
    fiscal: fiscalRes.data ?? [],
    allocations: allocsRes.data ?? [],
    examens: examsRes.data ?? [],
    alertesRecentes: (recentAlerts ?? []).map((a) => a.title),
  })}
DATE AUJOURD'HUI : ${format(now, "dd MMMM yyyy", { locale: fr })}`;

  try {
    const response = await callClaude(PROACTIVE_ALERTS_PROMPT, userMessage, 1500);
    const parsed = parseJsonResponse<{ alerts: AiAlertItem[] }>(response);

    if (parsed.alerts.length > 0) {
      const alertsToInsert = parsed.alerts.map((alert) => ({
        household_id: household.id,
        priority: alert.priority,
        category: alert.category,
        title: alert.title,
        message: alert.message,
        action_url: alert.action_url,
        due_date: alert.due_date,
      }));

      await supabase.from("proactive_alerts").insert(alertsToInsert);
    }

    return NextResponse.json({ generated: parsed.alerts.length });
  } catch {
    return NextResponse.json(
      { error: "Génération des alertes IA indisponible." },
      { status: 500 }
    );
  }
}
