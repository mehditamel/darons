import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  IdCard,
  Syringe,
  Wallet,
  PenLine,
  FolderLock,
  GraduationCap,
  Baby,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { ILLUSTRATION_MAP } from "@/components/shared/illustrations";

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  ctaHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
}

const EMPTY_STATE_CONFIGS: Record<string, EmptyStateConfig> = {
  identite: {
    icon: IdCard,
    title: "Aucun papier enregistré",
    description:
      "CNI, passeport, livret de famille... Ajoute-les ici et on te prévient avant qu'ils expirent. Fini la panique au guichet.",
    cta: "Ajouter un document",
    ctaHref: "/identite",
  },
  vaccinations: {
    icon: Syringe,
    title: "Carnet de vaccins vide",
    description:
      "On a préparé le calendrier vaccinal. Dis-nous juste ce qui est déjà fait.",
    cta: "Enregistrer un vaccin",
    ctaHref: "/sante",
  },
  budget: {
    icon: Wallet,
    title: "Ton budget t'attend",
    description:
      "Connecte ta banque pour voir où passe la thune, ou ajoute tes dépenses à la main. Zéro jugement.",
    cta: "Connecter ma banque",
    ctaHref: "/budget",
    ctaSecondary: "Saisie manuelle",
    ctaSecondaryHref: "/budget",
  },
  journal: {
    icon: PenLine,
    title: "Le journal de ta tribu",
    description:
      "Premiers mots, fous rires, galères mémorables. Note tout. Tu seras content de relire ça dans 10 ans.",
    cta: "Écrire une première note",
    ctaHref: "/developpement",
  },
  documents: {
    icon: FolderLock,
    title: "Ton coffre-fort est vide",
    description:
      "Ordonnances, certificats, factures — tout au même endroit, en sécurité. Plus jamais à chercher ce papier introuvable.",
    cta: "Importer un document",
    ctaHref: "/documents",
  },
  scolarite: {
    icon: GraduationCap,
    title: "Parcours scolaire",
    description:
      "De la crèche au collège, on suit le parcours de tes enfants. Inscriptions, notes, contacts enseignants.",
    cta: "Ajouter une inscription",
    ctaHref: "/scolarite",
  },
  garde: {
    icon: Baby,
    title: "Recherche de garde",
    description:
      "Crèche, assistante maternelle, MAM — on t'aide à trouver le bon mode de garde près de chez toi.",
    cta: "Rechercher",
    ctaHref: "/garde",
  },
  developpement: {
    icon: TrendingUp,
    title: "Premiers pas, premiers mots",
    description:
      "Suis les progrès de ton enfant : motricité, langage, cognition, socialisation. Chaque enfant a son rythme.",
    cta: "Commencer le suivi",
    ctaHref: "/developpement",
  },
};

interface EnhancedEmptyStateProps {
  module: keyof typeof EMPTY_STATE_CONFIGS;
  childName?: string;
}

export function EnhancedEmptyState({ module, childName }: EnhancedEmptyStateProps) {
  const config = EMPTY_STATE_CONFIGS[module];
  if (!config) return null;

  const Illustration = ILLUSTRATION_MAP[module];
  const description = childName
    ? config.description.replace("ton enfant", childName)
    : config.description;

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center py-12 text-center">
        {/* SVG Illustration with fade-in */}
        {Illustration ? (
          <div className="mb-6">
            <Illustration size={120} />
          </div>
        ) : (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted animate-bounce-gentle">
            <config.icon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Title with stagger delay */}
        <h3 className="text-lg font-semibold animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {config.title}
        </h3>

        {/* Description with stagger delay */}
        <p
          className="mt-2 max-w-sm text-sm text-muted-foreground animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {description}
        </p>

        {/* CTAs with stagger delay */}
        <div className="mt-6 flex gap-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button asChild className="animate-pulse-glow">
            <Link href={config.ctaHref}>{config.cta}</Link>
          </Button>
          {config.ctaSecondary && config.ctaSecondaryHref && (
            <Button variant="outline" asChild>
              <Link href={config.ctaSecondaryHref}>
                {config.ctaSecondary}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
