import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Courbes de croissance OMS — Poids, taille, périmètre crânien",
  description:
    "Suis la croissance de ton bébé avec les courbes OMS officielles. Poids, taille, périmètre crânien. Percentiles, âge corrigé pour les prématurés.",
  openGraph: {
    title: "Courbes de croissance OMS — Darons",
    description: "Ton bébé grandit bien ? Vérifie avec les courbes OMS.",
  },
  alternates: {
    canonical: "https://darons.app/outils/courbe-croissance",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Courbe de croissance bébé — Darons",
          description:
            "Suis la croissance de ton bébé avec les courbes OMS officielles. Poids, taille, périmètre crânien. Percentiles, âge corrigé pour les prématurés.",
          url: "https://darons.app/outils/courbe-croissance",
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
