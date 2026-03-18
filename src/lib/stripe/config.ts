import type { SubscriptionPlan } from "@/types/family";

export const STRIPE_PLANS: Record<
  Exclude<SubscriptionPlan, "free">,
  { priceId: string; name: string; price: number }
> = {
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || "price_premium",
    name: "Premium",
    price: 9.90,
  },
  family_pro: {
    priceId: process.env.STRIPE_FAMILY_PRO_PRICE_ID || "price_family_pro",
    name: "Family Pro",
    price: 19.90,
  },
};
