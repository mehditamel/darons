import Link from "next/link";
import { ArrowRight, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlanSpotlight() {
  return (
    <section
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-[2rem] border border-secondary/20 bg-secondary/5 p-6 sm:p-9 md:flex-row md:items-center md:justify-between"
      aria-label="Découvrir Mon plan Darons"
    >
      <div className="flex items-start gap-4">
        <span className="hidden rounded-2xl bg-secondary/10 p-3 text-secondary sm:block">
          <HeartHandshake size={28} aria-hidden="true" />
        </span>
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">
            Nouveau · Futurs & jeunes parents
          </p>
          <h2 className="text-2xl font-serif sm:text-3xl">
            Bébé prend de la place. Faisons-en pour vous.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Trois réponses, jusqu’à trois actions pour la semaine. Un
            responsable, une prochaine étape, un peu moins de choses à garder en
            tête.
          </p>
        </div>
      </div>
      <div className="shrink-0">
        <Button asChild className="min-h-12 rounded-full px-6">
          <Link href="/outils/plan-famille">
            Créer mon plan
            <ArrowRight size={17} className="ml-2" aria-hidden="true" />
          </Link>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground md:text-center">
          Gratuit · sans compte
        </p>
      </div>
    </section>
  );
}
