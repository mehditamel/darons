import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit("admin-export", 5, 60_000);
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
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== "mehdi@tamel.fr") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "users";

  let csv = "";
  const BOM = "\uFEFF";

  if (type === "users") {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email, first_name, last_name, subscription_plan, created_at")
      .order("created_at", { ascending: false });

    csv =
      "Email,Prénom,Nom,Plan,Inscrit le\n" +
      (profiles ?? [])
        .map(
          (p) =>
            `"${p.email}","${p.first_name}","${p.last_name}","${p.subscription_plan}","${new Date(p.created_at).toLocaleDateString("fr-FR")}"`
        )
        .join("\n");
  } else if (type === "metrics") {
    const { data: metrics } = await supabase
      .from("admin_metrics_daily")
      .select("*")
      .order("metric_date", { ascending: true });

    csv =
      "Date,Total utilisateurs,Nouveaux,Actifs,Free,Premium,Family Pro,MRR (cents),Churn\n" +
      (metrics ?? [])
        .map(
          (m) =>
            `"${m.metric_date}",${m.total_users},${m.new_users},${m.active_users},${m.free_users},${m.premium_users},${m.family_pro_users},${m.mrr_cents},${m.churn_count}`
        )
        .join("\n");
  } else {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  return new NextResponse(BOM + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
