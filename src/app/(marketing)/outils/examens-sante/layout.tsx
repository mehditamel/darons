import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "20 examens de santé obligatoires — Calendrier par âge",
  description:
    "Les 20 examens de santé obligatoires de ton enfant, de 8 jours à 18 ans. Calendrier personnalisé, rappels, ce qui est vérifié à chaque visite.",
  openGraph: {
    title: "Examens de santé obligatoires — Darons",
    description: "Le calendrier des 20 visites obligatoires de ton enfant.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
