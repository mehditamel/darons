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
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingAnimations } from "@/components/landing/landing-animations";

export const metadata: Metadata = {
  title: "Darons — Toute ta vie de daron. Une seule app.",
  description:
    "L'app 100% gratuite pour les parents : santé, vaccins, budget, impôts, allocations CAF, démarches. 15 outils sans inscription. C'est Darons.",
  openGraph: {
    title: "Darons — Toute ta vie de daron. Une seule app.",
    description:
      "Vaccins, budget, impôts, papiers — 100% gratuit, sans piège. C'est Darons.",
    type: "website",
    url: "https://darons.app",
  },
};

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Santé & vaccins",
    description:
      "Ton gamin a ses vaccins à jour ? On vérifie. Calendrier vaccinal, courbes de croissance OMS, 20 examens obligatoires.",
    color: "text-warm-teal bg-warm-teal/10",
  },
  {
    icon: GraduationCap,
    title: "Éducation & développement",
    description:
      "Premiers mots, premiers pas — note tout. Timeline scolaire, activités, jalons de développement OMS/HAS.",
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
      "Où passe ta thune ? On te montre. Connexion bancaire automatique, catégorisation IA, coach budgétaire.",
    color: "text-warm-purple bg-warm-purple/10",
  },
  {
    icon: Baby,
    title: "Recherche de garde",
    description:
      "Crèche ou nounou ? Compare les vrais coûts après CMG et crédit d'impôt. Le reste à charge, pas le prix catalogue.",
    color: "text-warm-orange bg-warm-orange/10",
  },
  {
    icon: ClipboardList,
    title: "Démarches & droits",
    description:
      "Les papiers qui traînent ? On te rappelle avant que ce soit trop tard. Checklist naissance → 3 ans + alertes IA.",
    color: "text-warm-green bg-warm-green/10",
  },
];

const TOOLS_PREVIEW = [
  { href: "/outils/simulateur-ir", label: "Simulateur impôts" },
  { href: "/outils/simulateur-caf", label: "Allocations CAF" },
  { href: "/outils/simulateur-garde", label: "Coût de garde" },
  { href: "/outils/mes-droits", label: "Mes droits sociaux" },
  { href: "/outils/courbe-croissance", label: "Courbes croissance" },
  { href: "/outils/checklist-naissance", label: "Checklist naissance" },
  { href: "/outils/numeros-urgence", label: "Urgences" },
  { href: "/outils/conge-parental", label: "Congé parental" },
];

