import type { Metadata } from "next";
import { CURRENT_TAX_YEAR } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: `Simulateur impôt sur le revenu ${CURRENT_TAX_YEAR} gratuit`,
  description:
    `Calculez gratuitement votre impôt sur le revenu ${CURRENT_TAX_YEAR} (barème officiel). TMI, quotient familial, crédits d'impôt garde enfant, emploi à domicile, dons.`,
  openGraph: {
    title: `Simulateur impôt sur le revenu ${CURRENT_TAX_YEAR} — Darons`,
    description:
      `Calculez votre impôt, TMI et crédits d'impôt avec le barème ${CURRENT_TAX_YEAR}.`,
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
              name: `Comment calculer mon impôt sur le revenu ${CURRENT_TAX_YEAR} ?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Renseignez votre revenu net imposable et votre nombre de parts fiscales. Le simulateur applique le barème progressif ${CURRENT_TAX_YEAR} (0%, 11%, 30%, 41%, 45%) et calcule votre TMI, la décote si applicable, et vos crédits d'impôt (garde enfant, emploi à domicile, dons).`,
              },
            },
            {
              "@type": "Question",
              name: `Quel est le barème de l'impôt sur le revenu ${CURRENT_TAX_YEAR} ?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Le simulateur applique les cinq tranches du barème ${CURRENT_TAX_YEAR}. Le résultat est une estimation à vérifier sur impots.gouv.fr selon votre situation.`,
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
