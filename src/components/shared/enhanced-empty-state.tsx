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
    title: "Aucun document enregistré",
    description:
      "Ajoutez les pièces d'identité de votre famille pour ne plus jamais oublier une date d'expiration.",
    cta: "Ajouter un premier document",
    ctaHref: "/identite",
  },
  vaccinations: {
    icon: Syringe,
    title: "Carnet de vaccins vierge",
    description:
      "Le calendrier vaccinal est prêt. Commencez par les vaccins déjà faits.",
    cta: "Enregistrer un vaccin",
    ctaHref: "/sante",
  },
  budget: {
    icon: Wallet,
    title: "Votre budget vous attend",
    description:
      "Connectez votre banque pour un suivi automatique, ou ajoutez vos dépenses manuellement.",
    cta: "Connecter ma banque",
    ctaHref: "/budget",
    ctaSecondary: "Saisie manuelle",
    ctaSecondaryHref: "/budget",
  },
  journal: {
    icon: PenLine,
    title: "Le journal de votre famille",
    description:
      "Notez les premiers mots, les fous rires, les petites victoires. Vous serez contents de les relire.",
    cta: "Écrire une première note",
    ctaHref: "/developpement",
  },
  documents: {
    icon: FolderLock,
    title: "Votre coffre-fort est vide",
    description:
      "Stockez vos documents importants en toute sécurité : ordonnances, certificats, factures.",
    cta: "Importer un document",
    ctaHref: "/documents",
  },
  scolarite: {
    icon: GraduationCap,
    title: "Parcours scolaire",
    description:
      "Suivez le parcours éducatif de vos enfants : de la crèche au collège.",
    cta: "Ajouter une inscription",
    ctaHref: "/scolarite",
  },
  garde: {
    icon: Baby,
    title: "Recherche de garde",
    description:
      "Trouvez le mode de garde idéal près de chez vous : crèche, assistante maternelle, MAM.",
    cta: "Rechercher",
    ctaHref: "/garde",
  },
  developpement: {
    icon: TrendingUp,
    title: "Jalons de développement",
    description:
      "Suivez les progrès de votre enfant : motricité, langage, cognition, socialisation.",
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

  const Icon = config.icon;
  const description = childName
    ? config.description.replace("votre enfant", childName)
    : config.description;

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{config.title}</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-6 flex gap-2">
          <Button asChild>
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
