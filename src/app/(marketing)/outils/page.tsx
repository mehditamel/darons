import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolsGrid } from "@/components/outils/tools-grid";
import { AccountValue } from "@/components/landing/account-value";
import { RepriseSpotlight } from "@/components/return-to-work/reprise-spotlight";

import { TOTAL_TOOLS } from "@/lib/tools-catalog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${TOTAL_TOOLS} outils gratuits pour les parents — Sans inscription`,
  description:
    "Simulateurs impôts, allocations CAF, coût de garde, budget familial, courbes de croissance, calendrier vaccinal et plus. 100% gratuit, sans inscription.",
  openGraph: {
    title: "Outils gratuits pour parents — Darons",
    description: `${TOTAL_TOOLS} outils gratuits pour les parents : impôts, allocations, santé, budget, droits sociaux. Sans inscription.`,
  },
  alternates: {
    canonical: "https://darons.app/outils",
  },
};

export default function OutilsPage() {
  return (
    <div className="space-y-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Outils gratuits pour parents",
          description: `${TOTAL_TOOLS} simulateurs et outils gratuits pour les parents français.`,
          url: "https://darons.app/outils",
          isPartOf: {
            "@type": "WebSite",
            name: "Darons",
            url: "https://darons.app",
          },
        }}
      />

      <div className="text-center space-y-3">
        <Badge variant="outline" className="mb-2">
          100% gratuit, sans inscription
        </Badge>
        <h1 className="text-3xl font-serif font-bold">
          {TOTAL_TOOLS} outils gratuits pour les parents
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Un coût de garde à estimer, une naissance à préparer ? Trouve ici un
          coup de main pour ta question du moment, sans créer de compte.
        </p>
      </div>

      <section className="tools-purpose" aria-labelledby="tools-purpose-title">
        <div>
          <p className="family-eyebrow">Et Darons, au quotidien ?</p>
          <h2 id="tools-purpose-title">
            Un carnet pour bébé. Un relais plus simple pour toi.
          </h2>
          <p>
            Prépare les consignes du jour, reprends celles d’un ancien carnet et
            partage-les avec un proche. Il consulte le carnet sans compte et
            peut préparer un retour de garde à te transmettre. Tu gardes ses
            infos et ses documents dans ton espace.
          </p>
        </div>
        <Button asChild variant="outline" className="family-button">
          <Link href="/#quotidien">Essayer un passage de relais</Link>
        </Button>
      </section>

      <RepriseSpotlight />
      <ToolsGrid />

      <AccountValue />
    </div>
  );
}
