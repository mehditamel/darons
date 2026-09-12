"use client";

import Link from "next/link";
import { ArrowRight, Check, FileText, HeartPulse, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DaronsMark } from "@/components/brand/darons-logo";
import { FamilyReveal } from "./family-reveal";

const moments = [
  {
    id: "sante",
    icon: HeartPulse,
    label: "La santé",
    time: "09:00",
    title: "Les petites victoires se préparent.",
    detail:
      "Un rendez-vous à préparer ? Les repères de santé de ton enfant restent à portée de main.",
    task: "Le rendez-vous de Lou",
    subtitle: "Mercredi · 09:00 · Pédiatre",
    status: "Tout est au même endroit",
    rows: [
      "Carnet de vaccination",
      "Courbe de croissance",
      "Questions pour le rendez-vous",
    ],
    note: "Et après ? Direction le parc.",
    href: "/outils/calendrier-vaccinal",
    cta: "Explorer le calendrier vaccinal",
  },
  {
    id: "budget",
    icon: Wallet,
    label: "Le budget",
    time: "12:30",
    title: "Les chiffres clairs. L’esprit aussi.",
    detail:
      "Fais le point sur les dépenses du foyer et les aides possibles. De quoi préparer la suite plus sereinement.",
    task: "Le budget de la tribu",
    subtitle: "Exemple de répartition mensuelle",
    status: "Une vue pour y voir clair",
    rows: ["Maison et quotidien", "Garde et activités", "Projets de famille"],
    note: "Un projet en tête ? On fait les comptes.",
    href: "/outils/simulateur-budget",
    cta: "Essayer le simulateur de budget",
  },
  {
    id: "papiers",
    icon: FileText,
    label: "Les papiers",
    time: "18:00",
    title: "Retrouvé. Avant même de chercher.",
    detail:
      "Les documents et les démarches ont leur place. Tu peux enfin passer à autre chose.",
    task: "Les essentiels de la famille",
    subtitle: "Un espace pour vos documents",
    status: "Bien rangé, vite retrouvé",
    rows: [
      "Attestation d’assurance",
      "Documents d’identité",
      "Dossier d’inscription",
    ],
    note: "Ce soir, on a une histoire à lire.",
    href: "/outils/checklist-naissance",
    cta: "Découvrir la checklist naissance",
  },
] as const;

export function FamilyDayTour() {
  const reduced = useReducedMotion();
  return (
    <section
      className="family-section family-tour-section"
      aria-labelledby="family-tour-title"
    >
      <div className="family-container">
        <FamilyReveal className="family-tour-intro">
          <p className="family-eyebrow">Le quotidien, avec un peu plus d’air</p>
          <h2 id="family-tour-title">
            Une journée bien remplie.
            <br />
            <em>Une tête un peu moins.</em>
          </h2>
          <p>Trois petits aperçus de ce que Darons peut faire pour toi.</p>
        </FamilyReveal>
        <Tabs defaultValue="sante" className="family-tour">
          <TabsList
            aria-label="Explorer une journée avec Darons"
            className="family-tour-tabs"
          >
            {moments.map((moment) => (
              <TabsTrigger
                key={moment.id}
                value={moment.id}
                className="family-tour-tab"
              >
                <moment.icon aria-hidden="true" />
                <span>{moment.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {moments.map((moment) => (
            <TabsContent
              key={moment.id}
              value={moment.id}
              className="family-tour-panel"
            >
              <motion.div
                initial={false}
                animate={
                  reduced === false
                    ? { opacity: [0.6, 1], y: [10, 0] }
                    : { opacity: 1, y: 0 }
                }
                transition={{ duration: reduced === false ? 0.4 : 0 }}
                className="family-tour-grid"
              >
                <div className="family-tour-copy">
                  <span className="family-tour-time">
                    {moment.time}
                    <span>Un moment pour souffler.</span>
                  </span>
                  <h3>{moment.title}</h3>
                  <p>{moment.detail}</p>
                  <Link href={moment.href} className="family-tour-link">
                    {moment.cta}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
                <div
                  className={"family-tour-scene family-tour-scene-" + moment.id}
                >
                  <div className="family-tour-orbit" aria-hidden="true" />
                  <div className="family-tour-card">
                    <div className="family-tour-card-top">
                      <DaronsMark />
                      <span>Votre espace familial</span>
                      <span
                        className="family-tour-card-dot"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="family-tour-card-title">
                      <span className="family-tour-icon">
                        <moment.icon aria-hidden="true" />
                      </span>
                      <div>
                        <h4>{moment.task}</h4>
                        <p>{moment.subtitle}</p>
                      </div>
                    </div>
                    {moment.id === "budget" && (
                      <div className="family-tour-bars" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                    )}
                    <ul>
                      {moment.rows.map((row, index) => (
                        <li key={row}>
                          <span className="family-tour-check">
                            <Check aria-hidden="true" />
                          </span>
                          <span>{row}</span>
                          {moment.id === "papiers" ? (
                            <FileText
                              aria-hidden="true"
                              className="family-tour-row-icon"
                            />
                          ) : (
                            <span
                              className="family-tour-row-number"
                              aria-hidden="true"
                            >
                              0{index + 1}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <p className="family-tour-status">
                      <span aria-hidden="true" />
                      {moment.status}
                    </p>
                  </div>
                  <div className="family-tour-sticker">
                    <span aria-hidden="true">✳</span>
                    <span>{moment.note}</span>
                  </div>
                  <p className="family-tour-example">
                    Aperçu illustratif · données fictives
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
