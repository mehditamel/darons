import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Check } from "lucide-react";
import { RepriseWorkspace } from "@/components/return-to-work/reprise-workspace";
import "./reprise.css";

export const metadata: Metadata = {
  title: "Ma reprise Darons — Préparer son retour au travail avec bébé",
  description:
    "Parents salariés : rapprochez travail, trajets et garde. Préparez un plan daté et votre échange avec les RH. Gratuit, sans compte.",
  alternates: { canonical: "https://darons.app/outils/reprise-travail" },
};
const sources = [
  {
    href: "https://www.service-public.gouv.fr/particuliers/vosdroits/F3156",
    title: "Congé de paternité et d’accueil",
    text: "Durée, conditions et démarches : fiche pour les salariés du secteur privé.",
  },
  {
    href: "https://www.service-public.gouv.fr/particuliers/actualites/A18982",
    title: "Congé supplémentaire de naissance",
    text: "Les réponses officielles sur le dispositif entré en vigueur en 2026.",
  },
  {
    href: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32040",
    title: "Entretien de parcours professionnel",
    text: "Vérifier dans quels cas un entretien doit être proposé après un congé et sous quelles conditions.",
  },
];
export default function ReprisePage() {
  return (
    <div className="reprise">
      <header className="reprise-hero">
        <p className="reprise-kicker">
          <BriefcaseBusiness size={16} aria-hidden="true" /> Ma reprise Darons
        </p>
        <h1>
          De retour au travail.
          <br />
          <em>Avec un plan pour la vraie vie.</em>
        </h1>
        <p>
          La réunion finit à 17 h 30. La garde aussi. Et entre les deux, il y a
          le trajet. Repère ce qui coince, prépare les bons échanges et organise
          ta reprise, une étape à la fois.
        </p>
        <ul aria-label="Ce que tu prépares">
          {[
            "Un bilan de tes horaires",
            "Un parcours daté",
            "Un document pour les RH",
          ].map((item) => (
            <li key={item}>
              <Check size={16} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <span className="reprise-free">
          100% numérique · Gratuit · Sans compte
        </span>
      </header>
      <RepriseWorkspace />
      <section className="reprise-sources" aria-labelledby="sources-title">
        <p className="reprise-kicker">Les démarches, à la bonne source</p>
        <h2 id="sources-title">
          Tes droits se vérifient. Ton organisation se prépare.
        </h2>
        <p>
          Repères pour les salariés du secteur privé en France, sources
          consultées le 13 septembre 2026. Les conditions dépendent du congé, du
          statut et de la situation. Vérifie avec les RH les règles et accords
          applicables ; les dates de ton parcours sont des choix d’organisation.
        </p>
        <div className="grid gap-4 sm:grid-cols-3 mt-5">
          {sources.map((source) => (
            <a href={source.href} className="reprise-source" key={source.href}>
              <h3>
                {source.title}
                <ArrowUpRight size={16} aria-hidden="true" />
              </h3>
              <p>{source.text}</p>
              <span>Service Public</span>
            </a>
          ))}
        </div>
      </section>
      <aside className="reprise-panel flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="font-semibold">Tu accompagnes des salariés parents ?</p>
          <p className="text-sm text-muted-foreground mt-1">
            Découvre le périmètre du programme numérique pour les entreprises.
          </p>
        </div>
        <Link className="reprise-link" href="/entreprises">
          Darons au travail <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </div>
  );
}
