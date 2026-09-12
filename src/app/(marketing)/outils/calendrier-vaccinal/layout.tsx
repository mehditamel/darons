import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendrier vaccinal 2026 — Dates indicatives pour bébé",
  description: "Les vaccinations du nourrisson avec des dates indicatives selon sa naissance, dont les méningocoques B et ACWY. Référence Santé publique France 2026.",
  alternates: { canonical: "https://darons.app/outils/calendrier-vaccinal" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
