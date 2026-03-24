import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Checklist naissance — Toutes les démarches de la grossesse à 3 ans",
  description:
    "Déclaration CAF, mairie, congé parental, vaccins, inscription crèche... La checklist complète des démarches de la grossesse aux 3 ans de ton enfant.",
  openGraph: {
    title: "Checklist naissance — Darons",
    description: "T'as pensé à tout ? La checklist complète du parent.",
  },
  alternates: {
    canonical: "https://darons.app/outils/checklist-naissance",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Checklist démarches naissance — Darons",
          description:
            "Déclaration CAF, mairie, congé parental, vaccins, inscription crèche... La checklist complète des démarches de la grossesse aux 3 ans de ton enfant.",
          url: "https://darons.app/outils/checklist-naissance",
          applicationCategory: "LifestyleApplication",
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
