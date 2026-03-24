import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Simulateur coût de garde 2025 — Crèche ou nounou ?",
  description:
    "Calculez le vrai coût de votre mode de garde après CMG et crédit d'impôt. Crèche, assistante maternelle, garde à domicile : comparez et économisez.",
  openGraph: {
    title: "Simulateur coût de garde 2025 — Darons",
    description:
      "Crèche ou nounou ? Calculez votre reste à charge réel après toutes les aides.",
  },
  alternates: {
    canonical: "https://darons.app/outils/simulateur-garde",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulateur coût de garde — Darons",
          description:
            "Calculez le vrai coût de votre mode de garde après CMG et crédit d'impôt. Crèche, assistante maternelle, garde à domicile : comparez et économisez.",
          url: "https://darons.app/outils/simulateur-garde",
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
