import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { getStripePlans } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";

function mapPriceIdToPlan(priceId: string): "premium" | "family_pro" | null {
  try {
    const plans = getStripePlans();
    if (priceId === plans.premium.priceId) return "premium";
    if (priceId === plans.family_pro.priceId) return "family_pro";
  } catch {
    // Config not available — fallback
  }
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!customerId || !subscriptionId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) return;

  const plan = mapPriceIdToPlan(priceId);
  if (!plan) return;

  // Find user by Stripe customer ID or client_reference_id (user ID passed at checkout)
  const userId = session.client_reference_id;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({
      subscription_plan: plan,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId || !customerId) return;

  const plan = mapPriceIdToPlan(priceId);
  if (!plan) return;

  await supabase
    .from("profiles")
    .update({
      subscription_plan: plan,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const customerId = subscription.customer as string;

  if (!customerId) return;

  await supabase
    .from("profiles")
    .update({
      subscription_plan: "free",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createAdminClient();
  const customerId = invoice.customer as string;

  if (!customerId) return;

  // Log the failed payment for future notification dispatch
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  // Get the household for the notification log
  const { data: household } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", profile.id)
    .single();

  if (!household) return;

  await supabase.from("notification_log").insert({
    household_id: household.id,
    channel: "email",
    notification_type: "payment_failed",
    subject: "Échec de paiement — Cockpit Parental",
    delivered: false,
    metadata: {
      invoice_id: invoice.id,
      amount_due: invoice.amount_due,
      attempt_count: invoice.attempt_count,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }
      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }
}
