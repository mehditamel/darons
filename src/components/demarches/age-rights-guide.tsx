"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale } from "lucide-react";

const AGE_RIGHTS = [
  {
    age: "Naissance",
    rights: [
      "Déclaration de naissance obligatoire (5 jours)",
      "Rattachement Sécurité sociale",
      "Ouverture droits PAJE / allocations familiales",
      "Inscription registre d'état civil",
    ],
  },
  {
    age: "3 ans",
    rights: [
      "Instruction obligatoire (école maternelle ou instruction à domicile)",
      "Fin allocation de base PAJE",
    ],
  },
  {
    age: "6 ans",
    rights: [
      "Scolarisation obligatoire en école élémentaire",
      "Allocation de rentrée scolaire (ARS) — sous conditions",
      "Responsabilité pénale possible (discernement)",
    ],
  },
  {
    age: "11 ans",
    rights: [
      "Entrée au collège",
      "Consentement requis pour changement de nom",
    ],
  },
  {
    age: "12 ans",
    rights: [
      "Peut voyager seul en train (sous conditions SNCF)",
      "Peut ouvrir un livret jeune (avec accord parental)",
      "Carte de retrait bancaire possible",
    ],
  },
  {
    age: "13 ans",
    rights: [
      "Responsabilité pénale atténuée (sanctions éducatives)",
      "Peut travailler dans le spectacle (autorisation préfectorale)",
      "Consentement requis pour adoption",
    ],
  },
  {
    age: "14 ans",
    rights: [
      "Peut conduire un cyclomoteur (BSR / permis AM)",
      "Peut travailler pendant les vacances scolaires (max 14 jours, travaux légers)",
    ],
  },
  {
    age: "15 ans",
    rights: [
      "Apprentissage possible (contrat d'apprentissage)",
      "Conduite accompagnée (AAC) dès 15 ans",
      "Consentement sexuel (âge légal)",
    ],
  },
  {
    age: "16 ans",
    rights: [
      "Émancipation possible (demande au juge des tutelles)",
      "Peut quitter le système scolaire (fin obligation d'instruction)",
      "Recensement obligatoire (Journée Défense et Citoyenneté)",
      "Peut ouvrir un compte bancaire avec accord parental",
      "Peut travailler (contrat de travail avec autorisation parentale)",
      "Permis moto A1 (125 cm³)",
    ],
  },
  {
    age: "17 ans",
    rights: [
      "Permis de conduire (conduite accompagnée validée ou permis à 17 ans depuis 2024)",
      "Peut passer le BAFA",
    ],
  },
  {
    age: "18 ans",
    rights: [
      "Majorité civile — pleine capacité juridique",
      "Droit de vote",
      "Permis de conduire B",
      "Fin de l'autorité parentale",
      "Peut se marier sans consentement parental",
      "Fin des obligations alimentaires automatiques des parents",
      "Accès aux origines (adoption plénière)",
    ],
  },
];

export function AgeRightsGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5 text-warm-blue" />
          Droits et obligations par âge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-warm-orange before:to-warm-teal">
          {AGE_RIGHTS.map((entry) => (
            <div key={entry.age} className="relative">
              <div className="absolute -left-[1.15rem] top-1 h-3 w-3 rounded-full border-2 border-warm-teal bg-background" />
              <div className="space-y-1">
                <Badge variant="outline" className="font-semibold">
                  {entry.age}
                </Badge>
                <ul className="mt-1 space-y-0.5">
                  {entry.rights.map((right, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <span className="text-warm-teal mt-1 shrink-0">•</span>
                      {right}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
