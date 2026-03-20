import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Baby, FileText, Landmark, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Guide complet des démarches après une naissance — Darons",
  description:
    "Toutes les démarches administratives à faire après la naissance de ton enfant : déclaration, CAF, sécu, congé, inscription crèche. Rien à oublier.",
  openGraph: {
    title: "Guide des démarches après une naissance — Darons",
    description:
      "La checklist complète des parents qui veulent rien oublier après la naissance.",
  },
};

const STEPS = [
  {
    delay: "Dans les 5 jours",
    title: "Déclaration de naissance",
    description:
      "À faire à la mairie du lieu de naissance. La maternité peut s'en charger. Munis-toi du livret de famille, des pièces d'identité des parents et de l'attestation du médecin.",
    priority: "urgent" as const,
    icon: Baby,
    tip: "Si tu es marié, la filiation est automatique. Sinon, pense à la reconnaissance anticipée (idéalement avant la naissance).",
  },
  {
    delay: "Dans les 14 jours",
    title: "Déclaration à l'Assurance Maladie",
    description:
      "Rattache ton enfant à ta carte Vitale (ou celle de l'autre parent). Tu peux le faire en ligne sur ameli.fr ou en envoyant le formulaire S3705 avec une copie de l'acte de naissance.",
    priority: "high" as const,
    icon: Heart,
    tip: "L'enfant peut être rattaché aux deux parents. Choisis le régime qui te convient le mieux.",
  },
  {
    delay: "Dès la naissance",
    title: "Déclaration à la CAF",
    description:
      "Si tu es déjà allocataire, déclare la naissance sur caf.fr (rubrique \"Déclarer un changement\"). Sinon, crée ton compte et fais une demande de PAJE (prime de naissance + allocation de base).",
    priority: "high" as const,
    icon: Landmark,
    tip: "La prime de naissance (1 019,40 € en 2025) est versée au cours du 2e mois suivant la naissance, sous conditions de ressources.",
  },
  {
    delay: "Avant les 6 mois de l'enfant",
    title: "Demande de Complément de libre choix du Mode de Garde (CMG)",
    description:
      "Si tu fais garder ton enfant par une assistante maternelle, une micro-crèche ou une garde à domicile, fais la demande de CMG auprès de la CAF. Le montant dépend de tes revenus et du mode de garde.",
    priority: "high" as const,
    icon: FileText,
    tip: "Le CMG peut couvrir jusqu'à 85% du coût de la garde. Utilise notre simulateur pour estimer ton reste à charge.",
  },
  {
    delay: "Dès que possible",
    title: "Mise à jour du livret de famille",
    description:
      "L'officier d'état civil met automatiquement à jour le livret de famille lors de la déclaration de naissance. Si tu n'en as pas encore, il est créé à cette occasion.",
    priority: "normal" as const,
    icon: FileText,
    tip: "Si tu es dans une situation particulière (parents non mariés, adoption), renseigne-toi auprès de la mairie.",
  },
  {
    delay: "Dans le mois",
    title: "Congé paternité / second parent",
    description:
      "25 jours calendaires (32 pour des jumeaux). Les 7 premiers jours sont obligatoires et doivent être pris immédiatement après le congé de naissance (3 jours). Préviens ton employeur au moins 1 mois avant.",
    priority: "high" as const,
    icon: ClipboardCheck,
    tip: "Le congé est indemnisé par la Sécu à hauteur du salaire journalier (plafonné). Pense à envoyer l'attestation à ta CPAM.",
  },
  {
    delay: "Avant les 3 mois",
    title: "Inscription en crèche",
    description:
      "Les inscriptions en crèche se font souvent très tôt (parfois dès la grossesse). Contacte ta mairie ou le Relais Petite Enfance de ton secteur pour connaître les modalités et dates de commission.",
    priority: "normal" as const,
    icon: Baby,
    tip: "Inscris-toi sur plusieurs listes d'attente. Les places sont rares dans certaines villes.",
  },
  {
    delay: "Avant les 6 mois",
    title: "Mutuelle et complémentaire santé",
    description:
      "Rattache ton enfant à ta mutuelle. Si tu n'en as pas, vérifie ton éligibilité à la Complémentaire Santé Solidaire (CSS) sur ameli.fr.",
    priority: "normal" as const,
    icon: Heart,
    tip: "Certaines mutuelles offrent un forfait naissance. Vérifie auprès de la tienne.",
  },
  {
    delay: "Dans l'année",
    title: "Déclaration d'impôts",
    description:
      "Déclare ton enfant sur ta prochaine déclaration de revenus. Tu bénéficies d'une demi-part supplémentaire (quotient familial). N'oublie pas les crédits d'impôt pour frais de garde si applicable.",
    priority: "normal" as const,
    icon: Landmark,
    tip: "Un enfant né en cours d'année te donne droit à la demi-part pour l'année entière. Crédit d'impôt garde : 50% des dépenses, max 1 750 €.",
  },
  {
    delay: "Quand tu veux",
    title: "Passeport et carte d'identité de l'enfant",
    description:
      "Pas obligatoire immédiatement, mais nécessaire pour voyager. Le passeport est valable 5 ans pour un mineur. La CNI est gratuite et valable 10 ans.",
    priority: "low" as const,
    icon: FileText,
    tip: "Prends RDV en mairie bien à l'avance (les délais sont souvent de plusieurs semaines). Photo d'identité obligatoire, même pour un nourrisson.",
  },
];

const PRIORITY_STYLES = {
  urgent: "bg-warm-red/10 text-warm-red border-warm-red/20",
  high: "bg-warm-orange/10 text-warm-orange border-warm-orange/20",
  normal: "bg-warm-teal/10 text-warm-teal border-warm-teal/20",
  low: "bg-muted text-muted-foreground",
};

const PRIORITY_LABELS = {
  urgent: "Urgent",
  high: "Important",
  normal: "À faire",
  low: "Optionnel",
};

export default function GuideDemarchesNaissancePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold sm:text-4xl">
          Les démarches après une naissance
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          La checklist complète pour ne rien oublier. De la déclaration de
          naissance à la déclaration d&apos;impôts, on t&apos;explique tout
          simplement.
        </p>
      </div>

      <div className="grid gap-4">
        {STEPS.map((step, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-warm-orange to-warm-teal" />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <step.icon className="h-5 w-5 text-warm-orange" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{step.delay}</p>
                  </div>
                </div>
                <Badge className={PRIORITY_STYLES[step.priority]} variant="outline">
                  {PRIORITY_LABELS[step.priority]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{step.description}</p>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Astuce :</strong> {step.tip}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-warm-orange/5 border-warm-orange/20">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <h2 className="text-xl font-serif font-semibold">
            Suis toutes tes démarches automatiquement
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Avec Darons, chaque démarche est trackée avec des rappels
            automatiques. Fini les oublis et la panique de dernière minute.
          </p>
          <Button asChild>
            <Link href="/register">
              C&apos;est gratuit, je m&apos;inscris
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
