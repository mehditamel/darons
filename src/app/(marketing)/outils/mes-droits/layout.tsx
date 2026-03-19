import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur de droits sociaux — Toutes tes aides en 2 minutes",
  description:
    "Allocations familiales, PAJE, CMG, APL, prime d'activité, ARS : calcule toutes les aides auxquelles tu as droit selon ta situation. Barèmes 2025.",
  openGraph: {
    title: "Mes droits sociaux — Darons",
    description: "À quoi t'as droit ? Toutes les aides en 2 minutes.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
