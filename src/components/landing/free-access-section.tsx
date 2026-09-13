import Link from "next/link";
import { ArrowRight, Check, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FreeAccessSection() {
  return (
    <section
      id="pricing"
      className="family-section px-4"
      aria-labelledby="free-access-title"
    >
      <div className="mx-auto max-w-4xl rounded-3xl border border-secondary/25 bg-secondary/5 p-6 sm:p-12">
        <p className="family-eyebrow">
          <HeartHandshake aria-hidden="true" className="h-5 w-5" /> Gratuit pour
          toutes les familles
        </p>
        <div className="mt-5 grid items-start gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <h2
              id="free-access-title"
              className="text-3xl sm:text-4xl font-serif"
            >
              Tout Darons.
              <br />
              <span className="text-secondary">Zéro abonnement.</span>
            </h2>
            <p className="mt-5 max-w-xl text-muted-foreground leading-relaxed">
              Le carnet de ton enfant, le partage avec tes proches, les
              documents et les outils du quotidien. Toutes les fonctionnalités
              de la plateforme sont gratuites pour les parents.
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-6xl font-serif text-secondary">0 €</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Sans carte bancaire
            </p>
          </div>
        </div>
        <ul className="my-7 grid gap-3 sm:grid-cols-3 text-sm">
          {[
            "Toutes les fonctionnalités",
            "Aucun essai payant ensuite",
            "Aucune formule Premium",
          ].map((item) => (
            <li className="flex items-start gap-2" key={item}>
              <Check
                aria-hidden="true"
                className="h-4 w-4 mt-0.5 shrink-0 text-secondary"
              />
              {item}
            </li>
          ))}
        </ul>
        <Button
          asChild
          size="lg"
          className="family-button max-w-full whitespace-normal"
        >
          <Link href="/register">
            Créer mon espace gratuit
            <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        </Button>
        <div className="mt-8 border-t border-secondary/20 pt-6">
          <h3 className="font-semibold">
            Comment financer un service gratuit ?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Nous étudions des financements professionnels pour faire vivre
            Darons. Les éventuels partenariats commerciaux seront clairement
            identifiés. Les parents gardent accès gratuitement à la plateforme.
          </p>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Des limites d’usage communes, notamment pour le stockage et l’IA,
            permettent de maîtriser les coûts. Elles ne donnent pas lieu à une
            offre payante.
          </p>
        </div>
      </div>
    </section>
  );
}
