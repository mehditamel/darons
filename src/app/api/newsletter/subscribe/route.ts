import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/integrations/notifications";
import { rateLimitAsync } from "@/lib/rate-limit";
import { newsletterTokenHash } from "@/lib/newsletter";

const subscribeSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export async function POST(request: NextRequest) {
  const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });

  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (await rateLimitAsync("newsletter:" + ip, 5, 60_000)) {
    return NextResponse.json({ error: "Trop de demandes. Réessaie dans quelques minutes." }, { status: 429 });
  }

  let admin;
  try { admin = createAdminClient(); } catch {
    return NextResponse.json({ error: "Les inscriptions sont temporairement indisponibles." }, { status: 503 });
  }
  const token = randomBytes(32).toString("hex");
  const hash = newsletterTokenHash(token);
  try {
    const { data: shouldSend, error } = await admin.rpc("request_newsletter_confirmation", {
      email_address: parsed.data.email, token_hash: hash,
    });
    if (error) throw error;

    if (shouldSend) {
      const link = "https://www.darons.app/newsletter/confirmer?token=" + token;
      const unsubscribe = "https://www.darons.app/newsletter/desinscription?token=" + token;
      const result = await sendEmail(parsed.data.email, "Confirme ton inscription à Darons",
        '<div style="font-family:sans-serif;max-width:480px;margin:auto"><h1>Encore une étape</h1>'
        + '<p>Confirme ton adresse pour recevoir les conseils Darons. Ce lien est valable 48 heures.</p>'
        + '<p><a href="' + link + '">Confirmer mon inscription</a></p>'
        + '<p>Si tu n’as pas demandé cet email, ignore-le : ton inscription ne sera pas activée.</p>'
        + '<p><a href="' + unsubscribe + '">Annuler ou me désinscrire</a></p></div>');
      if (!result.success) {
        // Release only this challenge so a legitimate retry is possible.
        await admin.from("newsletter_subscribers").update({ confirmation_sent_at: null })
          .eq("manage_token_hash", hash).eq("confirmed", false);
        return NextResponse.json({ error: "L’email n’a pas pu être envoyé. Réessaie dans un instant." }, { status: 503 });
      }
    }
    // The same response protects addresses that are already registered.
    return NextResponse.json({ success: true, message: "Vérifie ta boîte email. Si une confirmation est nécessaire, tu vas recevoir un lien." });
  } catch {
    return NextResponse.json({ error: "Inscription impossible pour le moment." }, { status: 503 });
  }
}
