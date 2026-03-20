/**
 * Letter and form templates for common administrative procedures.
 * Placeholders use {{PLACEHOLDER}} format for replacement.
 */
export interface LetterTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: "attestation-employeur-conge-paternite",
    title: "Attestation employeur — Congé paternité",
    category: "naissance",
    description:
      "Courrier à remettre à votre employeur pour informer de la prise du congé paternité.",
    content: `{{PRENOM}} {{NOM}}
{{ADRESSE}}
{{CODE_POSTAL}} {{VILLE}}

{{ENTREPRISE}}
{{ADRESSE_ENTREPRISE}}

Objet : Demande de congé de paternité et d'accueil de l'enfant

Madame, Monsieur,

Par la présente, je vous informe de la naissance de mon enfant {{PRENOM_ENFANT}}, né(e) le {{DATE_NAISSANCE_ENFANT}}, et vous adresse ma demande de congé de paternité et d'accueil de l'enfant conformément aux articles L.1225-35 et suivants du Code du travail.

Je souhaite bénéficier de l'intégralité de mon congé, soit :
- 3 jours de congé de naissance (obligatoires, à prendre dès la naissance)
- 4 jours de congé de paternité obligatoires (à la suite du congé de naissance)
- 21 jours de congé de paternité supplémentaires (fractionnables)

Je souhaite prendre la première période de 7 jours obligatoires à compter du {{DATE_DEBUT}}.

Pour la seconde période de 21 jours, je souhaite la prendre du {{DATE_DEBUT_2}} au {{DATE_FIN_2}}.

Vous trouverez ci-joint une copie de l'acte de naissance de l'enfant.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Fait à {{VILLE}}, le {{DATE_COURRIER}}

{{PRENOM}} {{NOM}}
Signature`,
  },
  {
    id: "demande-derogation-scolaire",
    title: "Demande de dérogation scolaire",
    category: "scolarite",
    description:
      "Courrier au Directeur Académique pour demander une dérogation de secteur scolaire.",
    content: `{{PRENOM}} {{NOM}}
{{ADRESSE}}
{{CODE_POSTAL}} {{VILLE}}

Direction des Services Départementaux
de l'Éducation Nationale
{{DEPARTEMENT}}

Objet : Demande de dérogation au périmètre scolaire — {{PRENOM_ENFANT}} {{NOM}}

Madame, Monsieur le Directeur Académique,

Je soussigné(e) {{PRENOM}} {{NOM}}, parent de {{PRENOM_ENFANT}}, né(e) le {{DATE_NAISSANCE_ENFANT}}, actuellement scolarisé(e) à {{ECOLE_ACTUELLE}}, sollicite par la présente une dérogation de secteur scolaire pour l'année {{ANNEE_SCOLAIRE}}.

Je souhaite que mon enfant soit inscrit(e) à l'école {{ECOLE_SOUHAITEE}} située {{ADRESSE_ECOLE}} pour le(s) motif(s) suivant(s) :

{{MOTIF_DEROGATION}}

Vous trouverez ci-joint les pièces justificatives suivantes :
- Justificatif de domicile
- Certificat de scolarité actuel
- {{PIECES_SUPPLEMENTAIRES}}

Dans l'attente de votre réponse, je vous prie d'agréer, Madame, Monsieur le Directeur Académique, l'expression de mes respectueuses salutations.

Fait à {{VILLE}}, le {{DATE_COURRIER}}

{{PRENOM}} {{NOM}}
Signature`,
  },
  {
    id: "courrier-caf-changement-situation",
    title: "Déclaration de changement de situation — CAF",
    category: "caf",
    description:
      "Courrier à la CAF pour signaler un changement de situation familiale.",
    content: `{{PRENOM}} {{NOM}}
N° allocataire : {{NUMERO_CAF}}
{{ADRESSE}}
{{CODE_POSTAL}} {{VILLE}}

Caisse d'Allocations Familiales
{{DEPARTEMENT}}

Objet : Déclaration de changement de situation familiale

Madame, Monsieur,

Je soussigné(e) {{PRENOM}} {{NOM}}, allocataire sous le numéro {{NUMERO_CAF}}, vous informe du changement de situation suivant :

{{TYPE_CHANGEMENT}}

Ce changement est effectif à compter du {{DATE_CHANGEMENT}}.

Vous trouverez ci-joint les justificatifs suivants :
{{LISTE_JUSTIFICATIFS}}

Je vous prie de bien vouloir prendre en compte cette modification et d'ajuster mes droits en conséquence.

Dans l'attente de votre confirmation, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Fait à {{VILLE}}, le {{DATE_COURRIER}}

{{PRENOM}} {{NOM}}
Signature`,
  },
  {
    id: "demande-place-creche",
    title: "Demande d'inscription en crèche",
    category: "garde",
    description:
      "Courrier à la mairie ou à la crèche pour demander une place.",
    content: `{{PRENOM}} {{NOM}}
{{ADRESSE}}
{{CODE_POSTAL}} {{VILLE}}

{{NOM_CRECHE_OU_MAIRIE}}
{{ADRESSE_DESTINATAIRE}}

Objet : Demande d'inscription en crèche pour {{PRENOM_ENFANT}}

Madame, Monsieur,

Nous soussignés {{PRENOM}} {{NOM}} et {{PRENOM_CONJOINT}} {{NOM_CONJOINT}}, parents de {{PRENOM_ENFANT}}, né(e) le {{DATE_NAISSANCE_ENFANT}} (ou naissance prévue le {{DATE_TERME}}), sollicitons une place en crèche à compter du {{DATE_SOUHAITEE}}.

Informations sur notre foyer :
- Adresse : {{ADRESSE}}, {{CODE_POSTAL}} {{VILLE}}
- Situation professionnelle parent 1 : {{SITUATION_PRO_1}}
- Situation professionnelle parent 2 : {{SITUATION_PRO_2}}
- Horaires de garde souhaités : {{HORAIRES_SOUHAITES}}
- Nombre d'enfants à charge : {{NB_ENFANTS}}

Nous restons disponibles pour fournir tout document complémentaire et pour un entretien si nécessaire.

Dans l'attente de votre réponse, nous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

Fait à {{VILLE}}, le {{DATE_COURRIER}}

{{PRENOM}} {{NOM}} et {{PRENOM_CONJOINT}} {{NOM_CONJOINT}}
Signature(s)`,
  },
  {
    id: "contestation-refus-allocation",
    title: "Contestation d'un refus d'allocation — CAF",
    category: "caf",
    description:
      "Recours amiable auprès de la CAF suite à un refus d'allocation.",
    content: `{{PRENOM}} {{NOM}}
N° allocataire : {{NUMERO_CAF}}
{{ADRESSE}}
{{CODE_POSTAL}} {{VILLE}}

Commission de recours amiable
Caisse d'Allocations Familiales
{{DEPARTEMENT}}

Objet : Recours amiable — Contestation de la décision du {{DATE_DECISION}}

Madame, Monsieur,

Par courrier/notification du {{DATE_DECISION}}, vous m'avez informé(e) du refus de m'accorder {{NOM_ALLOCATION}}.

Je conteste cette décision pour le(s) motif(s) suivant(s) :

{{MOTIF_CONTESTATION}}

À l'appui de ma demande, je joins les pièces suivantes :
{{LISTE_PIECES}}

Je vous prie de bien vouloir réexaminer mon dossier et de revenir sur cette décision.

Dans l'attente de votre réponse dans le délai de deux mois prévu par la réglementation, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Fait à {{VILLE}}, le {{DATE_COURRIER}}

{{PRENOM}} {{NOM}}
Signature`,
  },
];

export const TEMPLATE_CATEGORIES: Record<string, string> = {
  naissance: "Naissance",
  scolarite: "Scolarité",
  caf: "CAF / Aides",
  garde: "Garde",
  identite: "Identité",
  fiscal: "Impôts",
};
