import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur congé parental — Combien tu touches ?",
  description:
    "Calcule tes revenus pendant un congé parental : PreParE taux plein ou mi-temps, durée selon le nombre d'enfants, impact sur ton salaire.",
  openGraph: {
    title: "Simulateur congé parental — Darons",
    description: "Congé parental : combien tu vas toucher ? On calcule.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
