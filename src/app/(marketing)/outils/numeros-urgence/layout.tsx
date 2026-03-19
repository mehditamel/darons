import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Numéros d'urgence enfant — Les numéros qui sauvent",
  description:
    "SAMU, pompiers, centre antipoison, SOS Médecins, enfance en danger. Tous les numéros d'urgence pour les parents, avec appel direct en un tap.",
  openGraph: {
    title: "Numéros d'urgence enfant — Darons",
    description: "Tous les numéros d'urgence pour les parents. Appel en 1 tap.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
