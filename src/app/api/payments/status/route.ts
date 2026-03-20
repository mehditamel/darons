import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const result: Record<string, unknown> = {
    plan: profile.subscription_plan ?? "free",
    status: "active",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  };

  if (profile.stripe_customer_id) {
    try {
      const stripe = getStripe();
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: "active",
        limit: 1,
      });

      const sub = subscriptions.data[0];
      if (sub) {
        result.status = sub.status;
        result.currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
        result.cancelAtPeriodEnd = sub.cancel_at_period_end;
      }
    } catch {
      // Stripe unavailable — return local data only
    }
  }

  return NextResponse.json(result);
}
