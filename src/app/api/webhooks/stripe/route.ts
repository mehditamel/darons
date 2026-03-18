import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";

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
        // TODO: Create/upgrade subscription in Supabase
        break;
      }
      case "customer.subscription.updated": {
        // TODO: Update plan in profiles table
        break;
      }
      case "customer.subscription.deleted": {
        // TODO: Downgrade to free plan
        break;
      }
      case "invoice.payment_failed": {
        // TODO: Notify user, start grace period
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
