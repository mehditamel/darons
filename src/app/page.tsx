import Link from "next/link";
import {
  HeartPulse,
  GraduationCap,
  Calculator,
  Wallet,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  Baby,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_PRICING } from "@/lib/constants";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Santé & vaccins",
    description:
      "Calendrier vaccinal, courbes de croissance, rendez-vous médicaux. Ne manquez plus aucune dose.",
    color: "text-warm-teal bg-warm-teal/10",
  },
  {
    icon: GraduationCap,
    title: "Éducation & développement",
    description:
      "Timeline scolaire, activités extra-scolaires, jalons de développement et journal parental.",
    color: "text-warm-blue bg-warm-blue/10",
  },
  {
    icon: Calculator,
    title: "Foyer fiscal",
    description:
      "Simulation IR, crédits d'impôt garde d'enfant, comparateur avant/après optimisation.",
    color: "text-warm-gold bg-warm-gold/10",
  },
  {
    icon: Wallet,
    title: "Budget intelligent",
    description:
      "Suivi des dépenses par enfant, allocations CAF, reste à charge net et coach budgétaire IA.",
    color: "text-warm-purple bg-warm-purple/10",
  },
  {
    icon: Baby,
    title: "Recherche de garde",
    description:
      "Crèches, assistantes maternelles, MAM autour de chez vous avec simulateur de coût.",
    color: "text-warm-orange bg-warm-orange/10",
  },
  {
    icon: ClipboardList,
    title: "Démarches & droits",
    description:
      "Checklist naissance → 3 ans, simulateur d'allocations, rappels d'échéances.",
    color: "text-warm-green bg-warm-green/10",
  },
];

const PLANS = [
  {
    name: "Gratuit",
    price: "0 €",
    period: "",
    description: "Pour découvrir le cockpit",
    features: [
      "1 adulte + 1 enfant",
      "5 documents",
      "Suivi vaccinations",
      "Courbes de croissance",
      "Budget manuel",
      "Alertes email",
    ],
    cta: "Commencer gratuitement",
    variant: "outline" as const,
  },
  {
    name: "Premium",
    price: "9,90 €",
    period: "/mois",
    description: "Pour les familles actives",
    popular: true,
    features: [
      "Membres illimités",
      "Documents illimités (10 Go)",
      "Open Banking (sync bancaire)",
      "Coach budgétaire IA",
      "Résumé mensuel IA",
      "Sync Google Calendar",
      "Alertes email + push",
    ],
    cta: "Essayer Premium",
    variant: "default" as const,
  },
  {
    name: "Family Pro",
    price: "19,90 €",
    period: "/mois",
    description: "Le cockpit complet",
    features: [
      "Tout Premium +",
      "Stockage 50 Go",
      "OCR ordonnances",
      "Export PDF bilan annuel",
      "Multi-foyers (grands-parents)",
      "Sync tous calendriers",
      "Alertes email + push + SMS",
      "Support prioritaire",
    ],
    cta: "Choisir Family Pro",
    variant: "outline" as const,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
              MP
            </div>
            <span className="text-lg font-serif font-bold">
              Ma Vie Parentale
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#fonctionnalites"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#tarifs"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Tarifs
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">S&apos;inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            Nouveau &mdash; Coach budgétaire IA
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-serif font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Toute la vie de famille.{" "}
            <span className="text-primary">Un seul cockpit.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Centralisez la gestion administrative, éducative, fiscale et
            budgétaire de votre foyer. Suivi vaccins, budget familial,
            simulation IR, courbes de croissance — tout en un seul endroit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Créer mon cockpit gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#fonctionnalites">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Découvrir les fonctionnalités
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Gratuit pour commencer. Aucune carte bancaire requise.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold lg:text-4xl">
              4 piliers pour gérer votre foyer
            </h2>
            <p className="mt-3 text-muted-foreground">
              Aucune solution intégrée n&apos;existe sur le marché français. Jusqu&apos;à
              aujourd&apos;hui.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md">
                <CardHeader>
                  <div
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warm-green/10 mb-6">
            <Shield className="h-8 w-8 text-warm-green" />
          </div>
          <h2 className="text-3xl font-serif font-bold">
            Vos données sont protégées
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Chiffrement de bout en bout, conformité RGPD, hébergement européen.
            Vos données de santé ne sont jamais partagées. Vous gardez le contrôle total.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-warm-green" /> Chiffrement AES-256
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-warm-green" /> Conforme RGPD
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-warm-green" /> Hébergement UE
            </span>
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-warm-green" /> Export & suppression
            </span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold lg:text-4xl">
              Des tarifs simples et transparents
            </h2>
            <p className="mt-3 text-muted-foreground">
              Commencez gratuitement. Passez à Premium quand vous êtes prêt.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.popular
                    ? "border-primary shadow-lg relative"
                    : "shadow-md"
                }
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Le plus populaire</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-warm-green shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block">
                    <Button variant={plan.variant} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-serif font-bold lg:text-4xl">
            Prêt à simplifier votre vie de famille ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Rejoignez les familles qui centralisent tout dans un seul cockpit.
            Gratuit pour démarrer.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-8 h-12 px-8 text-base">
              Créer mon cockpit gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
                  MP
                </div>
                <span className="font-serif font-bold">Ma Vie Parentale</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Le tableau de bord familial unifié pour les parents français.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#fonctionnalites" className="hover:text-foreground">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#tarifs" className="hover:text-foreground">
                    Tarifs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/mentions-legales" className="hover:text-foreground">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-foreground">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-confidentialite"
                    className="hover:text-foreground"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contact@mavieparentale.fr</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Ma Vie Parentale. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
