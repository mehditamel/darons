"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";

const FAQ_ITEMS = [
  {
    question: "À quoi sert Darons, concrètement ?",
    answer:
      "À garder les informations de ton enfant et à les retrouver quand tu en as besoin : rendez-vous, mesures, vaccins enregistrés et documents. Le Carnet de Confiance permet aussi de préparer les informations à transmettre à un proche qui garde ton enfant.",
  },
  {
    question: "Pourquoi créer un compte si les outils sont gratuits ?",
    answer:
      "Un simulateur répond à une question du moment. Le compte conserve les informations que tu ajoutes dans les modules de ton foyer et te permet de créer un Carnet de Confiance. Les essais publics ne sont pas transférés automatiquement : Mon plan Darons, par exemple, reste sur ton appareil lorsque tu actives sa sauvegarde.",
  },
  {
    question: "Comment fonctionne le Carnet de Confiance ?",
    answer:
      "Après avoir ajouté ton enfant, ouvre le Carnet de Confiance. Choisis les rubriques, ajoute tes notes et une durée de 6 heures à 7 jours. Tu obtiens un lien à partager et un PIN à transmettre séparément. Le proche consulte le carnet sans créer de compte. Le prénom et la date de naissance de l’enfant figurent dans son en-tête. Tu peux révoquer l’accès à tout moment.",
  },
  {
    question: "Je dois tout remplir avant de commencer ?",
    answer:
      "Commence par confirmer ton email, créer ton foyer et ajouter ton enfant. Tu peux ensuite préparer un seul carnet pour un prochain relais, ou enregistrer un rendez-vous. Les autres modules restent disponibles quand tu en as besoin.",
  },
  {
    question: "Bébé n’est pas encore né : je commence où ?",
    answer:
      "La checklist naissance, les simulateurs et Mon plan Darons sont accessibles sans compte pour préparer l’arrivée de bébé. Après sa naissance, tu pourras créer son profil avec sa date de naissance pour commencer son suivi dans ton espace familial.",
  },
  {
    question: "Mon ou ma partenaire peut participer ?",
    answer:
      "Tu peux inviter ton ou ta partenaire à rejoindre ton foyer avec son propre compte. Vous retrouvez les informations du même foyer selon le rôle attribué. Pour un proche qui garde ponctuellement ton enfant, le Carnet de Confiance donne un accès temporaire aux rubriques choisies.",
  },
  {
    question: "Le carnet familial est-il gratuit ?",
    answer:
      "Le compte de base et le Carnet de Confiance sont gratuits, sans carte bancaire à l’inscription. Les offres Darons+ et Family Pro sont indiquées comme à venir : elles ne sont pas encore proposées à la souscription.",
  },
  {
    question: "Est-ce le carnet de santé officiel ?",
    answer:
      "Darons est un espace d’organisation familial. Tu y retrouves les informations que tu renseignes ; il ne remplace pas le carnet de santé officiel ni les échanges avec les professionnels qui suivent ton enfant.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 px-4">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold">
            Les questions que tu te poses
          </h2>
          <p className="mt-3 text-muted-foreground">
            Ce que ton compte permet, et comment commencer.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
