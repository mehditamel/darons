import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur budget familial — Où passe ta thune de parent ?",
  description:
    "Fais le point sur ton budget famille. Revenus, dépenses par catégorie, reste à vivre. Visualise tout en un coup d'oeil avec des graphiques clairs.",
  openGraph: {
    title: "Simulateur budget familial — Darons",
    description: "Où passe ta thune ? Fais le bilan en 2 minutes.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
