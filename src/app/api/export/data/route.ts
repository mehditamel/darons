import { NextResponse } from "next/server";
import { exportUserData } from "@/lib/actions/rgpd";

export async function GET() {
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
      "Content-Disposition": `attachment; filename="cockpit-parental-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
