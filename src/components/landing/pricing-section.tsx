import { Check } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Tout ce qu'il faut pour gérer ta famille au quotidien.",
    features: [
      "Suivi santé complet (vaccins, croissance, RDV)",
      "Budget manuel + allocations CAF",
      "Simulation fiscale (IR, crédits d'impôt)",
      "Coffre-fort numérique (1 Go)",
      "Alertes proactives par email",
      "Recherche de garde géolocalisée",
      "Journal parental + jalons développement",
      "17 outils gratuits sans inscription",
    ],
    cta: "C'est gratuit, je m'inscris",
    ctaHref: "/register",
    highlighted: false,
  },
  {
    name: "Darons+",
    price: "4,99€",
    period: "/mois",
    description: "Les extras pour les parents qui veulent aller plus loin.",
    features: [
      "Tout le plan Gratuit",
      "Sync Google Calendar / Apple Calendar",
      "Export PDF (bilan annuel foyer)",
      "OCR ordonnances illimité",
      "50 Go de stockage coffre-fort",
      "Alertes SMS pour les urgences",
      "Thèmes personnalisés",
      "Zéro publicité",
    ],
    cta: "Bientôt disponible",
    ctaHref: "/register",
    highlighted: true,
    badge: "Populaire",
  },
  {
    name: "Family Pro",
    price: "9,99€",
    period: "/mois",
    description: "Pour les familles recomposées et les co-parents organisés.",
    features: [
      "Tout le plan Darons+",
      "Multi-foyers (grands-parents, nounou)",
      "Dépenses partagées type Tricount",
      "Coach budgétaire IA illimité",
      "Support prioritaire",
      "API et exports avancés",
    ],
    cta: "Bientôt disponible",
    ctaHref: "/register",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold">
            Gratuit. Vraiment.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Darons est 100% gratuit au lancement. Les plans payants arriveront plus tard
            pour des extras — mais le cœur de l&apos;app restera toujours gratuit.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.highlighted
                  ? "border-warm-orange shadow-lg shadow-warm-orange/10 scale-[1.02]"
                  : ""
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warm-orange text-white px-4">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-warm-green shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaHref} className="mt-6 block">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    disabled={plan.cta === "Bientôt disponible"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Pas de carte bancaire requise. Pas d&apos;engagement. Tu peux annuler à tout moment.
        </p>
      </div>
    </section>
  );
}
