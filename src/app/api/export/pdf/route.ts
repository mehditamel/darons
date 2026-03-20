import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { PLAN_LIMITS } from "@/lib/constants";

export async function GET() {
  const limited = rateLimit("export-pdf", 3, 60_000);
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
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Check plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, first_name, last_name")
    .eq("id", user.id)
    .single();

  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  if (!PLAN_LIMITS[plan].hasPdfExport) {
    return NextResponse.json(
      { error: "Fonctionnalité réservée au plan Family Pro" },
      { status: 403 }
    );
  }

  // Get household
  const { data: household } = await supabase
    .from("households")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!household) {
    return NextResponse.json(
      { error: "Foyer introuvable" },
      { status: 404 }
    );
  }

  // Fetch all data
  const [
    membersRes,
    identityDocsRes,
    vaccinationsRes,
    budgetRes,
    allocationsRes,
    activitiesRes,
    goalsRes,
    fiscalRes,
  ] = await Promise.all([
    supabase
      .from("family_members")
      .select("*")
      .eq("household_id", household.id),
    supabase
      .from("identity_documents")
      .select("*, family_members(first_name, last_name)")
      .in(
        "member_id",
        (
          await supabase
            .from("family_members")
            .select("id")
            .eq("household_id", household.id)
        ).data?.map((m) => m.id) ?? []
      ),
    supabase
      .from("vaccinations")
      .select("*, family_members(first_name)")
      .in(
        "member_id",
        (
          await supabase
            .from("family_members")
            .select("id")
            .eq("household_id", household.id)
        ).data?.map((m) => m.id) ?? []
      ),
    supabase
      .from("budget_entries")
      .select("*")
      .eq("household_id", household.id)
      .order("month", { ascending: false })
      .limit(100),
    supabase
      .from("caf_allocations")
      .select("*")
      .eq("household_id", household.id)
      .eq("active", true),
    supabase
      .from("activities")
      .select("*, family_members(first_name)")
      .in(
        "member_id",
        (
          await supabase
            .from("family_members")
            .select("id")
            .eq("household_id", household.id)
        ).data?.map((m) => m.id) ?? []
      )
      .eq("active", true),
    supabase
      .from("savings_goals")
      .select("*")
      .eq("household_id", household.id)
      .eq("active", true),
    supabase
      .from("fiscal_years")
      .select("*")
      .eq("household_id", household.id)
      .order("year", { ascending: false })
      .limit(1),
  ]);

  const members = membersRes.data ?? [];
  const identityDocs = identityDocsRes.data ?? [];
  const vaccinations = vaccinationsRes.data ?? [];
  const budgetEntries = budgetRes.data ?? [];
  const allocations = allocationsRes.data ?? [];
  const activities = activitiesRes.data ?? [];
  const goals = goalsRes.data ?? [];
  const fiscal = fiscalRes.data?.[0] ?? null;

  const now = new Date();
  const year = now.getFullYear();

  // Budget summary
  const totalExpenses = budgetEntries
    .filter((e) => Number(e.amount) > 0)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const totalAllocations = allocations.reduce(
    (sum, a) => sum + Number(a.monthly_amount) * 12,
    0
  );

  // Generate HTML for PDF
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bilan Annuel — ${household.name} — ${year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1B2838; margin-bottom: 8px; }
    h2 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #E8734A; margin: 24px 0 12px; border-bottom: 2px solid #E8734A; padding-bottom: 4px; }
    h3 { font-size: 16px; font-weight: 600; margin: 16px 0 8px; }
    .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #1B2838; padding-bottom: 16px; }
    .subtitle { color: #666; font-size: 14px; }
    .date { color: #999; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th { background: #f5f0eb; text-align: left; padding: 8px 12px; font-weight: 600; }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-valid { background: #e8f5e9; color: #2e7d32; }
    .badge-warning { background: #fff3e0; color: #e65100; }
    .badge-danger { background: #fce4ec; color: #c62828; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
    .stat-card { background: #f9f6f2; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1B2838; }
    .stat-label { font-size: 12px; color: #666; }
    .section { page-break-inside: avoid; margin-bottom: 24px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; color: #999; font-size: 11px; }
    .amount { font-weight: 600; }
    .amount-positive { color: #2e7d32; }
    .amount-negative { color: #c62828; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Bilan Annuel — ${household.name}</h1>
    <p class="subtitle">Année ${year}</p>
    <p class="date">Généré le ${now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
  </div>

  <div class="section">
    <h2>Composition du foyer</h2>
    <table>
      <thead>
        <tr><th>Prénom</th><th>Nom</th><th>Date de naissance</th><th>Type</th></tr>
      </thead>
      <tbody>
        ${members
          .map(
            (m) =>
              `<tr>
                <td>${m.first_name}</td>
                <td>${m.last_name}</td>
                <td>${new Date(m.birth_date).toLocaleDateString("fr-FR")}</td>
                <td>${m.member_type === "child" ? "Enfant" : "Adulte"}</td>
              </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Documents d'identité</h2>
    ${
      identityDocs.length > 0
        ? `<table>
            <thead>
              <tr><th>Document</th><th>Membre</th><th>Expiration</th><th>Statut</th></tr>
            </thead>
            <tbody>
              ${identityDocs
                .map(
                  (d) =>
                    `<tr>
                      <td>${d.document_type.toUpperCase()}</td>
                      <td>${(d.family_members as Record<string, string>)?.first_name ?? ""} ${(d.family_members as Record<string, string>)?.last_name ?? ""}</td>
                      <td>${d.expiry_date ? new Date(d.expiry_date).toLocaleDateString("fr-FR") : "—"}</td>
                      <td><span class="badge ${d.status === "valid" ? "badge-valid" : d.status === "expiring_soon" ? "badge-warning" : "badge-danger"}">${d.status === "valid" ? "Valide" : d.status === "expiring_soon" ? "À renouveler" : "Expiré"}</span></td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : "<p>Aucun document enregistré.</p>"
    }
  </div>

  <div class="section">
    <h2>Vaccinations</h2>
    ${
      vaccinations.length > 0
        ? `<table>
            <thead>
              <tr><th>Vaccin</th><th>Enfant</th><th>Dose</th><th>Date</th><th>Statut</th></tr>
            </thead>
            <tbody>
              ${vaccinations
                .map(
                  (v) =>
                    `<tr>
                      <td>${v.vaccine_name}</td>
                      <td>${(v.family_members as Record<string, string>)?.first_name ?? ""}</td>
                      <td>Dose ${v.dose_number}</td>
                      <td>${v.administered_date ? new Date(v.administered_date).toLocaleDateString("fr-FR") : "—"}</td>
                      <td><span class="badge ${v.status === "done" ? "badge-valid" : v.status === "overdue" ? "badge-danger" : "badge-warning"}">${v.status === "done" ? "Fait" : v.status === "overdue" ? "En retard" : "À faire"}</span></td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : "<p>Aucune vaccination enregistrée.</p>"
    }
  </div>

  <div class="section">
    <h2>Budget & finances</h2>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value amount amount-negative">${totalExpenses.toLocaleString("fr-FR")} €</div>
        <div class="stat-label">Dépenses totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-value amount amount-positive">${totalAllocations.toLocaleString("fr-FR")} €</div>
        <div class="stat-label">Allocations annuelles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${goals.length}</div>
        <div class="stat-label">Objectifs d'épargne</div>
      </div>
    </div>

    ${
      allocations.length > 0
        ? `<h3>Allocations CAF actives</h3>
          <table>
            <thead><tr><th>Type</th><th>Montant mensuel</th></tr></thead>
            <tbody>
              ${allocations
                .map(
                  (a) =>
                    `<tr><td>${a.allocation_type}</td><td class="amount">${Number(a.monthly_amount).toLocaleString("fr-FR")} €/mois</td></tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : ""
    }

    ${
      goals.length > 0
        ? `<h3>Objectifs d'épargne</h3>
          <table>
            <thead><tr><th>Objectif</th><th>Cible</th><th>Actuel</th><th>Progression</th></tr></thead>
            <tbody>
              ${goals
                .map(
                  (g) =>
                    `<tr>
                      <td>${g.name}</td>
                      <td class="amount">${Number(g.target_amount).toLocaleString("fr-FR")} €</td>
                      <td class="amount">${Number(g.current_amount).toLocaleString("fr-FR")} €</td>
                      <td>${Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)}%</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : ""
    }
  </div>

  ${
    fiscal
      ? `<div class="section">
          <h2>Situation fiscale ${fiscal.year}</h2>
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-value">${Number(fiscal.nb_parts)}</div>
              <div class="stat-label">Parts fiscales</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${fiscal.tmi}%</div>
              <div class="stat-label">TMI</div>
            </div>
            <div class="stat-card">
              <div class="stat-value amount">${fiscal.impot_net ? Number(fiscal.impot_net).toLocaleString("fr-FR") + " €" : "—"}</div>
              <div class="stat-label">Impôt net</div>
            </div>
          </div>
        </div>`
      : ""
  }

  <div class="section">
    <h2>Activités extra-scolaires</h2>
    ${
      activities.length > 0
        ? `<table>
            <thead><tr><th>Activité</th><th>Enfant</th><th>Planning</th><th>Coût mensuel</th></tr></thead>
            <tbody>
              ${activities
                .map(
                  (a) =>
                    `<tr>
                      <td>${a.name}</td>
                      <td>${(a.family_members as Record<string, string>)?.first_name ?? ""}</td>
                      <td>${a.schedule ?? "—"}</td>
                      <td class="amount">${a.cost_monthly ? Number(a.cost_monthly).toLocaleString("fr-FR") + " €" : "—"}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>`
        : "<p>Aucune activité enregistrée.</p>"
    }
  </div>

  <div class="footer">
    <p>Darons — darons.app</p>
    <p>Document généré automatiquement. Les données sont à jour au ${now.toLocaleDateString("fr-FR")}.</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="bilan-annuel-${household.name}-${year}.html"`,
    },
  });
}
