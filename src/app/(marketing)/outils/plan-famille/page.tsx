import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sprout } from "lucide-react";
import { FamilyPlan } from "@/components/family-plan/family-plan";
import "./plan-famille.css";

export const metadata: Metadata = {
  title: "Mon plan Darons — Une semaine plus légère avec bébé",
  description:
    "Futurs et jeunes parents : créez un plan adapté à votre famille et à votre temps. Jusqu’à trois actions, un relais, un calendrier. Gratuit, sans compte.",
  alternates: { canonical: "https://darons.app/outils/plan-famille" },
  openGraph: {
    title: "Mon plan Darons — Un peu de place pour vous",
    description:
      "Trois réponses. Jusqu’à trois actions pour préparer l’arrivée de bébé, organiser les relais ou clarifier le budget.",
    url: "https://darons.app/outils/plan-famille",
  },
};

export default function FamilyPlanPage() {
  return (
    <div className="family-plan">
      <header className="plan-hero">
        <span className="plan-eyebrow">
          <Sprout size={16} aria-hidden="true" />
          Mon plan Darons
        </span>
        <h1>
          Bébé grandit.
          <br />
          <em>Gardons de la place pour vous.</em>
        </h1>
        <p>
          Une arrivée à préparer, une reprise à organiser, l’envie de souffler.
          On commence par ce qui compte pour toi, avec le temps que tu as.
        </p>
        <ul className="plan-promises" aria-label="Le principe du plan">
          {["3 réponses", "3 actions maximum", "Gratuit, sans compte"].map(
            (text) => (
              <li key={text}>
                <Check size={15} aria-hidden="true" />
                {text}
              </li>
            ),
          )}
        </ul>
      </header>
      <noscript>
        <div className="plan-workspace">
          Le plan interactif a besoin de JavaScript pour fonctionner dans ton
          navigateur. Tu peux aussi consulter les{" "}
          <Link className="text-primary underline" href="/outils">
            outils gratuits
          </Link>{" "}
          et la{" "}
          <Link
            className="text-primary underline"
            href="/outils/guide-demarches-naissance"
          >
            fiche des démarches de naissance
          </Link>
          .
        </div>
      </noscript>
      <FamilyPlan />
      <aside
        className="mt-10 border-t pt-6 text-sm leading-relaxed text-muted-foreground"
        aria-label="À propos des suggestions"
      >
        <p>
          <strong className="text-foreground">
            Un coup de main, à adapter à votre vraie vie.
          </strong>{" "}
          Les suggestions sont sélectionnées dans une liste préparée par Darons
          selon l’étape de ta famille, ta priorité et ton temps. Tu peux laisser
          une action de côté. Aucune information nominative, médicale ou
          financière n’est demandée pour créer ce plan.
        </p>
        <Link
          className="mt-4 inline-block text-primary underline underline-offset-4"
          href="/outils"
        >
          Retrouver tous les outils gratuits
        </Link>
      </aside>
    </div>
  );
}
