import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const phoneNumberSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+33[1-9]\d{8}$/, "Numéro de téléphone français invalide (format : +33612345678)")
    .or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const limited = rateLimit("profile-phone", 5, 60_000);
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

  try {
  const body = await request.json();
  const parsed = phoneNumberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Numéro invalide" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      phone_number: parsed.data.phoneNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du numéro" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Une erreur inattendue est survenue" },
      { status: 500 }
    );
  }
}
