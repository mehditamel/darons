import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Syringe, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Vaccins obligatoires 2025 : le guide complet — Darons",
  description:
    "Calendrier vaccinal français 2025 : les 11 vaccins obligatoires, à quel âge, combien de doses. Tout ce que tu dois savoir en tant que parent.",
  openGraph: {
    title: "Vaccins obligatoires 2025 — Darons",
    description:
      "Le calendrier vaccinal français expliqué simplement pour les parents.",
  },
};

const VACCINES = [
  {
    name: "DTPCa",
    fullName: "Diphtérie, Tétanos, Poliomyélite, Coqueluche",
    doses: [
      { age: "2 mois", label: "1ère dose" },
      { age: "4 mois", label: "2ème dose" },
      { age: "11 mois", label: "Rappel" },
    ],
    description:
      "Le vaccin combiné le plus courant. Protège contre 4 maladies graves. La coqueluche est particulièrement dangereuse chez les nourrissons.",
    rappels: "Rappels à 6 ans (DTPCa), 11-13 ans (dTPca), puis tous les 20 ans à l'âge adulte.",
  },
  {
    name: "Haemophilus influenzae b (Hib)",
    fullName: "Méningite et infections invasives à Haemophilus",
    doses: [
      { age: "2 mois", label: "1ère dose" },
      { age: "4 mois", label: "2ème dose" },
      { age: "11 mois", label: "Rappel" },
    ],
    description:
      "Protège contre les méningites et pneumonies causées par la bactérie Haemophilus. Souvent combiné dans le même vaccin que le DTPCa (vaccin hexavalent).",
    rappels: "Pas de rappel nécessaire après le schéma initial.",
  },
  {
    name: "Hépatite B",
    fullName: "Virus de l'hépatite B",
    doses: [
      { age: "2 mois", label: "1ère dose" },
      { age: "4 mois", label: "2ème dose" },
      { age: "11 mois", label: "Rappel" },
    ],
    description:
      "L'hépatite B peut devenir chronique et causer des cirrhoses et cancers du foie. La vaccination du nourrisson offre une protection durable.",
    rappels: "Protection considérée comme acquise à vie après le schéma complet.",
  },
  {
    name: "Pneumocoque",
    fullName: "Infections invasives à pneumocoque (méningites, pneumonies)",
    doses: [
      { age: "2 mois", label: "1ère dose" },
      { age: "4 mois", label: "2ème dose" },
      { age: "11 mois", label: "Rappel" },
    ],
    description:
      "Le pneumocoque est la première cause de méningite bactérienne chez le nourrisson en France. Le vaccin protège contre les sérotypes les plus dangereux.",
    rappels: "Pas de rappel systématique après 11 mois pour les enfants en bonne santé.",
  },
  {
    name: "Méningocoque C",
    fullName: "Méningite à méningocoque de sérogroupe C",
    doses: [
      { age: "5 mois", label: "1ère dose" },
      { age: "12 mois", label: "Rappel" },
    ],
    description:
      "Les infections à méningocoque peuvent provoquer des méningites et des septicémies foudroyantes. La vaccination a permis de réduire drastiquement les cas.",
    rappels: "Pas de rappel après 12 mois. Vaccination méningocoque B recommandée en complément.",
  },
  {
    name: "ROR",
    fullName: "Rougeole, Oreillons, Rubéole",
    doses: [
      { age: "12 mois", label: "1ère dose" },
      { age: "16-18 mois", label: "2ème dose" },
    ],
    description:
      "La rougeole reste une maladie grave (pneumonies, encéphalites). Les oreillons peuvent causer une surdité. La rubéole est dangereuse pendant la grossesse. Deux doses sont nécessaires pour une protection optimale.",
    rappels: "Deux doses suffisent pour une protection à vie.",
  },
];

