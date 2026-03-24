import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Combien coûte un enfant de 0 à 18 ans ?",
  description:
    "Le coût réel d'un enfant de la naissance à 18 ans : alimentation, garde, vêtements, santé, loisirs, scolarité. Avec et sans aides. Données INSEE.",
  openGraph: {
    title: "Combien coûte un enfant ? — Darons",
    description: "Le vrai coût d'un enfant de 0 à 18 ans, aides comprises.",
  },
  alternates: {
    canonical: "https://darons.app/outils/combien-coute-enfant",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Combien coûte un enfant — Darons",
          description:
            "Le coût réel d'un enfant de la naissance à 18 ans : alimentation, garde, vêtements, santé, loisirs, scolarité. Avec et sans aides. Données INSEE.",
          url: "https://darons.app/outils/combien-coute-enfant",
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
