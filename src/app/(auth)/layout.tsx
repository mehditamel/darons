import { DaronsLogo } from "@/components/brand/darons-logo";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="family-auth min-h-screen">
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:p-3"
      >
        Aller au formulaire
      </a>
      <div className="family-auth-brand">
        <Link
          href="/"
          aria-label="Darons, accueil"
          className="darons-home-link"
        >
          <DaronsLogo />
        </Link>
        <div className="family-auth-story">
          <p className="family-eyebrow">
            Les petits moments font les grandes familles.
          </p>
          <h2>
            Moins de choses en tête.
            <br />
            <span className="text-secondary">Plus de place pour eux.</span>
          </h2>
          <figure>
            <div className="family-auth-photo">
              <Image
                src="/images/family/reading.webp"
                alt="Un père lit une histoire à sa fille"
                fill
                sizes="(min-width: 1024px) 420px, 1px"
                className="object-cover"
              />
            </div>
            <figcaption>
              <Heart aria-hidden="true" className="h-4 w-4" />
              Encore une page. Puis une autre.
            </figcaption>
          </figure>
          <p>
            Santé, budget, papiers : retrouve les essentiels de ta famille dans
            un espace à vous.
          </p>
        </div>
        <p className="family-auth-copyright">
          © {new Date().getFullYear()} Darons. Le quotidien des parents, mieux
          organisé.
        </p>
      </div>
      <div className="family-auth-main">
        <div className="family-auth-navigation">
          <Link href="/" className="family-text-link">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Retour à l’accueil
          </Link>
          <ThemeToggle />
        </div>
        <main id="auth-content" className="family-auth-form" tabIndex={-1}>
          <Link
            href="/"
            aria-label="Darons, accueil"
            className="inline-block family-mobile-wordmark darons-home-link mb-8"
          >
            <DaronsLogo />
          </Link>
          <div className="w-full min-w-0 [&_button]:h-auto [&_button]:min-h-11 [&_button]:whitespace-normal [&_button]:py-2">
            {children}
          </div>
        </main>
        <p className="family-auth-bottom">
          Un petit coup de main pour les grandes journées.
        </p>
      </div>
    </div>
  );
}
