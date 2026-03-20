import { NextResponse } from "next/server";
import { exportUserData } from "@/lib/actions/rgpd";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const limited = rateLimit("export-data", 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques instants." },
      { status: 429 }
    );
  }

  const result = await exportUserData();

  if (result.error || !result.data) {
    return NextResponse.json(
      { error: result.error ?? "Erreur lors de l'export" },
      { status: 400 }
    );
  }

  const jsonString = JSON.stringify(result.data, null, 2);

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="darons-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
