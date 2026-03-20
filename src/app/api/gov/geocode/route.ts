import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit("gov-geocode", 30, 60_000);
  if (limited) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Le paramètre 'q' doit contenir au moins 2 caractères" },
      { status: 400 }
    );
  }

  const url = new URL("https://api-adresse.data.gouv.fr/search");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "5");
  url.searchParams.set("type", "housenumber");

  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 }, // Cache 24h
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Erreur lors de la recherche d'adresse" },
      { status: 502 }
    );
  }

  const data = await response.json();

  const results = (data.features ?? []).map(
    (f: {
      properties: {
        label: string;
        city: string;
        postcode: string;
        context: string;
      };
      geometry: { coordinates: number[] };
    }) => ({
      label: f.properties.label,
      city: f.properties.city,
      postcode: f.properties.postcode,
      context: f.properties.context,
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
    })
  );

  return NextResponse.json({ results });
}
