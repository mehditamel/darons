import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Simulateur de droits sociaux — Toutes tes aides en 2 minutes",
  description:
    "Allocations familiales, PAJE, CMG, APL, prime d'activité, ARS : calcule toutes les aides auxquelles tu as droit selon ta situation. Barèmes 2025.",
  openGraph: {
    title: "Mes droits sociaux — Darons",
    description: "À quoi t'as droit ? Toutes les aides en 2 minutes.",
  },
  alternates: {
    canonical: "https://darons.app/outils/mes-droits",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulateur droits sociaux — Darons",
          description:
            "Allocations familiales, PAJE, CMG, APL, prime d'activité, ARS : calcule toutes les aides auxquelles tu as droit selon ta situation. Barèmes 2025.",
          url: "https://darons.app/outils/mes-droits",
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
