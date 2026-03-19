import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checklist naissance — Toutes les démarches de la grossesse à 3 ans",
  description:
    "Déclaration CAF, mairie, congé parental, vaccins, inscription crèche... La checklist complète des démarches de la grossesse aux 3 ans de ton enfant.",
  openGraph: {
    title: "Checklist naissance — Darons",
    description: "T'as pensé à tout ? La checklist complète du parent.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
