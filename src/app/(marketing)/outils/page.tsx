import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolsGrid, TOTAL_TOOLS } from "@/components/outils/tools-grid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "17 outils gratuits pour les parents — Sans inscription",
  description:
    "Simulateurs impôts, allocations CAF, coût de garde, budget familial, courbes de croissance, calendrier vaccinal et plus. 100% gratuit, sans inscription.",
  openGraph: {
    title: "Outils gratuits pour parents — Darons",
    description:
      "17 outils gratuits pour les parents : impôts, allocations, santé, budget, droits sociaux. Sans inscription.",
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
        <Badge variant="outline" className="mb-2">100% gratuit, sans inscription</Badge>
        <h1 className="text-3xl font-serif font-bold">
          {TOTAL_TOOLS} outils gratuits pour les parents
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pas besoin de compte. Simule tes impôts, calcule tes aides, suis la
          croissance de ton bébé — tout est là, gratuit, sans piège.
        </p>
      </div>

      <ToolsGrid />

      <div className="text-center pt-8 border-t">
        <p className="text-muted-foreground mb-4">
          Envie de tout centraliser, recevoir des alertes et utiliser l&apos;IA ?
          C&apos;est gratuit aussi.
        </p>
        <Link href="/register">
          <Button size="lg">
            Créer mon compte gratuit
          </Button>
        </Link>
      </div>
    </div>
  );
}
