import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Simulateur congé parental — Combien tu touches ?",
  description:
    "Calcule tes revenus pendant un congé parental : PreParE taux plein ou mi-temps, durée selon le nombre d'enfants, impact sur ton salaire.",
  openGraph: {
    title: "Simulateur congé parental — Darons",
    description: "Congé parental : combien tu vas toucher ? On calcule.",
  },
  alternates: {
    canonical: "https://darons.app/outils/conge-parental",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulateur congé parental — Darons",
          description:
            "Calcule tes revenus pendant un congé parental : PreParE taux plein ou mi-temps, durée selon le nombre d'enfants, impact sur ton salaire.",
          url: "https://darons.app/outils/conge-parental",
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
