import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Baby,
  BookOpen,
  Calculator,
  Check,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  LockKeyhole,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { FamilyDayTour } from "@/components/landing/family-day-tour";
import { FamilyReadingProgress } from "@/components/landing/family-motion";
import { FamilyHero } from "@/components/landing/family-hero";
import { FamilyReveal } from "@/components/landing/family-reveal";
import { FaqSection } from "@/components/landing/faq-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { TOTAL_TOOLS } from "@/lib/tools-catalog";
import { getAllArticles } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Darons — Toute ta vie de daron. Une seule app.",
  description: `Santé, budget, impôts et démarches : un espace pour ta famille et ${TOTAL_TOOLS} outils gratuits sans inscription.`,
  openGraph: {
    title: "Darons — Un peu plus de place pour la vie de famille",
    description:
      "Les vaccins, les papiers, le budget. Tout ce qui remplit ta tête, enfin au même endroit.",
    type: "website",
    url: "https://darons.app",
  },
};

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Santé & vaccins",
    description:
      "Vaccins, courbes de croissance, rendez-vous. Les repères de santé de tes enfants à portée de main.",
    href: "/sante",
    tone: "sage",
    label: "Pour les petits qui grandissent",
  },
  {
    icon: Wallet,
    title: "Budget intelligent",
    description:
      "Dépenses, allocations, reste à vivre. Fais le point sur le budget de ta tribu.",
    href: "/budget",
    tone: "peach",
    label: "Pour les fins de mois plus claires",
  },
  {
    icon: GraduationCap,
    title: "Éducation & développement",
    description:
      "Les premiers mots, les activités, les années d’école. Garde une trace de leurs grandes étapes.",
    href: "/scolarite",
    tone: "lavender",
    label: "Pour toutes les premières fois",
  },
  {
    icon: Calculator,
    title: "Foyer fiscal",
    description:
      "Parts, crédits d’impôt, frais de garde. Des simulations pour préparer ta déclaration.",
    href: "/fiscal",
    tone: "butter",
    label: "Pour y voir clair dans les chiffres",
  },
  {
    icon: Baby,
    title: "Recherche de garde",
    description:
      "Crèche ou nounou ? Explore les solutions et compare les coûts après aides.",
    href: "/garde",
    tone: "peach",
    label: "Pour trouver votre équilibre",
  },
  {
    icon: ClipboardList,
    title: "Démarches & droits",
    description:
      "Les papiers, les dates, les démarches. Retrouve ce qu’il faut prévoir, au bon endroit.",
    href: "/demarches",
    tone: "sage",
    label: "Pour ne plus tout garder en tête",
  },
] as const;

const TOOLS = [
  {
    title: "Combien va coûter la garde ?",
    label: "Simulateur de garde",
    href: "/outils/simulateur-garde",
    icon: Baby,
  },
  {
    title: "À quelles aides ai-je droit ?",
    label: "Simulateur allocations CAF",
    href: "/outils/simulateur-caf",
    icon: Wallet,
  },
  {
    title: "Et mes impôts, cette année ?",
    label: "Simulateur d’impôts",
    href: "/outils/simulateur-ir",
    icon: Calculator,
  },
  {
    title: "Bébé arrive. Je commence où ?",
    label: "Checklist naissance",
    href: "/outils/checklist-naissance",
    icon: Check,
  },
];

