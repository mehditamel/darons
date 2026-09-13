"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  HandHeart,
  HeartPulse,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DaronsMark } from "@/components/brand/darons-logo";
import { FamilyReveal } from "./family-reveal";
import { HandoffDemo } from "./handoff-demo";

const moments = [
  {
    id: "relais",
    icon: HandHeart,
    label: "Je passe le relais",
    time: "14:00",
    title: "Tu confies bébé. Les infos suivent.",
    detail:
      "Le doudou, les habitudes, les infos à connaître… Prépare les consignes du jour pour la nounou ou les grands-parents. Ils consultent ton carnet sans compte, puis préparent un récap à te transmettre : repas, sieste, petite anecdote. Au prochain relais, tu peux reprendre tes consignes et les actualiser.",
    task: "Un après-midi chez mamie",
    subtitle: "Le Carnet de Confiance",
    status: "Les informations que tu choisis",
    rows: [],
    note: "À chacun sa façon de prendre soin.",
    href: "/register",
    cta: "Créer le carnet de mon enfant",
  },
  {
    id: "sante",
    icon: HeartPulse,
    label: "Je prépare un RDV",
    time: "09:00",
    title: "Chez le pédiatre, tu retrouves le fil.",
    detail:
      "Le dernier vaccin ? La dernière mesure ? Retrouve ce que tu as enregistré dans l’espace santé de ton enfant. Tu prépares le rendez-vous avec son historique sous les yeux.",
    task: "Le rendez-vous de Lou",
    subtitle: "Mercredi · 09:00 · Pédiatre",
    status: "Tout est au même endroit",
    rows: [
      "Carnet de vaccination",
      "Courbe de croissance",
      "Rendez-vous enregistrés",
    ],
    note: "Et après ? Direction le parc.",
    href: "/register",
    cta: "Créer mon espace familial",
  },
  {
    id: "papiers",
    icon: FileText,
    label: "Je retrouve un papier",
    time: "18:00",
    title: "La crèche demande un papier. Tu sais où il est.",
    detail:
      "Tu as ajouté l’attestation au coffre-fort familial ? Retrouve-la depuis ton téléphone, avec les autres documents que tu y ranges. Plus besoin de fouiller tes conversations pour cette pièce-là.",
    task: "Les essentiels de la famille",
    subtitle: "Un espace pour vos documents",
    status: "Bien rangé, vite retrouvé",
    rows: [
      "Attestation d’assurance",
      "Documents d’identité",
      "Dossier d’inscription",
    ],
    note: "Ce soir, on a une histoire à lire.",
    href: "/register",
    cta: "Créer mon espace familial",
  },
] as const;

export function FamilyDayTour() {
  const reduced = useReducedMotion();
  return (
    <section
      id="quotidien"
      className="family-section family-tour-section"
      aria-labelledby="family-tour-title"
    >
      <div className="family-container">
        <FamilyReveal className="family-tour-intro">
          <p className="family-eyebrow">
            D’accord. Mais dans ma vie, ça change quoi ?
          </p>
          <h2 id="family-tour-title">
            Trois moments où tu seras
            <br />
            <em>content de l’avoir.</em>
          </h2>
          <p>
            Choisis une situation. Commence par un passage de relais, sans
            compte.
          </p>
        </FamilyReveal>
        <Tabs defaultValue="relais" className="family-tour">
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
                    <span>Dans une journée de parent.</span>
                  </span>
                  <h3>{moment.title}</h3>
                  <p>{moment.detail}</p>
                  <Link href={moment.href} className="family-tour-link">
                    {moment.cta}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
                {moment.id === "relais" ? (
                  <HandoffDemo />
                ) : (
                  <div
                    className={
                      "family-tour-scene family-tour-scene-" + moment.id
                    }
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
                )}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
