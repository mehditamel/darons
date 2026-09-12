import { NextRequest, NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/admin";
import { rateLimit } from "@/lib/rate-limit";
import { csvCell } from "@/lib/csv";

export async function GET(request: NextRequest) {
  try {
    const context = await getAdminContext();
    if (!context.success) {
      return NextResponse.json({ error: context.error }, {
        status: context.error === "Non authentifié" ? 401 : context.error === "Accès refusé" ? 403 : 503,
      });
    }
    if (rateLimit(`admin-export:${context.user.id}`, 5, 60_000)) {
      return NextResponse.json({ error: "Trop de requêtes. Réessayez dans quelques instants." }, { status: 429 });
    }

    const type = request.nextUrl.searchParams.get("type") || "users";
    const { supabase } = context;
    let headers: string[];
    let rows: unknown[][];

    if (type === "users") {
      const { data, error } = await supabase.from("profiles")
        .select("email, first_name, last_name, subscription_plan, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      headers = ["Email", "Prénom", "Nom", "Plan", "Inscrit le"];
      rows = (data ?? []).map((p) => [p.email, p.first_name, p.last_name, p.subscription_plan, new Date(p.created_at).toLocaleDateString("fr-FR")]);
    } else if (type === "metrics") {
      const { data, error } = await supabase.from("admin_metrics_daily")
        .select("*").order("metric_date", { ascending: true });
      if (error) throw error;
      headers = ["Date", "Total utilisateurs", "Nouveaux", "Actifs", "Free", "Premium", "Family Pro", "MRR (cents)", "Churn"];
      rows = (data ?? []).map((m) => [m.metric_date, m.total_users, m.new_users, m.active_users, m.free_users, m.premium_users, m.family_pro_users, m.mrr_cents, m.churn_count]);
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    return new NextResponse("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().split("T")[0]}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Impossible de générer l'export. Réessayez dans un instant." }, { status: 500 });
  }
}
