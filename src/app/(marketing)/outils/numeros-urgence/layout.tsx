import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Numéros d'urgence enfant — Les numéros qui sauvent",
  description:
    "SAMU, pompiers, centre antipoison, SOS Médecins, enfance en danger. Tous les numéros d'urgence pour les parents, avec appel direct en un tap.",
  openGraph: {
    title: "Numéros d'urgence enfant — Darons",
    description: "Tous les numéros d'urgence pour les parents. Appel en 1 tap.",
  },
  alternates: {
    canonical: "https://darons.app/outils/numeros-urgence",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Numéros d'urgence enfant — Darons",
          description:
            "SAMU, pompiers, centre antipoison, SOS Médecins, enfance en danger. Tous les numéros d'urgence pour les parents, avec appel direct en un tap.",
          url: "https://darons.app/outils/numeros-urgence",
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
