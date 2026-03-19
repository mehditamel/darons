import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courbes de croissance OMS — Poids, taille, périmètre crânien",
  description:
    "Suis la croissance de ton bébé avec les courbes OMS officielles. Poids, taille, périmètre crânien. Percentiles, âge corrigé pour les prématurés.",
  openGraph: {
    title: "Courbes de croissance OMS — Darons",
    description: "Ton bébé grandit bien ? Vérifie avec les courbes OMS.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
