import type { SubscriptionPlan } from "@/types/family";

interface StripePlan {
  priceId: string;
  name: string;
  price: number;
}

let cachedPlans: Record<Exclude<SubscriptionPlan, "free">, StripePlan> | null =
  null;

export function getStripePlans(): Record<
  Exclude<SubscriptionPlan, "free">,
  StripePlan
> {
  if (!cachedPlans) {
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    const familyProPriceId = process.env.STRIPE_FAMILY_PRO_PRICE_ID;

    if (!premiumPriceId || !familyProPriceId) {
      throw new Error(
        "Variables d'environnement Stripe manquantes : STRIPE_PREMIUM_PRICE_ID et STRIPE_FAMILY_PRO_PRICE_ID doivent être configurées dans .env.local"
      );
    }

    cachedPlans = {
      premium: {
        priceId: premiumPriceId,
        name: "Premium",
        price: 9.9,
      },
      family_pro: {
        priceId: familyProPriceId,
        name: "Family Pro",
        price: 19.9,
      },
    };
  }
  return cachedPlans;
}
