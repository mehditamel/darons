import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Calendrier vaccinal 2025 — Vaccins obligatoires bebe",
  description:
    "Calendrier vaccinal interactif 2025. Les 9 vaccins obligatoires pour votre bebe avec dates personnalisees selon sa date de naissance. DTPCa, ROR, Hepatite B, Meningocoque C.",
  keywords: [
    "calendrier vaccinal 2025",
    "vaccins obligatoires bebe",
    "vaccination enfant france",
    "vaccin 2 mois",
    "vaccin 11 mois",
    "ROR vaccin",
    "DTPCa vaccin",
    "meningocoque C vaccin",
    "hepatite B vaccin bebe",
  ],
  openGraph: {
    title: "Calendrier vaccinal 2025 — Darons",
    description:
      "Visualisez les vaccins obligatoires avec les dates personnalisees pour votre enfant.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Quels sont les vaccins obligatoires pour un bebe en France ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Depuis 2018, 11 vaccins sont obligatoires pour les enfants : DTPCa (Diphterie-Tetanos-Polio-Coqueluche), Haemophilus influenzae b, Hepatite B, Pneumocoque, Meningocoque C, et ROR (Rougeole-Oreillons-Rubeole). Les premieres doses debutent a 2 mois.",
              },
            },
            {
              "@type": "Question",
              name: "A quel age doit-on vacciner un bebe ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Les premiers vaccins se font a 2 mois (DTPCa, Hib, Hepatite B, Pneumocoque), avec des rappels a 4 mois et 11 mois. Le Meningocoque C est administre a 5 et 12 mois. Le ROR est fait a 12 mois puis entre 16 et 18 mois.",
              },
            },
            {
              "@type": "Question",
              name: "Que se passe-t-il si un vaccin obligatoire est en retard ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Un vaccin en retard peut etre rattrape. Consultez votre pediatre pour etablir un calendrier de rattrapage adapte. L'essentiel est de completer le schema vaccinal, meme avec du retard.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
