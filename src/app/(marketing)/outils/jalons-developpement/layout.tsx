import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Jalons de développement enfant — Motricité, langage, cognition",
  description:
    "Premiers mots, premiers pas : suis les jalons de développement de ton enfant selon les référentiels OMS et HAS. Motricité, langage, cognition, autonomie.",
  openGraph: {
    title: "Jalons de développement enfant — Darons",
    description: "Où en est ton enfant ? Les jalons OMS/HAS par âge.",
  },
  alternates: {
    canonical: "https://darons.app/outils/jalons-developpement",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Jalons de développement enfant — Darons",
          description:
            "Premiers mots, premiers pas : suis les jalons de développement de ton enfant selon les référentiels OMS et HAS. Motricité, langage, cognition, autonomie.",
          url: "https://darons.app/outils/jalons-developpement",
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
