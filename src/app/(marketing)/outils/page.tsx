import type { Metadata } from "next";
import Link from "next/link";
import {
  Calculator, Baby, Syringe, Wallet, Scale, PiggyBank, Home,
  Phone, Monitor, Stethoscope, ClipboardCheck, TrendingUp,
  CalendarRange, Ruler,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "15 outils gratuits pour les parents — Sans inscription",
  description:
    "Simulateurs impôts, allocations CAF, coût de garde, budget familial, courbes de croissance, calendrier vaccinal et plus. 100% gratuit, sans inscription.",
  openGraph: {
    title: "Outils gratuits pour parents — Darons",
    description:
      "15 outils gratuits pour les parents : impôts, allocations, santé, budget, droits sociaux. Sans inscription.",
  },
  alternates: {
    canonical: "https://darons.app/outils",
  },
};

interface ToolCard {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const SECTIONS: { title: string; tools: ToolCard[] }[] = [
  {
    title: "Argent & droits",
    tools: [
      {
        href: "/outils/simulateur-ir",
        icon: Calculator,
        title: "Simulateur impôt 2025",
        description: "Calcule ton impôt, ton TMI et tes crédits d'impôt (garde, emploi domicile, dons). Barème officiel.",
        color: "text-warm-gold bg-warm-gold/10",
      },
      {
        href: "/outils/simulateur-caf",
        icon: Baby,
        title: "Simulateur allocations CAF",
        description: "Allocations familiales, PAJE, CMG, allocation rentrée scolaire. Tous tes droits CAF.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/simulateur-garde",
        icon: Baby,
        title: "Coût de garde : le vrai prix",
        description: "Crèche, nounou, garde à domicile : calcule ton reste à charge réel après CMG et crédit d'impôt.",
        color: "text-warm-blue bg-warm-blue/10",
      },
      {
        href: "/outils/simulateur-budget",
        icon: Wallet,
        title: "Budget familial",
        description: "Revenus, dépenses par catégorie, reste à vivre. Fais le point sur tes finances de parent.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/combien-coute-enfant",
        icon: PiggyBank,
        title: "Coût d'un enfant (0-18 ans)",
        description: "Le vrai coût d'un enfant de la naissance à 18 ans. Poste par poste, tranche d'âge par tranche.",
        color: "text-warm-gold bg-warm-gold/10",
      },
      {
        href: "/outils/mes-droits",
        icon: Scale,
        title: "Tous tes droits sociaux",
        description: "Allocations, PAJE, CMG, prime d'activité, RSA : calcule toutes les aides en 2 minutes.",
        color: "text-warm-green bg-warm-green/10",
      },
      {
        href: "/outils/conge-parental",
        icon: Home,
        title: "Simulateur congé parental",
        description: "PreParE taux plein ou mi-temps, durée max, impact sur tes revenus. Compare les options.",
        color: "text-warm-blue bg-warm-blue/10",
      },
    ],
  },
  {
    title: "Santé",
    tools: [
      {
        href: "/outils/calendrier-vaccinal",
        icon: Syringe,
        title: "Calendrier vaccinal interactif",
        description: "Les 9 vaccins obligatoires de ton enfant avec les dates personnalisées.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/courbe-croissance",
        icon: Ruler,
        title: "Courbes de croissance OMS",
        description: "Poids, taille, périmètre crânien. Suis la croissance de ton bébé avec les courbes OMS.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/examens-sante",
        icon: Stethoscope,
        title: "20 examens obligatoires",
        description: "Le calendrier des 20 visites de santé obligatoires de 8 jours à 18 ans.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/numeros-urgence",
        icon: Phone,
        title: "Numéros d'urgence",
        description: "SAMU, pompiers, centre antipoison, SOS Médecins. Appel direct en 1 tap.",
        color: "text-warm-red bg-warm-red/10",
      },
      {
        href: "/outils/ecrans-enfants",
        icon: Monitor,
        title: "Guide écrans par âge",
        description: "Recommandations officielles du carnet de santé 2025. Alternatives et conseils.",
        color: "text-warm-purple bg-warm-purple/10",
      },
    ],
  },
  {
    title: "Vie de parent",
    tools: [
      {
        href: "/outils/checklist-naissance",
        icon: ClipboardCheck,
        title: "Checklist naissance",
        description: "Toutes les démarches de la grossesse aux 3 ans. Coche au fur et à mesure.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/jalons-developpement",
        icon: TrendingUp,
        title: "Jalons de développement",
        description: "Premiers mots, premiers pas. Référentiels OMS/HAS par catégorie.",
        color: "text-warm-purple bg-warm-purple/10",
      },
      {
        href: "/outils/timeline-administrative",
        icon: CalendarRange,
        title: "Timeline administrative",
        description: "La frise de la vie de parent : tout ce que tu dois faire, quand.",
        color: "text-warm-orange bg-warm-orange/10",
      },
    ],
  },
];

export default function OutilsPage() {
  return (
    <div className="space-y-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Outils gratuits pour parents",
          description: "15 simulateurs et outils gratuits pour les parents français.",
          url: "https://darons.app/outils",
          isPartOf: {
            "@type": "WebSite",
            name: "Darons",
            url: "https://darons.app",
          },
        }}
      />

      <div className="text-center space-y-3">
        <Badge variant="outline" className="mb-2">100% gratuit, sans inscription</Badge>
        <h1 className="text-3xl font-serif font-bold">
          15 outils gratuits pour les parents
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pas besoin de compte. Simule tes impôts, calcule tes aides, suis la
          croissance de ton bébé — tout est là, gratuit, sans piège.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-6">
          <h2 className="text-xl font-serif font-bold border-b pb-2">{section.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.tools.map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full card-playful cursor-pointer">
                  <CardHeader className="pb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color} mb-2`}
                    >
                      <tool.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center pt-8 border-t">
        <p className="text-muted-foreground mb-4">
          Envie de tout centraliser, recevoir des alertes et utiliser l&apos;IA ?
          C&apos;est gratuit aussi.
        </p>
        <Link href="/register">
          <Button size="lg">
            Créer mon compte gratuit
          </Button>
        </Link>
      </div>
    </div>
  );
}
