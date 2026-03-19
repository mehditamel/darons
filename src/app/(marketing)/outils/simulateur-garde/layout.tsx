import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur coût de garde 2025 — Crèche ou nounou ?",
  description:
    "Calculez le vrai coût de votre mode de garde après CMG et crédit d'impôt. Crèche, assistante maternelle, garde à domicile : comparez et économisez.",
  openGraph: {
    title: "Simulateur coût de garde 2025 — Darons",
    description:
      "Crèche ou nounou ? Calculez votre reste à charge réel après toutes les aides.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
