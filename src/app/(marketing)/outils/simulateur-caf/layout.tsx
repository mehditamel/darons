import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Simulateur allocations CAF 2025 — PAJE, CMG, ARS",
  description:
    "Calculez gratuitement vos allocations familiales, PAJE (prime naissance, allocation de base), CMG (complément mode de garde) et allocation de rentrée scolaire 2025.",
  openGraph: {
    title: "Simulateur allocations CAF 2025 — Darons",
    description:
      "Estimez vos droits CAF : allocations familiales, PAJE, CMG, ARS.",
  },
  alternates: {
    canonical: "https://darons.app/outils/simulateur-caf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulateur allocations CAF — Darons",
          description:
            "Calculez gratuitement vos allocations familiales, PAJE (prime naissance, allocation de base), CMG (complément mode de garde) et allocation de rentrée scolaire 2025.",
          url: "https://darons.app/outils/simulateur-caf",
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
