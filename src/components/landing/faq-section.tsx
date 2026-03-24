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
    question: "C'est vraiment 100% gratuit ?",
    answer:
      "Oui, à 100%. Pas de période d'essai, pas de paywall caché, pas de fonctionnalité bloquée. Tous les modules (santé, budget, fiscal, éducation) sont accessibles gratuitement. On prévoit un plan premium optionnel plus tard pour des extras (thèmes, export PDF, sync calendrier), mais le cœur de l'app restera toujours gratuit.",
  },
  {
    question: "Mes données sont-elles en sécurité ?",
    answer:
      "Tes données sont chiffrées en transit (HTTPS) et au repos (AES-256). On utilise Supabase avec des politiques de sécurité par ligne (RLS) : chaque foyer ne voit que ses propres données. Zéro tracking publicitaire, zéro Google Analytics. On utilise Plausible, un outil respectueux de la vie privée.",
  },
  {
    question: "Les données de santé de mon enfant sont protégées ?",
    answer:
      "Les données de santé sont des données sensibles au sens du RGPD (article 9). Elles sont chiffrées et stockées sur des serveurs européens. On prépare la migration vers un hébergeur certifié HDS (Hébergeur de Données de Santé) pour le lancement public. Aucune donnée de santé n'apparaît dans les logs serveur.",
  },
  {
    question: "Je peux supprimer mon compte et mes données ?",
    answer:
      "Bien sûr. Tu peux exporter toutes tes données (JSON/CSV) à tout moment depuis les paramètres, puis supprimer ton compte. La suppression entraîne l'effacement complet de toutes tes données dans un délai de 30 jours maximum, backups inclus. C'est ton droit, on le respecte.",
  },
  {
    question: "Ça marche sur mobile ?",
    answer:
      "Darons est conçu mobile-first : l'interface s'adapte parfaitement à tous les écrans. Tu peux aussi installer l'app sur ton téléphone comme une appli native (PWA) directement depuis le navigateur — pas besoin de l'App Store. Ça marche même hors ligne pour les fonctionnalités de base.",
  },
  {
    question: "Vous allez revendre mes données ?",
    answer:
      "Non. Jamais. On ne vend pas, on ne loue pas, on ne partage pas tes données avec des tiers à des fins publicitaires. Point. Les seuls sous-traitants qui accèdent à tes données sont ceux nécessaires au fonctionnement de l'app (hébergement, emails), et ils sont tous conformes au RGPD avec des DPA signés.",
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
            On répond cash, comme d&apos;hab.
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
