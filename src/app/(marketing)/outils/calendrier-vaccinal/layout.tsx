import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendrier vaccinal 2025 — Vaccins obligatoires bébé",
  description:
    "Calendrier vaccinal interactif 2025. Les 9 vaccins obligatoires pour votre bébé avec dates personnalisées selon sa date de naissance. DTPCa, ROR, Hépatite B, Méningocoque C.",
  openGraph: {
    title: "Calendrier vaccinal 2025 — Darons",
    description:
      "Visualisez les vaccins obligatoires avec les dates personnalisées pour votre enfant.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
