import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Simulateur impôt sur le revenu 2025 gratuit",
  description:
    "Calculez gratuitement votre impôt sur le revenu 2025 (barème officiel). TMI, quotient familial, crédits d'impôt garde enfant, emploi à domicile, dons.",
  openGraph: {
    title: "Simulateur impôt sur le revenu 2025 — Darons",
    description:
      "Calculez votre impôt, TMI et crédits d'impôt avec le barème 2025.",
  },
  alternates: {
    canonical: "https://darons.app/outils/simulateur-ir",
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
              name: "Comment calculer mon impôt sur le revenu 2025 ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Renseignez votre revenu net imposable et votre nombre de parts fiscales. Le simulateur applique le barème progressif 2025 (0%, 11%, 30%, 41%, 45%) et calcule votre TMI, la décote si applicable, et vos crédits d'impôt (garde enfant, emploi à domicile, dons).",
              },
            },
            {
              "@type": "Question",
              name: "Quel est le barème de l'impôt sur le revenu 2025 ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Le barème 2025 comporte 5 tranches : 0% jusqu'à 11 294€, 11% de 11 295€ à 28 797€, 30% de 28 798€ à 82 341€, 41% de 82 342€ à 177 106€, et 45% au-delà.",
              },
            },
            {
              "@type": "Question",
              name: "Combien de parts fiscales avec un enfant ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Un couple marié ou pacsé avec un enfant bénéficie de 2,5 parts fiscales (2 parts pour le couple + 0,5 part pour le premier enfant). À partir du 3e enfant, chaque enfant supplémentaire donne droit à 1 part entière.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
