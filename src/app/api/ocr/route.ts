import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromImage } from "@/lib/integrations/ocr";
import { callClaude, parseJsonResponse } from "@/lib/ai/anthropic";
import type { Medication } from "@/types/health";

const OCR_SYSTEM_PROMPT = `Tu es un assistant médical spécialisé dans l'extraction de données d'ordonnances.
À partir du texte OCR d'une ordonnance médicale française, extrais les médicaments prescrits.

Retourne un JSON avec la structure suivante :
{
  "medications": [
    {
      "name": "Nom du médicament",
      "dosage": "Dosage (ex: 500mg)",
      "frequency": "Fréquence (ex: 3 fois par jour)",
      "duration": "Durée (ex: 7 jours)"
    }
  ]
}

Règles :
- Extrais uniquement les médicaments, pas les instructions générales
- Si un champ n'est pas lisible, mets une chaîne vide
- Retourne un tableau vide si aucun médicament n'est détecté
- Retourne uniquement le JSON, sans texte supplémentaire`;

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Check subscription plan (OCR = Family Pro only)
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_plan !== "family_pro") {
    return NextResponse.json(
      {
        error:
          "L'OCR des ordonnances est réservé au plan Family Pro.",
      },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Formats acceptés : JPG, PNG, WebP, PDF." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier dépasse 10 Mo." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ocrText = await extractTextFromImage(buffer, file.type);

    if (!ocrText || ocrText.trim().length === 0) {
      return NextResponse.json({
        text: "",
        medications: [],
        message: "Aucun texte détecté dans l'image",
      });
    }

    let medications: Medication[] = [];
    try {
      const aiResponse = await callClaude(
        OCR_SYSTEM_PROMPT,
        `Texte OCR de l'ordonnance :\n\n${ocrText}`,
        512
      );
      const parsed = parseJsonResponse<{ medications: Medication[] }>(aiResponse);
      medications = parsed.medications ?? [];
    } catch {
      // AI parsing failed, return raw text without medications
    }

    return NextResponse.json({
      text: ocrText,
      medications,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du traitement de l'image" },
      { status: 500 }
    );
  }
}
