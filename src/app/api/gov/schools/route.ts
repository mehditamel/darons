import { NextRequest, NextResponse } from "next/server";
import { isMockMode, MOCK_SCHOOLS } from "@/lib/integrations/api-gouv-mock";

const ANNUAIRE_EDUCATION_URL =
  process.env.API_ANNUAIRE_EDUCATION_URL ||
  "https://data.education.gouv.fr/api/records/1.0/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commune = searchParams.get("commune") || "";
  const type = searchParams.get("type"); // maternelle, elementaire, college, lycee
  const codePostal = searchParams.get("code_postal");

  if (!commune && !codePostal) {
    return NextResponse.json({ error: "Commune ou code postal requis" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      dataset: "fr-en-annuaire-education",
      rows: "50",
      sort: "nom_etablissement",
    });

    const refinements: string[] = [];
    if (commune) refinements.push(`nom_commune:${commune}`);
    if (codePostal) refinements.push(`code_postal:${codePostal}`);
    if (type) {
      const typeMap: Record<string, string> = {
        maternelle: "Ecole maternelle",
        elementaire: "Ecole élémentaire",
        college: "Collège",
        lycee: "Lycée",
      };
      if (typeMap[type]) refinements.push(`type_etablissement:${typeMap[type]}`);
    }

    for (const r of refinements) {
      params.append("refine", r);
    }

    const response = await fetch(`${ANNUAIRE_EDUCATION_URL}?${params.toString()}`, {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      if (isMockMode()) {
        const filtered = MOCK_SCHOOLS.filter((s) =>
          (!commune || s.city.toLowerCase().includes(commune.toLowerCase())) &&
          (!codePostal || s.postalCode === codePostal)
        );
        return NextResponse.json({ schools: filtered, source: "mock" });
      }
      return NextResponse.json(
        { schools: [], source: "annuaire-education", error: "API indisponible" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const records = data.records ?? [];

    const schools = records.map((record: Record<string, unknown>) => {
      const fields = record.fields as Record<string, unknown>;
      const position = fields.position as number[] | null;
      return {
        id: record.recordid,
        name: fields.nom_etablissement ?? "",
        type: fields.type_etablissement ?? "",
        address: fields.adresse_1 ?? "",
        postalCode: fields.code_postal ?? "",
        city: fields.nom_commune ?? "",
        phone: fields.telephone ?? null,
        email: fields.mail ?? null,
        website: fields.web ?? null,
        latitude: position?.[0] ?? null,
        longitude: position?.[1] ?? null,
        status: fields.statut_public_prive ?? "",
      };
    });

    return NextResponse.json({ schools, source: "annuaire-education" });
  } catch {
    if (isMockMode()) {
      const filtered = MOCK_SCHOOLS.filter((s) =>
        (!commune || s.city.toLowerCase().includes(commune.toLowerCase())) &&
        (!codePostal || s.postalCode === codePostal)
      );
      return NextResponse.json({ schools: filtered, source: "mock" });
    }
    return NextResponse.json(
      { schools: [], source: "annuaire-education", error: "Erreur de connexion" },
      { status: 200 }
    );
  }
}
