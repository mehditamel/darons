import type { Metadata } from "next";
import Link from "next/link";
import {
  HeartPulse,
  GraduationCap,
  Calculator,
  Wallet,
  Shield,
  ArrowRight,
  Check,
  Baby,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Darons — Toute ta vie de daron. Une seule app.",
  description:
    "L'app gratuite qui centralise toute la vie de famille : santé des enfants, budget du foyer, fiscalité, éducation. Vaccins, budget, impôts, papiers — c'est gratuit, c'est simple, c'est Darons.",
  openGraph: {
    title: "Darons — Toute ta vie de daron. Une seule app.",
    description:
      "Vaccins, budget, impôts, papiers — c'est gratuit, c'est simple, c'est Darons.",
    type: "website",
    url: "https://darons.app",
  },
};

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Santé & vaccins",
    description:
      "Ton gamin a ses vaccins à jour ? On vérifie. Calendrier vaccinal, courbes de croissance, RDV médicaux.",
    color: "text-warm-teal bg-warm-teal/10",
  },
  {
    icon: GraduationCap,
    title: "Éducation & développement",
    description:
      "Premiers mots, premiers pas — note tout. Timeline scolaire, activités, jalons de développement.",
    color: "text-warm-blue bg-warm-blue/10",
  },
  {
    icon: Calculator,
    title: "Foyer fiscal",
    description:
      "Tes impôts, on t'aide à payer moins. Simulation IR, crédits d'impôt, comparateur avant/après.",
    color: "text-warm-gold bg-warm-gold/10",
  },
  {
    icon: Wallet,
    title: "Budget intelligent",
    description:
      "Où passe ta thune ? On te montre. Suivi des dépenses par enfant, allocations CAF, coach budgétaire IA.",
    color: "text-warm-purple bg-warm-purple/10",
  },
  {
    icon: Baby,
    title: "Recherche de garde",
    description:
      "Crèche ou nounou ? Compare les vrais coûts. Recherche géolocalisée avec simulateur de reste à charge.",
    color: "text-warm-orange bg-warm-orange/10",
  },
  {
    icon: ClipboardList,
    title: "Démarches & droits",
    description:
      "Les papiers qui traînent ? On te rappelle. Checklist naissance → 3 ans, simulateur d'allocations.",
    color: "text-warm-green bg-warm-green/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Darons",
          url: "https://darons.app",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          description:
            "L'app gratuite qui centralise toute la vie de famille : santé, budget, impôts, papiers.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            name: "Gratuit",
          },
          publisher: {
            "@type": "Organization",
            name: "Darons",
            url: "https://darons.app",
          },
        }}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
              D
            </div>
            <span className="text-lg font-serif font-bold">
              Darons
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a
              href="#fonctionnalites"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fonctionnalités
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">C&apos;est gratuit, je m&apos;inscris</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-serif font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Toute ta vie de daron.{" "}
            <span className="text-primary">Une seule app.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Vaccins, budget, impôts, papiers — c&apos;est gratuit, c&apos;est simple,
            c&apos;est Darons.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                C&apos;est gratuit, je m&apos;inscris
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#fonctionnalites">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Découvrir les fonctionnalités
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold lg:text-4xl">
              6 piliers pour gérer ta tribu
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
            Tes données sont protégées
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Chiffrement de bout en bout, conformité RGPD, hébergement européen.
            Tes données de santé ne sont jamais partagées. Tu gardes le contrôle total.
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

      {/* Gratuit */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-serif font-bold lg:text-4xl">
            Darons est gratuit.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Pas de piège, pas de version bridée. Juste une app complète pour les parents.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-8 h-12 px-8 text-base">
              C&apos;est gratuit, je m&apos;inscris
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-serif font-bold lg:text-4xl">
            Prêt à simplifier ta vie de parent ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Rejoins les darons qui centralisent tout dans une seule app.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-8 h-12 px-8 text-base">
              C&apos;est gratuit, je m&apos;inscris
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
                  D
                </div>
                <span className="font-serif font-bold">Darons</span>
              </div>
              <p className="text-sm text-muted-foreground">
                L&apos;app gratuite qui centralise toute la vie de famille.
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
                <li>contact@darons.app</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Darons. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
