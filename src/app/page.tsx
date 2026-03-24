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
  Star,
  Zap,
  Globe,
  Lock,
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
    color: "text-warm-teal",
    bgColor: "bg-warm-teal/10",
    gradient: "from-warm-teal/10 to-warm-teal/5",
    href: "/sante",
  },
  {
    icon: GraduationCap,
    title: "Éducation & développement",
    description:
      "Premiers mots, premiers pas — note tout. Timeline scolaire, activités, jalons de développement OMS/HAS.",
    color: "text-warm-blue",
    bgColor: "bg-warm-blue/10",
    gradient: "from-warm-blue/10 to-warm-blue/5",
    href: "/scolarite",
  },
  {
    icon: Calculator,
    title: "Foyer fiscal",
    description:
      "Tes impôts, on t'aide à payer moins. Simulation IR, crédits d'impôt, comparateur avant/après.",
    color: "text-warm-gold",
    bgColor: "bg-warm-gold/10",
    gradient: "from-warm-gold/10 to-warm-gold/5",
    href: "/fiscal",
  },
  {
    icon: Wallet,
    title: "Budget intelligent",
    description:
      "Où passe ta thune ? On te montre. Connexion bancaire automatique, catégorisation IA, coach budgétaire.",
    color: "text-warm-purple",
    bgColor: "bg-warm-purple/10",
    gradient: "from-warm-purple/10 to-warm-purple/5",
    href: "/budget",
  },
  {
    icon: Baby,
    title: "Recherche de garde",
    description:
      "Crèche ou nounou ? Compare les vrais coûts après CMG et crédit d'impôt. Le reste à charge, pas le prix catalogue.",
    color: "text-warm-orange",
    bgColor: "bg-warm-orange/10",
    gradient: "from-warm-orange/10 to-warm-orange/5",
    href: "/garde",
  },
  {
    icon: ClipboardList,
    title: "Démarches & droits",
    description:
      "Les papiers qui traînent ? On te rappelle avant que ce soit trop tard. Checklist naissance + alertes IA.",
    color: "text-warm-green",
    bgColor: "bg-warm-green/10",
    gradient: "from-warm-green/10 to-warm-green/5",
    href: "/demarches",
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
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold text-sm shadow-lg shadow-warm-orange/20 transition-transform group-hover:scale-105">
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
            <Link
              href="/blog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <a
              href="#fonctionnalites"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Fonctionnalités
            </a>
            <a
              href="#securite"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sécurité
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-lg shadow-primary/20">C&apos;est gratuit</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Floating decorative shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-10 right-[10%] h-72 w-72 rounded-full bg-gradient-to-br from-warm-orange/8 to-warm-orange/3" />
          <div className="animate-float absolute bottom-0 left-[5%] h-56 w-56 rounded-full bg-gradient-to-br from-warm-teal/8 to-warm-teal/3" style={{ animationDelay: "2s" }} />
          <div className="animate-float absolute top-1/2 right-[25%] h-40 w-40 rounded-full bg-gradient-to-br from-warm-blue/6 to-warm-blue/2" style={{ animationDelay: "4s" }} />
          <div className="animate-float absolute top-1/4 left-[15%] h-24 w-24 rounded-full bg-gradient-to-br from-warm-purple/6 to-warm-purple/2" style={{ animationDelay: "3s" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-warm-green/10 px-4 py-1.5 text-sm text-warm-green font-medium mb-8 animate-fade-in-up">
            <Zap className="h-3.5 w-3.5" />
            100% gratuit, sans piège, sans pub intrusive
          </div>

          <LandingAnimations />

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-base font-semibold group shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                C&apos;est gratuit, je m&apos;inscris
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/outils">
              <Button variant="outline" size="lg" className="h-14 px-10 text-base">
                <Wrench className="mr-2 h-4 w-4" />
                Essayer sans s&apos;inscrire
              </Button>
            </Link>
          </div>

          {/* Tools strip */}
          <div className="mt-14 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <p className="text-sm text-muted-foreground mb-4">15 outils gratuits, sans inscription</p>
            <div className="flex flex-wrap justify-center gap-2">
              {TOOLS_PREVIEW.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-warm-orange/10 hover:border-warm-orange/40 transition-all duration-200 py-1.5 px-3 hover:scale-105"
                  >
                    {tool.label}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: "6", label: "Modules complets" },
              { value: "15", label: "Outils gratuits" },
              { value: "100%", label: "Gratuit pour toujours" },
              { value: "0€", label: "Pas de premium caché" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
            <h2 className="text-3xl font-serif font-bold lg:text-4xl">
              6 piliers pour gérer ta tribu
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Aucune solution intégrée n&apos;existe sur le marché français. Jusqu&apos;à aujourd&apos;hui.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="card-playful border-0 shadow-md group overflow-hidden h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardHeader className="relative">
                    <div
                      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} ${feature.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {feature.title}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24 bg-gradient-to-b from-background to-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-warm-purple/20 to-warm-blue/20 mb-6 shadow-lg shadow-warm-purple/10">
              <Sparkles className="h-8 w-8 text-warm-purple" />
            </div>
            <h2 className="text-3xl font-serif font-bold">
              Une IA qui pense pour toi
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Darons scanne tes données chaque semaine et te prévient avant que ce soit trop tard.
              Gratuit, évidemment.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { text: "La CNI de Yasmine expire dans 47 jours", category: "Documents", color: "border-l-warm-orange", href: "/identite" },
              { text: "Le vaccin Pneumocoque dose 3 de Matis est en retard", category: "Santé", color: "border-l-warm-red", href: "/sante" },
              { text: "Tu ne touches pas la prime d'activité (~180€/mois)", category: "Droits", color: "border-l-warm-green", href: "/outils/mes-droits" },
              { text: "Inscription en PS pour septembre 2028 → c'est maintenant", category: "Scolarité", color: "border-l-warm-blue", href: "/scolarite" },
              { text: "Tes dépenses santé ont augmenté de 40% ce mois", category: "Budget", color: "border-l-warm-purple", href: "/budget" },
              { text: "Déclaration IR dans 23 jours → lance ta simulation", category: "Fiscal", color: "border-l-warm-gold", href: "/outils/simulateur-ir" },
            ].map((alert, index) => (
              <Link key={index} href={alert.href}>
                <Card className={`card-playful border-l-4 ${alert.color} group h-full`}>
                  <CardContent className="py-4 flex items-start gap-3">
                    <Badge variant="outline" className="shrink-0 text-[10px] mt-0.5">{alert.category}</Badge>
                    <p className="text-sm leading-relaxed flex-1">{alert.text}</p>
                    <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Gratuit vs concurrence */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-warm-green/30 text-warm-green">Comparatif</Badge>
            <h2 className="text-3xl font-serif font-bold lg:text-4xl">
              100% gratuit, pour de vrai
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pas de premium, pas de piège, pas de version bridée.
            </p>
          </div>
          <Card className="overflow-hidden shadow-xl">
            <div className="bg-gradient-to-r from-warm-orange/10 to-warm-teal/10 px-6 py-3 border-b">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Fonctionnalité</span>
                <div className="flex items-center gap-8">
                  <span className="text-warm-green w-20 text-center">Darons</span>
                  <span className="text-muted-foreground w-48 text-right">Concurrence</span>
                </div>
              </div>
            </div>
            <CardContent className="pt-2 pb-4">
              <div className="space-y-0">
                {COMPETITORS.map((row, index) => (
                  <div key={index} className="flex items-center justify-between py-3.5 border-b last:border-0 hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-lg">
                    <span className="text-sm font-medium flex-1">{row.feature}</span>
                    <div className="flex items-center gap-8">
                      <span className="flex items-center gap-1.5 text-sm text-warm-green font-bold w-20 justify-center">
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
      <section id="securite" className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warm-green/10 mb-6">
              <Shield className="h-8 w-8 text-warm-green" />
            </div>
            <h2 className="text-3xl font-serif font-bold">
              Tes données sont protégées
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Chiffrement de bout en bout, conformité RGPD, hébergement européen.
              Tes données de santé ne sont jamais partagées.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Lock, label: "Chiffrement AES-256", description: "Toutes tes données sont chiffrées au repos et en transit" },
              { icon: Shield, label: "Conforme RGPD", description: "Export et suppression de tes données en un clic" },
              { icon: Globe, label: "Hébergement UE", description: "Tes données restent en Europe, point final" },
              { icon: Star, label: "Zéro tracking pub", description: "Pas de Google Analytics, pas de cookies traceurs" },
            ].map((item) => (
              <Card key={item.label} className="text-center card-playful">
                <CardContent className="pt-6 pb-5">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-warm-green/10 text-warm-green mb-4">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold mb-1">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
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
                stars: 5,
              },
              {
                name: "Thomas D.",
                role: "Papa de jumeaux (18 mois)",
                quote: "Le simulateur d'impôts m'a fait découvrir 1 800 € de crédit d'impôt que je ne réclamais pas. En 30 secondes. L'app s'est rentabilisée avant même d'être payante.",
                stars: 5,
              },
              {
                name: "Amira & Karim B.",
                role: "Parents d'un bébé de 6 mois",
                quote: "On cherchait une crèche depuis des semaines. Avec la carte de recherche de garde, on a trouvé une micro-crèche à 10 min du boulot qu'on ne connaissait pas.",
                stars: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="card-playful">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warm-gold text-warm-gold" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-warm-teal to-warm-teal/70 text-white text-sm font-semibold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-warm-orange/5 via-transparent to-warm-teal/5" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white mb-8 shadow-xl shadow-warm-orange/20">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-serif font-bold lg:text-4xl">
            Prêt à simplifier ta vie de parent ?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Rejoins les darons et daronnes qui centralisent tout dans une seule app.
            Ou commence par essayer un outil gratuit.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-base font-semibold group shadow-xl shadow-primary/25">
                C&apos;est gratuit, je m&apos;inscris
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/outils">
              <Button variant="outline" size="lg" className="h-14 px-10 text-base">
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
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold text-sm shadow-lg shadow-warm-orange/20">
                  D
                </div>
                <span className="font-serif font-bold text-lg">Darons</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                L&apos;app 100% gratuite qui centralise toute la vie de famille.
                Faite par des parents, pour des parents.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/outils" className="hover:text-foreground transition-colors">
                    Outils gratuits
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <a href="#fonctionnalites" className="hover:text-foreground transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#securite" className="hover:text-foreground transition-colors">
                    Sécurité
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="hover:text-foreground transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/politique-confidentialite" className="hover:text-foreground transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:contact@darons.app" className="hover:text-foreground transition-colors">
                    contact@darons.app
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Darons. Tous droits réservés.
            </p>
            <p className="text-xs text-muted-foreground">
              Fait avec amour à Marseille
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