export default function LandingPage() {
  return (
    <div className="family-site min-h-screen">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Darons",
          url: "https://darons.app",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web",
          description:
            "Un espace pour organiser la vie de famille : santé, budget, impôts et papiers.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            name: "Compte gratuit",
          },
        }}
      />
      <PublicHeader />
      <FamilyReadingProgress />
      <main id="main-content" tabIndex={-1}>
        <FamilyHero />

        <section
          data-testid="stats"
          className="family-ribbon"
          aria-label="Darons en quelques repères"
        >
          <div className="family-container">
            <p>
              <strong>6</strong> piliers pour ta tribu
            </p>
            <span aria-hidden="true">✳</span>
            <p>
              <strong>{TOTAL_TOOLS}</strong> outils gratuits
            </p>
            <span aria-hidden="true">✳</span>
            <p>
              <strong>1</strong> espace pour tout retrouver
            </p>
          </div>
        </section>

        <FamilyDayTour />

        <section
          id="fonctionnalites"
          data-testid="features"
          className="family-section"
        >
          <div className="family-container">
            <FamilyReveal className="family-section-heading">
              <div>
                <p className="family-eyebrow">La famille, ça fait beaucoup.</p>
                <h2>
                  Une place pour chaque
                  <br />
                  <span className="text-secondary">petit grand sujet.</span>
                </h2>
              </div>
              <p>
                Santé, budget, école, papiers…
                <br />
                Les essentiels de votre quotidien, réunis.
              </p>
            </FamilyReveal>
            <div className="family-feature-grid">
              {FEATURES.map((feature, index) => (
                <FamilyReveal key={feature.href} delay={(index % 3) * 0.07}>
                  <Link
                    href={feature.href}
                    className={`family-feature family-tone-${feature.tone}`}
                  >
                    <div className="family-feature-top">
                      <span className="family-feature-symbol">
                        <feature.icon aria-hidden="true" className="h-6 w-6" />
                      </span>
                      <span
                        className="family-feature-number"
                        aria-hidden="true"
                      >
                        0{index + 1}
                      </span>
                    </div>
                    <p className="family-feature-label">{feature.label}</p>
                    <h3>{feature.title}</h3>
                    <p className="family-feature-description">
                      {feature.description}
                    </p>
                    <span className="family-feature-link">
                      Explorer
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </Link>
                </FamilyReveal>
              ))}
            </div>
          </div>
        </section>

        <section
          data-testid="ai-alerts"
          className="family-section family-story-section"
        >
          <FamilyReveal className="family-container family-story-grid">
            <figure className="family-story-photo">
              <Image
                src="/images/family/park.webp"
                alt="Une maman et son enfant partagent un moment au parc"
                fill
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 50vw, 94vw"
                className="object-cover"
              />
              <figcaption>Le programme ? Être ensemble.</figcaption>
            </figure>
            <div className="family-story-copy">
              <p className="family-eyebrow">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Un peu d’air dans le quotidien
              </p>
              <h2>
                Tu n’as pas à penser
                <br />
                <span className="text-secondary">à tout, tout le temps.</span>
              </h2>
              <p>
                Retrouve tes échéances et les informations de ta famille dans un
                même espace. Un point de départ pour préparer la semaine, puis
                passer à autre chose.
              </p>
              <ul className="family-checklist">
                <li>
                  <Check aria-hidden="true" />
                  Les dates à garder en vue
                </li>
                <li>
                  <Check aria-hidden="true" />
                  Les documents à retrouver facilement
                </li>
                <li>
                  <Check aria-hidden="true" />
                  Le budget à suivre à ton rythme
                </li>
              </ul>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="family-button"
              >
                <Link href="/demo">
                  Découvrir le tableau de bord
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FamilyReveal>
        </section>

        <section className="family-section">
          <div className="family-container">
            <FamilyReveal className="family-section-heading">
              <div>
                <p className="family-eyebrow">Une question, un outil.</p>
                <h2>
                  On commence
                  <br />
                  par ce qui t’aide.
                </h2>
              </div>
              <Link href="/outils" className="family-text-link">
                Les {TOTAL_TOOLS} outils gratuits
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </FamilyReveal>
            <div className="family-tools-grid">
              {TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href} className="family-tool">
                  <tool.icon
                    aria-hidden="true"
                    className="h-6 w-6 text-secondary"
                  />
                  <h3>{tool.title}</h3>
                  <span>
                    {tool.label}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Sans inscription. À ton rythme. Et gratuitement.
            </p>
          </div>
        </section>

        <section
          id="securite"
          data-testid="security"
          className="family-section family-security-section"
        >
          <FamilyReveal className="family-container family-security">
            <div className="family-security-icon">
              <LockKeyhole aria-hidden="true" className="h-8 w-8" />
            </div>
            <div>
              <p className="family-eyebrow">Votre famille. Votre espace.</p>
              <h2>La confiance fait partie de la maison.</h2>
              <p>
                Un compte personnel, des accès par foyer et des échanges en
                HTTPS. Pour comprendre comment tes données sont traitées,
                retrouve nos engagements de confidentialité.
              </p>
              <Link
                href="/politique-confidentialite"
                className="family-text-link"
              >
                Lire notre politique de confidentialité
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </FamilyReveal>
        </section>

        <section className="family-section">
          <div className="family-container">
            <FamilyReveal className="family-section-heading">
              <div>
                <p className="family-eyebrow">Le coin des parents</p>
                <h2>
                  Des repères pour
                  <br />
                  la vraie vie.
                </h2>
              </div>
              <Link href="/blog" className="family-text-link">
                Voir tous les articles
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </FamilyReveal>
            <div className="family-articles">
              {getAllArticles()
                .slice(0, 3)
                .map((article, index) => (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="family-article"
                  >
                    <div
                      className={`family-article-cover family-tone-${index === 0 ? "sage" : index === 1 ? "peach" : "lavender"}`}
                    >
                      <BookOpen aria-hidden="true" className="h-9 w-9" />
                      <span
                        className="family-article-number"
                        aria-hidden="true"
                      >
                        0{index + 1}
                      </span>
                      <span>{article.category}</span>
                    </div>
                    <div className="family-article-body">
                      <p>{article.readingTime} de lecture</p>
                      <h3>{article.title}</h3>
                      <span className="family-text-link">
                        Lire l’article
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        <PricingSection />
        <FaqSection />

        <section data-testid="cta" className="family-section">
          <FamilyReveal className="family-container">
            <div className="family-final-cta">
              <div>
                <p className="family-eyebrow">Bienvenue chez les Darons</p>
                <h2>
                  Une tribu à gérer.
                  <br />
                  <span>Et plein de vie à partager.</span>
                </h2>
                <p>
                  Fais un peu de place dans ta tête.
                  <br />
                  Ton espace familial t’attend.
                </p>
                <Button asChild size="lg" className="family-button">
                  <Link href="/register">
                    Créer mon compte gratuit
                    <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="family-final-photo">
                <Image
                  src="/images/family/reading.webp"
                  alt="Un papa et sa fille profitent d’un moment de lecture"
                  fill
                  sizes="(min-width: 768px) 360px, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </FamilyReveal>
        </section>
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-2xl">
            <NewsletterSignup />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
