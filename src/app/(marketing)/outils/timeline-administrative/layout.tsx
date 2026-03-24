import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Timeline administrative — De la grossesse à l'école",
  description:
    "La frise chronologique de toutes les démarches de parent : grossesse, naissance, santé, CAF, scolarité. Visualise tout ce que tu dois faire et quand.",
  openGraph: {
    title: "Timeline administrative — Darons",
    description: "De la grossesse à l'école : tout ce que tu dois faire, quand.",
  },
  alternates: {
    canonical: "https://darons.app/outils/timeline-administrative",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Timeline administrative parents — Darons",
          description:
            "La frise chronologique de toutes les démarches de parent : grossesse, naissance, santé, CAF, scolarité. Visualise tout ce que tu dois faire et quand.",
          url: "https://darons.app/outils/timeline-administrative",
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
