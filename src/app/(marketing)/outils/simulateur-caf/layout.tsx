import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulateur allocations CAF 2025 — PAJE, CMG, ARS",
  description:
    "Calculez gratuitement vos allocations familiales, PAJE (prime naissance, allocation de base), CMG (complément mode de garde) et allocation de rentrée scolaire 2025.",
  openGraph: {
    title: "Simulateur allocations CAF 2025 — Darons",
    description:
      "Estimez vos droits CAF : allocations familiales, PAJE, CMG, ARS.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
