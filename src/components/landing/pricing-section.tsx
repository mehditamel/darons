"use client";

import { useEffect, useRef } from "react";
import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";

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

type CellValue = true | false | string;

interface ComparisonRow {
  label: string;
  isGroup?: boolean;
  free?: CellValue;
  plus?: CellValue;
  pro?: CellValue;
}

const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Santé", isGroup: true },
  { label: "Suivi vaccins & croissance", free: true, plus: true, pro: true },
  { label: "RDV médicaux & rappels", free: true, plus: true, pro: true },
  { label: "20 examens obligatoires", free: true, plus: true, pro: true },
  { label: "OCR ordonnances", free: "5/mois", plus: "Illimité", pro: "Illimité" },
  { label: "Budget & Finances", isGroup: true },
  { label: "Budget manuel + catégories", free: true, plus: true, pro: true },
  { label: "Open Banking (Bridge)", free: true, plus: true, pro: true },
  { label: "Coach IA budget", free: true, plus: true, pro: true },
  { label: "Simulation IR & crédits", free: true, plus: true, pro: true },
  { label: "Documents & Outils", isGroup: true },
  { label: "Coffre-fort numérique", free: "1 Go", plus: "50 Go", pro: "50 Go" },
  { label: "Recherche de garde", free: true, plus: true, pro: true },
  { label: "Export PDF", free: false, plus: true, pro: true },
  { label: "Sync calendrier", free: false, plus: true, pro: true },
  { label: "Notifications", isGroup: true },
  { label: "Alertes email + push", free: true, plus: true, pro: true },
  { label: "Alertes SMS urgentes", free: false, plus: true, pro: true },
  { label: "Collaboration", isGroup: true },
  { label: "Multi-foyers", free: false, plus: false, pro: true },
  { label: "Dépenses partagées", free: false, plus: false, pro: true },
  { label: "Support prioritaire", free: false, plus: false, pro: true },
  { label: "Personnalisation", isGroup: true },
  { label: "Thèmes personnalisés", free: false, plus: true, pro: true },
  { label: "Zéro publicité", free: false, plus: true, pro: true },
];

function renderCell(value?: CellValue) {
  if (value === true) return <Check className="h-4 w-4 text-warm-green mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  if (typeof value === "string") return <span className="text-xs font-medium">{value}</span>;
  return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
}

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackEvent("pricing_page_viewed");
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="pricing" className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold">
            Gratuit. Vraiment.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Darons est 100% gratuit au lancement. Les plans payants arriveront plus tard
            pour des extras — mais le cœur de l'app restera toujours gratuit.
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
          Pas de carte bancaire requise. Pas d'engagement. Tu peux annuler à tout moment.
        </p>

        {/* Feature comparison table — desktop only */}
        <div className="hidden lg:block mt-16">
          <h3 className="text-xl font-serif font-bold text-center mb-8">
            Comparatif détaillé
          </h3>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold">Fonctionnalité</th>
                  <th className="text-center p-4 font-semibold">Gratuit</th>
                  <th className="text-center p-4 font-semibold text-warm-orange">Darons+</th>
                  <th className="text-center p-4 font-semibold">Family Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  row.isGroup ? (
                    <tr key={i} className="bg-muted/30">
                      <td colSpan={4} className="p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        {row.label}
                      </td>
                    </tr>
                  ) : (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-3 pl-4">{row.label}</td>
                      <td className="p-3 text-center">{renderCell(row.free)}</td>
                      <td className="p-3 text-center">{renderCell(row.plus)}</td>
                      <td className="p-3 text-center">{renderCell(row.pro)}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
