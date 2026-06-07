import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/integrations/notifications";

const subscribeSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

function welcomeEmailHtml(): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1B2838;">
      <h1 style="font-size: 22px;">Bienvenue dans la tribu Darons 👋</h1>
      <p>Merci de t'être inscrit·e ! On t'enverra de temps en temps des astuces
      concrètes pour gérer la vie de famille — santé, budget, impôts, papiers —
      sans bla-bla et sans spam.</p>
      <p>En attendant, jette un œil à nos outils gratuits : simulateur d'impôts,
      calcul des allocations CAF, calendrier vaccinal…</p>
      <p style="margin-top: 24px;">
        <a href="https://darons.app" style="background:#E8734A;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;">
          Découvrir Darons
        </a>
      </p>
      <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
        Tu reçois cet email car tu t'es inscrit·e sur darons.app.
      </p>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    // Persistance — uniquement si le service_role est configuré (côté serveur).
    // En local sans clé, on n'échoue pas l'inscription (mode dégradé).
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("newsletter_subscribers")
        .upsert(
          { email, source: "site" },
          { onConflict: "email", ignoreDuplicates: true }
        );

      if (error) {
        return NextResponse.json(
          { error: "Inscription impossible pour le moment." },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        "[newsletter] SUPABASE_SERVICE_ROLE_KEY absent — souscription non persistée"
      );
    }

    // Email de bienvenue — best-effort, ne bloque jamais l'inscription
    // (sendEmail gère en interne l'absence de RESEND_API_KEY).
    await sendEmail(email, "Bienvenue chez Darons 👋", welcomeEmailHtml());

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
