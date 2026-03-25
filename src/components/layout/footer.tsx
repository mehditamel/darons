import Link from "next/link";
import { CookieResetButton } from "./cookie-reset-button";

interface FooterProps {
  variant?: "full" | "compact";
}

export function Footer({ variant = "full" }: FooterProps) {
  if (variant === "compact") {
    return (
      <footer className="border-t py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
            <Link href="/outils" className="hover:text-foreground transition-colors">
              Outils gratuits
            </Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgu" className="hover:text-foreground transition-colors">
              CGU
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-foreground transition-colors">
              Confidentialité
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} Darons. Tous droits réservés.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t bg-card py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange/80 text-white font-bold text-sm shadow-lg shadow-warm-orange/20">
                D
              </div>
              <span className="font-serif font-bold text-lg">Darons</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              L'app 100% gratuite qui centralise toute la vie de famille.
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
              <li>
                <CookieResetButton />
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Outils populaires</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/outils/simulateur-ir" className="hover:text-foreground transition-colors">
                  Simulateur impôt
                </Link>
              </li>
              <li>
                <Link href="/outils/simulateur-caf" className="hover:text-foreground transition-colors">
                  Simulateur allocations CAF
                </Link>
              </li>
              <li>
                <Link href="/outils/simulateur-garde" className="hover:text-foreground transition-colors">
                  Coût de garde
                </Link>
              </li>
              <li>
                <Link href="/outils/calendrier-vaccinal" className="hover:text-foreground transition-colors">
                  Calendrier vaccinal
                </Link>
              </li>
              <li>
                <Link href="/outils/checklist-naissance" className="hover:text-foreground transition-colors">
                  Checklist naissance
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
              <li>
                <a href="mailto:dpo@darons.app" className="hover:text-foreground transition-colors">
                  DPO / RGPD
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Darons. Tous droits réservés. 100% gratuit.
          </p>
          <p className="text-xs text-muted-foreground">
            Fait avec amour à Marseille
          </p>
        </div>
      </div>
    </footer>
  );
}
