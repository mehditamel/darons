"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator, Baby, Syringe, Wallet, Scale, PiggyBank, Home,
  Phone, Monitor, Stethoscope, ClipboardCheck, TrendingUp,
  CalendarRange, Ruler, Search,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ToolCard {
  href: string;
  iconName: string;
  title: string;
  description: string;
  color: string;
  isNew?: boolean;
}

interface ToolSection {
  title: string;
  tools: ToolCard[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator, Baby, Syringe, Wallet, Scale, PiggyBank, Home,
  Phone, Monitor, Stethoscope, ClipboardCheck, TrendingUp,
  CalendarRange, Ruler,
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const SECTIONS: ToolSection[] = [
  {
    title: "Argent & droits",
    tools: [
      {
        href: "/outils/simulateur-ir",
        iconName: "Calculator",
        title: "Simulateur impôt 2025",
        description: "Calcule ton impôt, ton TMI et tes crédits d'impôt (garde, emploi domicile, dons). Barème officiel.",
        color: "text-warm-gold bg-warm-gold/10",
      },
      {
        href: "/outils/simulateur-caf",
        iconName: "Baby",
        title: "Simulateur allocations CAF",
        description: "Allocations familiales, PAJE, CMG, allocation rentrée scolaire. Tous tes droits CAF.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/simulateur-garde",
        iconName: "Baby",
        title: "Coût de garde : le vrai prix",
        description: "Crèche, nounou, garde à domicile : calcule ton reste à charge réel après CMG et crédit d'impôt.",
        color: "text-warm-blue bg-warm-blue/10",
      },
      {
        href: "/outils/simulateur-budget",
        iconName: "Wallet",
        title: "Budget familial",
        description: "Revenus, dépenses par catégorie, reste à vivre. Fais le point sur tes finances de parent.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/combien-coute-enfant",
        iconName: "PiggyBank",
        title: "Coût d'un enfant (0-18 ans)",
        description: "Le vrai coût d'un enfant de la naissance à 18 ans. Poste par poste, tranche d'âge par tranche.",
        color: "text-warm-gold bg-warm-gold/10",
      },
      {
        href: "/outils/mes-droits",
        iconName: "Scale",
        title: "Tous tes droits sociaux",
        description: "Allocations, PAJE, CMG, prime d'activité, RSA : calcule toutes les aides en 2 minutes.",
        color: "text-warm-green bg-warm-green/10",
      },
      {
        href: "/outils/conge-parental",
        iconName: "Home",
        title: "Simulateur congé parental",
        description: "PreParE taux plein ou mi-temps, durée max, impact sur tes revenus. Compare les options.",
        color: "text-warm-blue bg-warm-blue/10",
        isNew: true,
      },
    ],
  },
  {
    title: "Santé",
    tools: [
      {
        href: "/outils/calendrier-vaccinal",
        iconName: "Syringe",
        title: "Calendrier vaccinal interactif",
        description: "Les 9 vaccins obligatoires de ton enfant avec les dates personnalisées.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/courbe-croissance",
        iconName: "Ruler",
        title: "Courbes de croissance OMS",
        description: "Poids, taille, périmètre crânien. Suis la croissance de ton bébé avec les courbes OMS.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/examens-sante",
        iconName: "Stethoscope",
        title: "20 examens obligatoires",
        description: "Le calendrier des 20 visites de santé obligatoires de 8 jours à 18 ans.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/numeros-urgence",
        iconName: "Phone",
        title: "Numéros d'urgence",
        description: "SAMU, pompiers, centre antipoison, SOS Médecins. Appel direct en 1 tap.",
        color: "text-warm-red bg-warm-red/10",
      },
      {
        href: "/outils/ecrans-enfants",
        iconName: "Monitor",
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
        iconName: "ClipboardCheck",
        title: "Checklist naissance",
        description: "Toutes les démarches de la grossesse aux 3 ans. Coche au fur et à mesure.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/jalons-developpement",
        iconName: "TrendingUp",
        title: "Jalons de développement",
        description: "Premiers mots, premiers pas. Référentiels OMS/HAS par catégorie.",
        color: "text-warm-purple bg-warm-purple/10",
        isNew: true,
      },
      {
        href: "/outils/timeline-administrative",
        iconName: "CalendarRange",
        title: "Timeline administrative",
        description: "La frise de la vie de parent : tout ce que tu dois faire, quand.",
        color: "text-warm-orange bg-warm-orange/10",
        isNew: true,
      },
    ],
  },
];

export const TOTAL_TOOLS = SECTIONS.reduce((acc, s) => acc + s.tools.length, 0);

export function ToolsGrid() {
  const [query, setQuery] = useState("");

  const normalizedQuery = normalizeText(query.trim());

  const allTools = SECTIONS.flatMap((s) => s.tools);
  const filteredTools = normalizedQuery
    ? allTools.filter(
        (tool) =>
          normalizeText(tool.title).includes(normalizedQuery) ||
          normalizeText(tool.description).includes(normalizedQuery)
      )
    : null;

  return (
    <>
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un outil..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTools ? (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            {filteredTools.length} résultat{filteredTools.length > 1 ? "s" : ""}
            {filteredTools.length === 0 ? " — essaie un autre mot-clé" : ""}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCardComponent key={tool.href} tool={tool} />
            ))}
          </div>
        </div>
      ) : (
        SECTIONS.map((section) => (
          <div key={section.title} className="space-y-6">
            <h2 className="text-xl font-serif font-bold border-b pb-2">
              {section.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.tools.map((tool) => (
                <ToolCardComponent key={tool.href} tool={tool} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}

function ToolCardComponent({ tool }: { tool: ToolCard }) {
  const Icon = ICON_MAP[tool.iconName] ?? Calculator;

  return (
    <Link href={tool.href}>
      <Card className="h-full card-playful cursor-pointer relative">
        {tool.isNew && (
          <Badge className="absolute top-3 right-3 bg-warm-orange text-white text-[10px] px-2 py-0.5">
            Nouveau
          </Badge>
        )}
        <CardHeader className="pb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.color} mb-2`}
          >
            <Icon className="w-5 h-5" />
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
  );
}
