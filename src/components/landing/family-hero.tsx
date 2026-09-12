import { FamilyDepth } from "./family-motion";
import { DaronsMark } from "@/components/brand/darons-logo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Heart, MoveUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOTAL_TOOLS } from "@/lib/tools-catalog";

export function FamilyHero() {
  return (
    <section data-testid="hero" className="family-hero">
      <div className="family-container family-hero-grid">
        <div className="family-hero-copy family-enter">
          <p className="family-eyebrow">
            <span aria-hidden="true" className="family-dot" />
            Pour les darons. Et les daronnes.
          </p>
          <h1>
            Toute ta vie de parent.
            <br />
            <span className="family-hero-emphasis">
              Un peu plus légère.
              <svg
                viewBox="0 0 500 24"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M4 14Q240-4 494 10M80 22Q285 9 448 19" />
              </svg>
            </span>
          </h1>
          <p className="family-hero-description">
            Les vaccins, les papiers, le budget… Tout ce qui remplit ta tête,
            enfin au même endroit. Pour faire un peu plus de place au reste.
          </p>
          <div className="family-hero-actions">
            <Button asChild size="lg" className="family-button">
              <Link href="/register">
                C&apos;est gratuit, je m&apos;inscris
                <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="family-button"
            >
              <Link href="/demo">
                Voir la démo
                <MoveUpRight aria-hidden="true" className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="family-hero-note">
            <Check aria-hidden="true" className="h-4 w-4 text-secondary" />
            Un compte gratuit ·{" "}
            <Link href="/outils">{TOTAL_TOOLS} outils sans inscription</Link>
          </p>
        </div>
        <FamilyDepth>
          <div
            className="family-album family-enter"
            aria-label="Des petits moments de vie de famille"
          >
            <div className="family-album-aura" aria-hidden="true">
              <DaronsMark />
            </div>
            <div className="family-album-back" aria-hidden="true" />
            <figure className="family-photo-main">
              <div className="family-photo-frame">
                <Image
                  src="/images/family/breakfast.webp"
                  alt="Deux parents et leur enfant préparent un petit-déjeuner ensemble"
                  fill
                  sizes="(min-width: 1024px) 540px, (min-width: 640px) 80vw, 94vw"
                  priority
                  className="object-cover"
                />
              </div>
              <figcaption>
                <Heart aria-hidden="true" className="h-4 w-4" />
                La vraie vie, ensemble.
              </figcaption>
            </figure>
            <div className="family-album-note">
              <span className="family-note-icon">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </span>
              <span>
                Moins de choses en tête.
                <br />
                <strong>Plus de moments ensemble.</strong>
              </span>
            </div>
            <figure className="family-photo-small">
              <Image
                src="/images/family/reading.webp"
                alt="Un papa lit un album avec sa fille sur le canapé"
                width={180}
                height={225}
                sizes="(min-width: 640px) 160px, 108px"
              />
              <figcaption>Encore une histoire ?</figcaption>
            </figure>
            <span className="family-album-doodle" aria-hidden="true">
              ✳
            </span>
          </div>
        </FamilyDepth>
      </div>
      <div className="family-container family-hero-bottom">
        <span>Toute ta vie de daron. Une seule app.</span>
        <Link href="#fonctionnalites">
          On te fait visiter{" "}
          <ArrowRight aria-hidden="true" className="h-4 w-4 rotate-90" />
        </Link>
      </div>
    </section>
  );
}
