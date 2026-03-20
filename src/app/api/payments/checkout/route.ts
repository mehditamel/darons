import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getStripePlans } from "@/lib/stripe/config";
import { rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validators/payments";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const limited = rateLimit(`checkout:${user.id}`, 5, 60_000);
  if (limited) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans quelques secondes." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  let stripe;
  let plans;
  try {
    stripe = getStripe();
    plans = getStripePlans();
  } catch {
    return NextResponse.json(
      { error: "Le paiement n'est pas encore configuré" },
      { status: 503 }
    );
  }

  const { plan: selectedPlanKey } = parsed.data;
  const selectedPlan = plans[selectedPlanKey];

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: profile.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    } catch {
      return NextResponse.json(
        { error: "Impossible de créer le compte client" },
        { status: 500 }
      );
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${appUrl}/parametres?checkout=success`,
      cancel_url: `${appUrl}/parametres?checkout=cancelled`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json(
      { error: "Impossible de créer la session de paiement" },
      { status: 500 }
    );
  }
}
