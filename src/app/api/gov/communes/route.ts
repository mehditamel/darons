import { NextRequest, NextResponse } from "next/server";
import { isMockMode, MOCK_COMMUNES } from "@/lib/integrations/api-gouv-mock";

export async function GET(request: NextRequest) {
  const nom = request.nextUrl.searchParams.get("nom");

  if (!nom || nom.length < 2) {
    return NextResponse.json(
      { error: "Le paramètre 'nom' doit contenir au moins 2 caractères" },
      { status: 400 }
    );
  }

  try {
    const url = new URL("https://geo.api.gouv.fr/communes");
    url.searchParams.set("nom", nom);
    url.searchParams.set("fields", "nom,code,codesPostaux,centre,population");
    url.searchParams.set("limit", "10");

    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache 24h
    });

    if (!response.ok) {
      if (isMockMode()) {
        const filtered = MOCK_COMMUNES.filter((c) =>
          c.nom.toLowerCase().includes(nom.toLowerCase())
        );
        return NextResponse.json({ results: filtered, source: "mock" });
      }
      return NextResponse.json(
        { error: "Erreur lors de la recherche de communes" },
        { status: 502 }
      );
    }

    const data = await response.json();

    const results = (
      data as {
        nom: string;
        code: string;
        codesPostaux: string[];
        population: number;
        centre: { coordinates: number[] };
      }[]
    ).map((c) => ({
      nom: c.nom,
      code: c.code,
      codesPostaux: c.codesPostaux,
      population: c.population,
      latitude: c.centre?.coordinates?.[1] ?? null,
      longitude: c.centre?.coordinates?.[0] ?? null,
    }));

    return NextResponse.json({ results });
  } catch {
    if (isMockMode()) {
      const filtered = MOCK_COMMUNES.filter((c) =>
        c.nom.toLowerCase().includes(nom.toLowerCase())
      );
      return NextResponse.json({ results: filtered, source: "mock" });
    }
    return NextResponse.json(
      { error: "Erreur de connexion au service des communes" },
      { status: 502 }
    );
  }
}
