import { NextResponse } from "next/server";

// Retired endpoint: old clients must never create a paid parent subscription.
// Billing history and existing customer-management routes remain separate.
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Darons est gratuit pour les familles. Aucun abonnement payant n’est proposé.",
    },
    { status: 410 },
  );
}