const COMPETITORS = [
  { feature: "Suivi santé complet", darons: true, others: "Partiel (Mon Espace Santé)" },
  { feature: "Budget intelligent + Open Banking", darons: true, others: "Payant (Bankin' 2,99€/mois)" },
  { feature: "Simulation fiscale + crédits d'impôt", darons: true, others: "Aucun concurrent" },
  { feature: "Alertes IA proactives", darons: true, others: "Aucun concurrent" },
  { feature: "Allocations CAF + droits sociaux", darons: true, others: "Basique (caf.fr)" },
  { feature: "Tout-en-un famille", darons: true, others: "Calendrier seul (FamilyWall 4,99€/mois)" },
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
            "L'app 100% gratuite qui centralise toute la vie de famille : santé, budget, impôts, papiers.",
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
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warm-orange text-white font-bold text-sm">
              D
            </div>
            <span className="text-lg font-serif font-bold">Darons</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/outils"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Outils gratuits
            </Link>
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
              <Button size="sm">C&apos;est gratuit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Floating decorative shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-10 right-[10%] h-64 w-64 rounded-full bg-warm-orange/5" />
          <div className="animate-float absolute bottom-0 left-[5%] h-48 w-48 rounded-full bg-warm-teal/5" style={{ animationDelay: "2s" }} />
          <div className="animate-float absolute top-1/2 right-[25%] h-32 w-32 rounded-full bg-warm-blue/5" style={{ animationDelay: "4s" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <LandingAnimations />

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base group">
                C&apos;est gratuit, je m&apos;inscris
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/outils">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                <Wrench className="mr-2 h-4 w-4" />
                Essayer sans s&apos;inscrire
              </Button>
            </Link>
          </div>

          {/* Tools strip */}
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <p className="text-sm text-muted-foreground mb-4">15 outils gratuits, sans inscription</p>
            <div className="flex flex-wrap justify-center gap-2">
              {TOOLS_PREVIEW.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-warm-orange/10 hover:border-warm-orange transition-colors py-1.5 px-3"
                  >
                    {tool.label}
                  </Badge>
                </Link>
              ))}
            </div>
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
              <Card key={feature.title} className="card-playful border-0 shadow-md">
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

      {/* AI Section */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warm-purple/10 mb-4">
              <Sparkles className="h-7 w-7 text-warm-purple" />
            </div>
            <h2 className="text-3xl font-serif font-bold">
              Une IA qui pense pour toi
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Darons scanne tes données chaque semaine et te prévient avant que ce soit trop tard.
              Gratuit, évidemment.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { text: "La CNI de Yasmine expire dans 47 jours", category: "Documents" },
              { text: "Le vaccin Pneumocoque dose 3 de Matis est en retard", category: "Santé" },
              { text: "Tu ne touches pas la prime d'activité (~180€/mois)", category: "Droits" },
              { text: "Inscription en PS pour septembre 2028 → c'est maintenant", category: "Scolarité" },
              { text: "Tes dépenses santé ont augmenté de 40% ce mois", category: "Budget" },
              { text: "Déclaration IR dans 23 jours → lance ta simulation", category: "Fiscal" },
            ].map((alert) => (
              <Card key={alert.text} className="card-playful">
                <CardContent className="py-4 flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0 text-xs mt-0.5">{alert.category}</Badge>
                  <p className="text-sm">{alert.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gratuit vs concurrence */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold lg:text-4xl">
              100% gratuit, pour de vrai
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pas de premium, pas de piège, pas de version bridée. Tout est gratuit, point.
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {COMPETITORS.map((row) => (
                  <div key={row.feature} className="flex items-center justify-between py-3 border-b last:border-0">
                    <span className="text-sm font-medium flex-1">{row.feature}</span>
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-1.5 text-sm text-warm-green font-semibold w-20 justify-center">
                        <Check className="w-4 h-4" /> Gratuit
                      </span>
                      <span className="text-xs text-muted-foreground w-48 text-right">
                        {row.others}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
            Tes données de santé ne sont jamais partagées.
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

      {/* Testimonials / Social proof */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Ce qu&apos;ils en disent</Badge>
            <h2 className="text-3xl font-serif font-bold lg:text-4xl">
              Des parents comme toi
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Ils utilisent Darons au quotidien. Voici pourquoi ils ne reviennent pas en arrière.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah L.",
                role: "Maman de 2 enfants (3 ans et 8 mois)",
                quote: "J'avais les vaccins dans un carnet, les papiers dans un tiroir, et le budget dans ma tête. Maintenant tout est au même endroit. Et les alertes vaccins m'ont sauvé 2 fois.",
              },
              {
                name: "Thomas D.",
                role: "Papa de jumeaux (18 mois)",
                quote: "Le simulateur d'impôts m'a fait découvrir 1 800 € de crédit d'impôt que je ne réclamais pas. En 30 secondes. L'app s'est rentabilisée avant même d'être payante.",
              },
              {
                name: "Amira & Karim B.",
                role: "Parents d'un bébé de 6 mois",
                quote: "On cherchait une crèche depuis des semaines. Avec la carte de recherche de garde, on a trouvé une micro-crèche à 10 min du boulot qu'on ne connaissait pas.",
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="bg-card">
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-serif font-bold lg:text-4xl">
            Prêt à simplifier ta vie de parent ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Rejoins les darons qui centralisent tout dans une seule app. Ou commence par essayer un outil gratuit.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-base group">
                C&apos;est gratuit, je m&apos;inscris
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/outils">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Essayer les outils
              </Button>
            </Link>
          </div>
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
                L&apos;app 100% gratuite qui centralise toute la vie de famille.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/outils" className="hover:text-foreground">
                    Outils gratuits
                  </Link>
                </li>
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
                  <Link href="/politique-confidentialite" className="hover:text-foreground">
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
