import { NextRequest, NextResponse } from "next/server";

const ANNUAIRE_SANTE_URL = process.env.API_ANNUAIRE_SANTE_URL || "https://gateway.api.esante.gouv.fr/fhir/v1";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get("specialty") || "SM54"; // SM54 = Pédiatrie
  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lon");
  const city = searchParams.get("city");

  try {
    const params = new URLSearchParams({
      _count: "20",
      active: "true",
      "specialty": specialty,
    });

    if (city) {
      params.set("address-city", city);
    }

    const response = await fetch(
      `${ANNUAIRE_SANTE_URL}/Practitioner?${params.toString()}`,
      {
        headers: { Accept: "application/fhir+json" },
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { practitioners: [], source: "annuaire-sante", error: "API indisponible" },
        { status: 200 }
      );
    }

    const data = await response.json();
    const entries = data.entry ?? [];

    const practitioners = entries.map((entry: Record<string, unknown>) => {
      const resource = entry.resource as Record<string, unknown>;
      const names = (resource.name as Array<Record<string, unknown>>)?.[0] ?? {};
      const qualifications = (resource.qualification as Array<Record<string, unknown>>) ?? [];
      const qualCode = qualifications[0]?.code as Record<string, unknown> | undefined;

      return {
        id: resource.id,
        firstName: (names.given as string[])?.[0] ?? "",
        lastName: names.family ?? "",
        specialty: (qualCode?.text as string) ?? specialty,
        active: resource.active ?? true,
      };
    });

    return NextResponse.json({ practitioners, source: "annuaire-sante" });
  } catch {
    return NextResponse.json(
      { practitioners: [], source: "annuaire-sante", error: "Erreur de connexion" },
      { status: 200 }
    );
  }
}
