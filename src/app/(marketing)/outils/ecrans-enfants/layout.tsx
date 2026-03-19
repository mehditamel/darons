import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Écrans et enfants — Recommandations par âge",
  description:
    "Combien de temps d'écran pour ton enfant ? Recommandations officielles du carnet de santé 2025, par tranche d'âge. Alternatives et conseils pratiques.",
  openGraph: {
    title: "Écrans et enfants — Darons",
    description: "Guide pratique sur le temps d'écran recommandé par âge.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
