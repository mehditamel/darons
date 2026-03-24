import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "20 examens de santé obligatoires — Calendrier par âge",
  description:
    "Les 20 examens de santé obligatoires de ton enfant, de 8 jours à 18 ans. Calendrier personnalisé, rappels, ce qui est vérifié à chaque visite.",
  openGraph: {
    title: "Examens de santé obligatoires — Darons",
    description: "Le calendrier des 20 visites obligatoires de ton enfant.",
  },
  alternates: {
    canonical: "https://darons.app/outils/examens-sante",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Examens de santé obligatoires — Darons",
          description:
            "Les 20 examens de santé obligatoires de ton enfant, de 8 jours à 18 ans. Calendrier personnalisé, rappels, ce qui est vérifié à chaque visite.",
          url: "https://darons.app/outils/examens-sante",
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
