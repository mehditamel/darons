import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Simulateur budget familial — Où passe ta thune de parent ?",
  description:
    "Fais le point sur ton budget famille. Revenus, dépenses par catégorie, reste à vivre. Visualise tout en un coup d'oeil avec des graphiques clairs.",
  openGraph: {
    title: "Simulateur budget familial — Darons",
    description: "Où passe ta thune ? Fais le bilan en 2 minutes.",
  },
  alternates: {
    canonical: "https://darons.app/outils/simulateur-budget",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulateur budget familial — Darons",
          description:
            "Fais le point sur ton budget famille. Revenus, dépenses par catégorie, reste à vivre. Visualise tout en un coup d'oeil avec des graphiques clairs.",
          url: "https://darons.app/outils/simulateur-budget",
          applicationCategory: "FinanceApplication",
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
