import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur impôt sur le revenu 2025 gratuit",
  description:
    "Calculez gratuitement votre impôt sur le revenu 2025 (barème officiel). TMI, quotient familial, crédits d'impôt garde enfant, emploi à domicile, dons.",
  openGraph: {
    title: "Simulateur impôt sur le revenu 2025 — Ma Vie Parentale",
    description:
      "Calculez votre impôt, TMI et crédits d'impôt avec le barème 2025.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
