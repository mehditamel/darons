import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { BUDGET_CATEGORY_LABELS } from "@/types/budget";

export async function GET(request: NextRequest) {
  const limited = rateLimit("export-csv", 5, 60_000);
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
    return NextResponse.json({ error: "Aucun foyer trouvé" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("budget_entries")
    .select("month, label, category, amount, is_recurring, member_id, notes, created_at")
    .eq("household_id", household.id)
    .order("month", { ascending: false });

  if (from) query = query.gte("month", from);
  if (to) query = query.lte("month", to);

  const { data: entries, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }

  // Build CSV
  const headers = ["Date", "Libellé", "Catégorie", "Montant (€)", "Récurrent", "Notes"];
  const rows = (entries ?? []).map((entry) => [
    entry.month,
    `"${(entry.label ?? "").replace(/"/g, '""')}"`,
    BUDGET_CATEGORY_LABELS[entry.category as keyof typeof BUDGET_CATEGORY_LABELS] ?? entry.category,
    String(entry.amount),
    entry.is_recurring ? "Oui" : "Non",
    `"${(entry.notes ?? "").replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  return new NextResponse(bom + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="darons-budget-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
