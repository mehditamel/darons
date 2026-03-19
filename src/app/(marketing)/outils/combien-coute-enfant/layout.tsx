import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Combien coûte un enfant de 0 à 18 ans ?",
  description:
    "Le coût réel d'un enfant de la naissance à 18 ans : alimentation, garde, vêtements, santé, loisirs, scolarité. Avec et sans aides. Données INSEE.",
  openGraph: {
    title: "Combien coûte un enfant ? — Darons",
    description: "Le vrai coût d'un enfant de 0 à 18 ans, aides comprises.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
