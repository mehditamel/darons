import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Écrans et enfants — Recommandations par âge",
  description:
    "Combien de temps d'écran pour ton enfant ? Recommandations officielles du carnet de santé 2025, par tranche d'âge. Alternatives et conseils pratiques.",
  openGraph: {
    title: "Écrans et enfants — Darons",
    description: "Guide pratique sur le temps d'écran recommandé par âge.",
  },
  alternates: {
    canonical: "https://darons.app/outils/ecrans-enfants",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Guide écrans enfants — Darons",
          description:
            "Combien de temps d'écran pour ton enfant ? Recommandations officielles du carnet de santé 2025, par tranche d'âge. Alternatives et conseils pratiques.",
          url: "https://darons.app/outils/ecrans-enfants",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
        }}
      />
      {children}
    </>
  );
}
