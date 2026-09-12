import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterTokenHash, validNewsletterToken } from "@/lib/newsletter";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!validNewsletterToken(body?.token) || !["confirm", "unsubscribe"].includes(body?.action)) {
    return NextResponse.json({ error: "Ce lien est invalide. Demande un nouveau lien depuis le blog." }, { status: 400 });
  }
  try {
    const admin = createAdminClient();
    const hash = newsletterTokenHash(body.token);
    if (body.action === "confirm") {
      const { data, error } = await admin.rpc("confirm_newsletter_subscription", { token_hash: hash });
      if (error) throw error;
      if (!data) return NextResponse.json({ error: "Ce lien a expiré ou a déjà été utilisé. Tu peux demander un nouveau lien depuis le blog." }, { status: 400 });
    } else {
      const { error } = await admin.from("newsletter_subscribers")
        .update({ confirmed: false, unsubscribed_at: new Date().toISOString(), manage_token_hash: null, confirmation_expires_at: null })
        .eq("manage_token_hash", hash);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Cette action est temporairement indisponible. Réessaie dans un instant." }, { status: 503 });
  }
}
