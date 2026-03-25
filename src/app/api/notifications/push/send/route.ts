import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { timingSafeEqual } from "crypto";

const pushBodySchema = z.object({
  userId: z.string().uuid("userId doit être un UUID valide"),
  title: z.string().min(1, "Le titre est requis"),
  body: z.string().min(1, "Le contenu est requis"),
  url: z.string().optional(),
});

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function initVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  const email = process.env.VAPID_EMAIL || "mailto:mehdi@tamel.fr";
  if (publicKey && privateKey) {
    webpush.setVapidDetails(email, publicKey, privateKey);
    return true;
  }
  return false;
}

function isAuthorized(authHeader: string | null): boolean {
  const expectedToken = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || !expectedToken) return false;
  const token = authHeader.replace("Bearer ", "");
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expectedToken);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit("push-send", 10, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429 }
    );
  }

  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!initVapid()) {
    return NextResponse.json({ error: "VAPID non configuré" }, { status: 500 });
  }

  const rawBody = await request.json();
  const parsed = pushBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }
  const { userId, title, body, url } = parsed.data;

  const supabaseAdmin = getSupabaseAdmin();
  const { data: subscriptions } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const payload = JSON.stringify({ title, body, url: url || "/dashboard" });
  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
      sent++;
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
    }
  }

  return NextResponse.json({ sent });
}