const FAQ = [
  {
    question: "Mon enfant peut-il recevoir plusieurs vaccins le même jour ?",
    answer:
      "Oui, c'est courant et sans danger. Le vaccin hexavalent (DTPCa + Hib + Hépatite B) est administré en une seule injection. Le pneumocoque est fait le même jour dans l'autre cuisse.",
  },
  {
    question: "Quels sont les effets secondaires les plus fréquents ?",
    answer:
      "Rougeur ou gonflement au point d'injection, fièvre modérée (38-38,5°C) pendant 24-48h, irritabilité. Ces effets sont bénins et passagers. Du paracétamol peut être donné si nécessaire.",
  },
  {
    question: "Que se passe-t-il si je suis en retard sur le calendrier ?",
    answer:
      "Il n'est jamais trop tard pour rattraper. On ne recommence pas le schéma vaccinal, on reprend là où on s'est arrêté. Parles-en à ton pédiatre pour établir un calendrier de rattrapage.",
  },
  {
    question: "Les vaccins sont-ils vraiment obligatoires ?",
    answer:
      "Oui, depuis le 1er janvier 2018, 11 vaccins sont obligatoires pour les enfants nés à partir de cette date. Ils sont exigés pour l'entrée en collectivité (crèche, école).",
  },
  {
    question: "Les vaccins sont-ils remboursés ?",
    answer:
      "Oui, les vaccins obligatoires sont remboursés à 65% par l'Assurance Maladie et le reste par la mutuelle (100% si vaccin réalisé en PMI). Pour les enfants de moins de 7 ans, l'injection elle-même peut être gratuite en PMI.",
  },
];

export default function GuideVaccinsObligatoiresPage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold sm:text-4xl">
          Vaccins obligatoires 2025
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          11 vaccins sont obligatoires pour les enfants en France.
          Voici lesquels, quand les faire, et pourquoi c&apos;est important.
        </p>
      </div>

      <Card className="bg-warm-teal/5 border-warm-teal/20">
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-warm-teal mt-0.5 shrink-0" />
          <p className="text-sm">
            <strong>Depuis janvier 2018</strong>, 11 vaccins sont obligatoires
            pour tout enfant né en France. Ils sont exigés pour l&apos;entrée en
            crèche, à l&apos;école et en centre de loisirs.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-semibold">
          Les 6 vaccins (11 valences)
        </h2>

        {VACCINES.map((vaccine, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-teal/10">
                    <Syringe className="h-5 w-5 text-warm-teal" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{vaccine.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {vaccine.fullName}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {vaccine.doses.length} dose{vaccine.doses.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{vaccine.description}</p>

              <div className="flex flex-wrap gap-2">
                {vaccine.doses.map((dose, doseIndex) => (
                  <span
                    key={doseIndex}
                    className="inline-flex items-center gap-1.5 rounded-full bg-warm-teal/10 px-3 py-1 text-xs font-medium text-warm-teal"
                  >
                    {dose.age} — {dose.label}
                  </span>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                <strong>Rappels :</strong> {vaccine.rappels}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-serif font-semibold">
          Questions fréquentes
        </h2>

        {FAQ.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-2">
              <p className="font-medium text-sm">{item.question}</p>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-warm-orange/5 border-warm-orange/20">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-5 w-5 text-warm-orange mt-0.5 shrink-0" />
          <p className="text-sm">
            <strong>Avertissement</strong> : cette page est fournie à titre
            informatif et ne se substitue pas à l&apos;avis de ton médecin ou
            pédiatre. Consulte un professionnel de santé pour toute question
            relative à la vaccination de ton enfant.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-warm-orange/5 border-warm-orange/20">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <h2 className="text-xl font-serif font-semibold">
            Suis les vaccins de ton enfant automatiquement
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Avec Darons, on te rappelle chaque vaccin au bon moment.
            Plus besoin de compter les mois sur tes doigts.
          </p>
          <Button asChild>
            <Link href="/register">
              C&apos;est gratuit, je m&apos;inscris
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
