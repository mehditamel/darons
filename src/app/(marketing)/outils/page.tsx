import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Baby, Syringe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Outils gratuits pour parents",
  description:
    "Simulateur impôt sur le revenu 2025, calculateur allocations CAF (PAJE, CMG, ARS), calendrier vaccinal interactif. Outils gratuits sans inscription.",
  openGraph: {
    title: "Outils gratuits pour parents — Ma Vie Parentale",
    description:
      "Simulez vos impôts, calculez vos allocations CAF et planifiez les vaccins de votre enfant gratuitement.",
  },
};

const tools = [
  {
    href: "/outils/simulateur-ir",
    icon: Calculator,
    title: "Simulateur impôt sur le revenu 2025",
    description:
      "Calculez votre impôt, votre TMI et vos crédits d'impôt (garde d'enfant, emploi à domicile, dons). Barème 2025 officiel.",
    color: "text-warm-gold bg-warm-gold/10",
  },
  {
    href: "/outils/simulateur-caf",
    icon: Baby,
    title: "Simulateur allocations CAF 2025",
    description:
      "Estimez vos droits : allocations familiales, PAJE (prime naissance, allocation de base), CMG, allocation de rentrée scolaire.",
    color: "text-warm-teal bg-warm-teal/10",
  },
  {
    href: "/outils/calendrier-vaccinal",
    icon: Syringe,
    title: "Calendrier vaccinal interactif",
    description:
      "Visualisez les 9 vaccins obligatoires de votre enfant avec les dates personnalisées selon sa date de naissance.",
    color: "text-warm-orange bg-warm-orange/10",
  },
];

export default function OutilsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-serif font-bold">
          Outils gratuits pour les parents
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pas besoin de compte. Utilisez nos simulateurs et outils pour mieux
          gérer votre budget famille, vos impôts et la santé de vos enfants.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.color} mb-3`}
                >
                  <tool.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {tool.description}
                </p>
                <Button variant="link" className="px-0 mt-3">
                  Utiliser l&apos;outil &rarr;
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="text-center pt-8 border-t">
        <p className="text-muted-foreground mb-4">
          Envie de centraliser tout dans un seul tableau de bord ?
        </p>
        <Link href="/register">
          <Button size="lg">
            Créer mon cockpit gratuitement
          </Button>
        </Link>
      </div>
    </div>
  );
}
