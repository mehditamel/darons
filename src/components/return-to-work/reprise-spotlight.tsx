import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RepriseSpotlight() {
  return (
    <section
      className="rounded-3xl border border-secondary/25 bg-secondary/5 p-6 sm:p-8"
      aria-labelledby="reprise-spotlight-title"
    >
      <p className="family-eyebrow">
        <BriefcaseBusiness size={16} aria-hidden="true" /> Parents salariés
      </p>
      <div className="mt-3 flex flex-wrap justify-between items-center gap-5">
        <div className="max-w-lg">
          <h2 id="reprise-spotlight-title" className="text-2xl font-serif">
            Le travail reprend. Ton organisation aussi.
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Tes horaires de garde couvrent-ils vraiment le travail et les
            trajets ? Repère les décalages et repars avec un plan daté et ton
            document pour les RH.
          </p>
        </div>
        <Button asChild className="family-button">
          <Link href="/outils/reprise-travail">
            Préparer ma reprise
            <ArrowUpRight size={16} className="ml-2" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        100% numérique · Gratuit pour tous les parents · Sans compte
      </p>
    </section>
  );
}
