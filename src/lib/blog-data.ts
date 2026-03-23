export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
  category: string;
  content: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "calendrier-vaccinal-2025",
    title: "Calendrier vaccinal 2025 : les 9 vaccins obligatoires pour votre bébé",
    description:
      "Tout savoir sur les vaccins obligatoires en France en 2025 : DTPCa, ROR, Hépatite B, Méningocoque C. Calendrier complet, rappels et conseils pratiques.",
    date: "2026-01-10",
    readingTime: "7 min",
    category: "Santé",
    content: `## Les vaccins obligatoires en France

Depuis 2018, **11 vaccins sont obligatoires** pour les enfants nés en France. Ces vaccins protègent contre des maladies graves et potentiellement mortelles.

### Le calendrier des 9 injections (0-18 mois)

Les vaccins obligatoires sont administrés selon un calendrier précis, en 9 injections principales :

**À 2 mois :**
- DTPCa (Diphtérie, Tétanos, Polio, Coqueluche) — 1ère dose
- Haemophilus influenzae b (Hib) — 1ère dose
- Hépatite B — 1ère dose
- Pneumocoque — 1ère dose

**À 4 mois :**
- DTPCa — 2e dose
- Hib — 2e dose
- Hépatite B — 2e dose
- Pneumocoque — 2e dose

**À 5 mois :**
- Méningocoque C — 1ère dose

**À 11 mois :**
- DTPCa — 3e dose (rappel)
- Hib — 3e dose (rappel)
- Hépatite B — 3e dose (rappel)
- Pneumocoque — 3e dose (rappel)

**À 12 mois :**
- ROR (Rougeole, Oreillons, Rubéole) — 1ère dose
- Méningocoque C — 2e dose

**À 16-18 mois :**
- ROR — 2e dose

### Conseils pratiques

1. **Notez chaque vaccin** dans le carnet de santé de votre enfant
2. **Anticipez les rendez-vous** : prenez RDV 1 mois à l'avance chez votre pédiatre
3. **Paracétamol** : votre médecin peut recommander du paracétamol après l'injection
4. **Effets secondaires** : fièvre légère et rougeur au point d'injection sont normaux

### Que se passe-t-il si un vaccin est en retard ?

Pas de panique ! Il n'est jamais trop tard pour rattraper un retard vaccinal. Consultez votre pédiatre qui adaptera le calendrier. L'important est de compléter le schéma vaccinal, même avec du retard.

### Suivi avec Darons

Notre outil [calendrier vaccinal interactif](/outils/calendrier-vaccinal) te permet de visualiser les dates de vaccin personnalisées pour ton enfant. Crée un compte pour recevoir des rappels automatiques.

### FAQ — Questions fréquentes

**Mon bébé est prématuré, le calendrier change-t-il ?**
Non, les vaccins suivent l'âge civil (date de naissance), pas l'âge corrigé. Un bébé né à 35 SA recevra ses premiers vaccins à 2 mois comme les autres.

**Peut-on faire plusieurs vaccins le même jour ?**
Oui, les vaccins combinés (hexavalent par exemple) permettent de protéger contre plusieurs maladies en une seule injection. C'est sûr et recommandé.

**Voir aussi :** [Les 20 examens de santé obligatoires](/blog/20-examens-sante-obligatoires-bebe) | [Checklist démarches après naissance](/blog/checklist-naissance-demarches) | [Coût d'un enfant de 0 à 18 ans](/blog/cout-enfant-0-18-ans-france)`,
  },
  {
    slug: "credit-impot-garde-enfant-2025",
    title: "Crédit d'impôt garde d'enfant : guide complet 2025",
    description:
      "Comment bénéficier du crédit d'impôt pour frais de garde d'enfant en 2025. Montants, plafonds, conditions et calcul détaillé.",
    date: "2026-01-05",
    readingTime: "5 min",
    category: "Fiscal",
    content: `## Le crédit d'impôt garde d'enfant en 2025

Si vous faites garder votre enfant de moins de 6 ans, vous pouvez bénéficier d'un **crédit d'impôt** qui réduit directement votre impôt sur le revenu.

### Conditions d'éligibilité

- Votre enfant a **moins de 6 ans** au 1er janvier de l'année d'imposition
- La garde est assurée par une crèche, une assistante maternelle agréée, ou une garde à domicile
- Vous déclarez les frais dans votre déclaration de revenus

### Montants 2025

| Élément | Montant |
|---------|---------|
| **Taux du crédit** | 50% des dépenses |
| **Plafond de dépenses** | 3 500 € par enfant |
| **Crédit maximum** | 1 750 € par enfant |

### Comment calculer ?

**Formule :** Crédit = 50% × min(dépenses réelles, 3 500 €)

**Exemple :** Vous payez 500 €/mois de crèche après déduction du CMG, soit 6 000 €/an.
- Dépenses retenues : 3 500 € (plafond)
- Crédit d'impôt : 50% × 3 500 € = **1 750 €**

### Cumul avec le CMG

Oui, le crédit d'impôt se cumule avec le Complément de libre choix du Mode de Garde (CMG) de la CAF. Les dépenses prises en compte pour le crédit d'impôt sont celles **après déduction du CMG**.

### Déclaration

Inscrivez vos frais de garde dans la case **7GA** (1er enfant) ou **7GB** (2e enfant) de votre déclaration de revenus.

### Simulez votre impôt

Utilisez notre [simulateur d'impôt gratuit](/outils/simulateur-ir) pour calculer l'impact du crédit d'impôt garde d'enfant sur votre impôt.

**Voir aussi :** [Crèche ou assistante maternelle : le vrai coût](/blog/creche-ou-assistante-maternelle-comparatif) | [5 crédits d'impôt que les parents oublient](/blog/5-credits-impot-parents-oublient) | [Quotient familial : comment ça marche](/blog/quotient-familial-comment-ca-marche)`,
  },
  {
    slug: "creche-ou-assistante-maternelle-comparatif",
    title: "Crèche ou assistante maternelle : comparatif coût réel après aides",
    description:
      "Comparaison détaillée du coût réel entre crèche et assistante maternelle après CMG et crédit d'impôt. Quel mode de garde choisir ?",
    date: "2026-01-20",
    readingTime: "6 min",
    category: "Garde",
    content: `## Crèche vs assistante maternelle : le vrai coût

Le choix du mode de garde est une décision majeure pour les jeunes parents. Au-delà des considérations pédagogiques, le **coût réel après aides** est souvent déterminant.

### Les aides qui réduisent le coût

Deux aides principales :
1. **CMG** (Complément de libre choix du Mode de Garde) — versé par la CAF
2. **Crédit d'impôt** garde enfant — récupéré lors de la déclaration d'impôts

### Comparatif pour un foyer type

**Hypothèse :** Couple, 1 enfant de 1 an, revenus 40 000 €/an

#### Crèche municipale
- Coût brut : ~600 €/mois (tarif PSU selon revenus)
- CMG : ~793 €/mois (plafonné au coût → 600 €)
- Reste après CMG : 0 €
- Crédit d'impôt : 0 € (pas de reste à charge)
- **Coût réel : ~0 €/mois**

*Note : les crèches municipales appliquent un tarif selon les revenus qui est souvent inférieur au CMG.*

#### Assistante maternelle
- Coût brut : ~800 €/mois (salaire + charges + indemnités)
- CMG tranche 2 : ~449 €/mois
- Reste après CMG : 351 €/mois
- Crédit d'impôt : ~146 €/mois (1 750 €/an ÷ 12)
- **Coût réel : ~205 €/mois**

#### Garde à domicile
- Coût brut : ~1 500 €/mois
- CMG tranche 2 : ~795 €/mois
- Reste après CMG : 705 €/mois
- Crédit d'impôt : ~146 €/mois
- **Coût réel : ~559 €/mois**

### Critères au-delà du coût

| Critère | Crèche | Assistante maternelle |
|---------|--------|----------------------|
| **Disponibilité** | Liste d'attente longue | Plus facile à trouver |
| **Horaires** | Fixes (7h-19h) | Plus flexibles |
| **Socialisation** | Groupe d'enfants | Petit groupe (4 max) |
| **Suivi individuel** | Moins personnalisé | Plus personnalisé |
| **Continuité** | Équipe rotative | Même personne |
| **En cas de maladie** | Enfant gardé (sauf fièvre) | Variable |

### Simulez votre coût

Utilisez notre [simulateur de coût de garde](/outils/simulateur-caf) pour calculer le reste à charge exact selon votre situation.`,
  },
  {
    slug: "checklist-naissance-demarches",
    title: "Checklist naissance : 15 démarches à ne pas oublier",
    description:
      "De la déclaration de naissance à l'inscription en crèche, voici les 15 démarches administratives essentielles à effectuer après la naissance de votre enfant.",
    date: "2026-01-20",
    readingTime: "8 min",
    category: "Démarches",
    content: `## Les démarches après la naissance : le guide complet

L'arrivée d'un bébé est un moment de bonheur intense, mais aussi le début d'un marathon administratif. Voici les **15 démarches essentielles** à effectuer, classées par ordre chronologique.

### Dans les 5 jours suivant la naissance

**1. Déclaration de naissance à la mairie**
Obligatoire dans les **5 jours ouvrables**. Se rendre à la mairie du lieu de naissance avec :
- Le certificat médical d'accouchement
- Le livret de famille (si existant)
- Les pièces d'identité des parents

**2. Choix du prénom**
Le prénom est déclaré lors de la déclaration de naissance. Le choix est libre mais l'officier d'état civil peut signaler au procureur un prénom contraire à l'intérêt de l'enfant.

### Dans le premier mois

**3. Déclaration à la CAF**
Déclarez la naissance sur caf.fr ou via l'application mobile. Cette démarche ouvre les droits à :
- L'allocation de base PAJE (184,81 €/mois sous conditions)
- La prime à la naissance (1 019,40 €)

**4. Mise à jour du livret de famille**
La mairie vous remet un livret de famille (premier enfant) ou le met à jour.

**5. Rattachement à la Sécurité sociale**
Demandez le rattachement de votre enfant auprès de votre CPAM. Le numéro de Sécurité sociale provisoire est attribué automatiquement.

**6. Déclaration à la mutuelle**
Ajoutez votre enfant comme ayant droit sur votre complémentaire santé.

### Dans les 3 premiers mois

**7. Inscription en crèche ou chez une assistante maternelle**
Les listes d'attente sont longues. Plus tôt vous inscrivez, mieux c'est. Pensez à contacter :
- La mairie (crèches municipales)
- Le RAM/RPE (relais petite enfance) pour les assistantes maternelles

**8. Demande de CMG (Complément Mode de Garde)**
Si vous faites garder votre enfant, demandez le CMG sur caf.fr. Le montant varie selon vos revenus et le mode de garde.

**9. Congé paternité**
25 jours calendaires (+ 3 jours de naissance). À prendre dans les **6 mois** suivant la naissance. Prévenir l'employeur 1 mois avant.

**10. Ouverture d'un compte / livret A**
Vous pouvez ouvrir un Livret A au nom de votre enfant dès sa naissance (plafond 22 950 €).

### Dans les 6 premiers mois

**11. Premiers vaccins (2 mois)**
DTPCa, Hib, Hépatite B, Pneumocoque : les premiers vaccins obligatoires sont à **2 mois**. Prenez rendez-vous chez votre pédiatre.

**12. Déclaration de revenus — mise à jour**
Signalez le changement de situation familiale (naissance) sur impots.gouv.fr pour ajuster votre taux de prélèvement à la source.

**13. Assurance habitation**
Vérifiez que votre contrat couvre bien votre enfant (responsabilité civile).

### Avant le premier anniversaire

**14. Inscription sur les listes électorales** (automatique)
Votre enfant sera automatiquement inscrit à sa majorité si vous avez déclaré sa naissance.

**15. Passeport / CNI (si voyage prévu)**
Si vous prévoyez un voyage, pensez à faire le passeport ou la CNI de votre enfant. Délai : 2 à 6 semaines selon les mairies.

### Simplifiez vos démarches

Notre module [Démarches & droits](/demarches) génère automatiquement votre checklist personnalisée avec des rappels par email. [Créez votre compte gratuitement](/register) pour ne rien oublier.`,
  },
  {
    slug: "simulateur-allocations-caf-2025",
    title: "Simulateur allocations CAF 2025 : PAJE, CMG, APL — tous vos droits",
    description:
      "Calculez vos droits aux allocations CAF en 2025 : PAJE, prime naissance, CMG, APL, prime d'activité. Barèmes à jour et simulateur gratuit.",
    date: "2026-02-10",
    readingTime: "6 min",
    category: "Budget",
    content: `## Allocations CAF 2025 : tout ce que vous devez savoir

En tant que jeune parent, vous avez droit à de nombreuses aides de la CAF. Voici un récapitulatif complet des allocations disponibles en 2025.

### 1. La PAJE (Prestation d'Accueil du Jeune Enfant)

La PAJE comprend plusieurs composantes :

**Prime à la naissance**
- Montant : **1 019,40 €** (versée au 7e mois de grossesse)
- Conditions : revenus inférieurs aux plafonds (ex : 34 963 € pour un couple avec 1 revenu)

**Allocation de base**
- Montant : **184,81 €/mois** (taux plein) ou **92,40 €/mois** (taux partiel)
- Durée : de la naissance aux 3 ans de l'enfant
- Conditions de ressources

### 2. Le CMG (Complément de libre choix du Mode de Garde)

Le CMG rembourse une partie des frais de garde :

| Revenus annuels (couple) | Enfant < 3 ans | Enfant 3-6 ans |
|--------------------------|----------------|----------------|
| < 22 246 € | 506,79 €/mois | 253,40 €/mois |
| 22 246 — 49 435 € | 320,04 €/mois | 160,02 €/mois |
| > 49 435 € | 192,10 €/mois | 96,05 €/mois |

*Montants pour une assistante maternelle. Montants différents pour garde à domicile.*

### 3. Les allocations familiales

À partir du **2e enfant** :

| Nombre d'enfants | Montant mensuel |
|-------------------|-----------------|
| 2 enfants | 141,99 € |
| 3 enfants | 323,91 € |
| Par enfant supplémentaire | +181,92 € |

### 4. L'APL / ALF

Si vous êtes locataire, l'arrivée d'un enfant peut modifier vos droits à l'aide au logement. Faites une simulation sur caf.fr après chaque changement de situation.

### 5. La prime d'activité

Si vous travaillez avec des revenus modestes, la prime d'activité est revalorisée avec l'ajout d'un enfant à charge.

### Simulez vos droits

Utilisez notre [simulateur CAF gratuit](/outils/simulateur-caf) pour calculer précisément vos droits selon votre situation familiale et vos revenus.

### Erreurs fréquentes à éviter

1. **Ne pas déclarer la naissance à la CAF** — Faites-le dans le mois suivant la naissance
2. **Oublier le CMG** — Vous pouvez le demander même si vous utilisez une crèche
3. **Ne pas actualiser vos revenus** — Si vos revenus ont baissé, demandez une réévaluation
4. **Ignorer le cumul** — PAJE + CMG + Crédit d'impôt sont cumulables

### Suivi automatisé

Avec Darons, suis automatiquement tes allocations et reçois des alertes quand de nouveaux droits s'ouvrent pour ta famille. [Crée ton compte](/register).`,
  },
  {
    slug: "passeport-bebe-comment-faire",
    title: "Quand et comment faire le passeport de bébé : guide pratique",
    description:
      "Tout savoir pour obtenir le passeport de votre bébé : documents nécessaires, délais, coût, photo, et astuces pour simplifier la démarche.",
    date: "2026-02-25",
    readingTime: "5 min",
    category: "Identité",
    content: `## Passeport bébé : le guide complet

Vous prévoyez un voyage en famille hors de l'UE ? Votre bébé a besoin de son propre passeport, quel que soit son âge. Voici tout ce qu'il faut savoir.

### Quand faire le passeport ?

- **Dès la naissance** : un bébé peut avoir son passeport à tout âge
- **Anticipez** : comptez **2 à 6 semaines** de délai (variable selon les mairies et la saison)
- **En été** : les délais s'allongent considérablement (jusqu'à 8 semaines). Prévoyez 3 mois avant le voyage

### Documents nécessaires

Pour une première demande de passeport biométrique pour un mineur :

1. **Formulaire Cerfa n°12100*02** — Pré-remplissage en ligne sur service-public.fr
2. **Photo d'identité** conforme (voir section ci-dessous)
3. **Justificatif de domicile** de moins de 6 mois
4. **Acte de naissance** de moins de 3 mois (ou livret de famille)
5. **Pièce d'identité du parent** qui fait la demande
6. **Timbre fiscal** : gratuit pour les mineurs de moins de 15 ans (première demande)

### La photo d'identité de bébé

C'est souvent le plus difficile ! Conseils :

- **Fond blanc ou gris clair** uni
- **Bébé face à l'objectif**, bouche fermée, yeux ouverts
- **Pas de bonnet, sucette, ni jouet** visible
- Allongez bébé sur un drap blanc et prenez la photo par-dessus
- Certains photographes professionnels sont équipés pour les nourrissons
- Les cabines photo sont possibles mais plus compliquées avec un nourrisson

### Coût

| Âge | Première demande | Renouvellement |
|-----|-----------------|----------------|
| Moins de 15 ans | **Gratuit** | 17 € (timbre fiscal) |
| 15-17 ans | 17 € | 17 € |

### Validité

- **Moins de 18 ans** : le passeport est valable **5 ans**
- La photo ne sera plus ressemblante après quelques mois — c'est normal et accepté aux frontières

### Procédure étape par étape

1. **Pré-demande en ligne** sur service-public.fr → récupérez votre numéro de pré-demande
2. **Prenez rendez-vous** dans une mairie équipée de stations biométriques (toutes les mairies ne le sont pas)
3. **Présentez-vous avec bébé** et tous les documents
4. **Empreintes digitales** : non requises pour les enfants de moins de 12 ans
5. **Récupérez le passeport** dans la même mairie (notification par SMS)

### Conseils pratiques

- Vérifiez que le nom sur le passeport correspond exactement à celui du billet d'avion
- Certains pays exigent une validité de 6 mois après la date de retour
- Gardez une copie numérique du passeport dans votre [coffre-fort numérique](/documents)

### Gérez vos documents avec nous

Notre module [Identité & documents](/identite) vous envoie des **alertes automatiques** avant l'expiration des pièces d'identité. Plus jamais de passeport expiré avant un voyage !`,
  },
  {
    slug: "budget-bebe-premiere-annee",
    title: "Budget bébé première année : combien ça coûte vraiment",
    description:
      "Détail complet du budget pour la première année de bébé : couches, lait, garde, vêtements, équipement. Coûts réels et astuces pour économiser.",
    date: "2026-03-05",
    readingTime: "7 min",
    category: "Budget",
    content: `## Combien coûte un bébé la première année ?

La première année de bébé représente un budget significatif. Voici une estimation réaliste basée sur les prix 2025 en France.

### Vue d'ensemble

| Poste | Coût mensuel moyen | Coût annuel |
|-------|-------------------|-------------|
| **Alimentation** | 100-200 € | 1 200-2 400 € |
| **Couches & hygiène** | 60-100 € | 720-1 200 € |
| **Garde** | 0-800 € | 0-9 600 € |
| **Vêtements** | 30-80 € | 360-960 € |
| **Santé** | 20-50 € | 240-600 € |
| **Équipement** (amorti) | 50-100 € | 600-1 200 € |
| **Loisirs** | 20-50 € | 240-600 € |
| **TOTAL** | **280-1 380 €** | **3 360-16 560 €** |

*La fourchette est large car le mode de garde est le premier poste de dépense et varie énormément.*

### Détail par poste

#### Alimentation (100-200 €/mois)

**Allaitement maternel** : quasi-gratuit (coussinets, tire-lait : ~20 €/mois)
**Lait infantile** : 80-150 €/mois (6-8 boîtes à 15-20 €)
**Diversification alimentaire (à partir de 4-6 mois)** : 50-100 €/mois

*Astuce : les petits pots maison reviennent 2 à 3 fois moins cher que les industriels.*

#### Couches & hygiène (60-100 €/mois)

- **Couches jetables** : 40-70 €/mois (~6 couches/jour × 0,25 €)
- **Lingettes, crèmes, savon** : 15-25 €/mois
- **Couches lavables** : investissement initial ~300-500 € puis ~15 €/mois (lessive)

*Astuce : les couches lavables sont rentabilisées en 6-8 mois et réutilisables pour le deuxième enfant.*

#### Garde (0-800 €/mois après aides)

Le poste le plus variable :
- **Congé parental** : 0 € mais perte de revenus
- **Crèche municipale** : souvent ~0 € de reste à charge (après CMG)
- **Assistante maternelle** : ~200 €/mois de reste à charge (après CMG + crédit d'impôt)
- **Garde à domicile** : ~500 €/mois de reste à charge

*Utilisez notre [simulateur de coût de garde](/outils/simulateur-caf) pour calculer votre reste à charge exact.*

#### Équipement de départ (~600-1 200 €)

| Équipement | Neuf | Occasion |
|------------|------|----------|
| Poussette | 300-800 € | 100-300 € |
| Lit bébé + matelas | 150-400 € | 50-150 € |
| Siège auto | 100-300 € | Déconseillé (sécurité) |
| Chaise haute | 50-200 € | 20-80 € |
| Baignoire bébé | 15-40 € | 5-15 € |
| Transat / balancelle | 30-150 € | 15-50 € |

*Astuce : achetez d'occasion sur Vinted, LeBonCoin ou dans les bourses aux puéricultures. Exception : le siège auto doit être neuf (normes de sécurité).*

### Les aides qui réduisent la facture

| Aide | Montant | Conditions |
|------|---------|------------|
| **Prime naissance PAJE** | 1 019 € (one shot) | Sous conditions de revenus |
| **Allocation de base PAJE** | 184 €/mois pendant 3 ans | Sous conditions de revenus |
| **CMG** | 192-507 €/mois | Selon revenus et mode de garde |
| **Crédit d'impôt garde** | Jusqu'à 1 750 €/an | Enfant < 6 ans |

### Budget net réel (exemple type)

**Couple, 1 enfant, revenus 45 000 €/an, crèche municipale :**

| | Brut | Aides | Net |
|--|------|-------|-----|
| Mensuel | ~600 € | ~350 € | **~250 €/mois** |
| Annuel | ~7 200 € | ~4 200 € | **~3 000 €/an** |

### Suivez votre budget bébé

Notre module [Budget familial](/budget) ventile automatiquement vos dépenses par enfant et par catégorie. Connectez votre banque pour un suivi en temps réel. [Crée ton compte gratuitement](/register).`,
  },
  {
    slug: "quotient-familial-comment-ca-marche",
    title: "Quotient familial : comment ça marche et comment l'optimiser",
    description:
      "Comprendre le quotient familial, le calcul des parts fiscales, et les stratégies pour optimiser votre imposition en famille.",
    date: "2026-03-05",
    readingTime: "6 min",
    category: "Fiscal",
    content: `## Le quotient familial expliqué simplement

Le quotient familial (QF) est le mécanisme qui adapte votre impôt sur le revenu à la taille de votre famille. Plus vous avez d'enfants, plus votre impôt baisse. Voici comment ça marche concrètement.

### Comment sont calculées les parts ?

Le système fiscal français attribue des **parts** à chaque foyer :

| Situation | Nombre de parts |
|-----------|----------------|
| Célibataire | 1 |
| Couple marié/pacsé | 2 |
| + 1er enfant | +0,5 |
| + 2e enfant | +0,5 |
| + 3e enfant et suivants | +1 chacun |

**Exemple :** Un couple avec 1 enfant = **2,5 parts**. Avec 3 enfants = **4 parts**.

### Le calcul de l'impôt avec le QF

1. On divise le revenu net imposable par le nombre de parts
2. On applique le barème progressif à ce résultat
3. On multiplie l'impôt obtenu par le nombre de parts

**Exemple concret :** Couple, 2,5 parts, 60 000 € de revenu net imposable.
- Revenu par part : 60 000 / 2,5 = 24 000 €
- Impôt par part : 0 % sur les 11 294 premiers € + 11 % sur le reste = **1 397 €**
- Impôt total : 1 397 × 2,5 = **3 493 €**

Sans l'enfant (2 parts) : 60 000 / 2 = 30 000 € par part → impôt total = **5 170 €**

**Économie grâce au QF : 1 677 €/an**

### Le plafonnement du quotient familial

Attention : l'avantage fiscal par demi-part est **plafonné** à **1 759 €** (barème 2025). Au-delà, l'avantage est limité. Ce plafond concerne surtout les revenus élevés.

### Comment optimiser ?

1. **Déclarez tous vos enfants à charge** — même les enfants majeurs étudiants (< 25 ans) peuvent être rattachés
2. **Choisissez le bon régime** — imposition commune vs séparée, faites la simulation
3. **Cumulez avec les crédits d'impôt** — garde d'enfant, emploi à domicile, dons
4. **Anticipez les changements** — naissance, divorce, enfant qui quitte le foyer

### Simulez votre impôt

Notre [simulateur d'impôt gratuit](/outils/simulateur-ir) calcule automatiquement votre quotient familial et vos économies. Essaie-le en 30 secondes.`,
  },
  {
    slug: "5-credits-impot-parents-oublient",
    title: "5 crédits d'impôt que les parents oublient systématiquement",
    description:
      "Garde d'enfant, emploi à domicile, dons, frais de scolarité... 5 avantages fiscaux méconnus qui peuvent vous faire économiser des milliers d'euros.",
    date: "2026-03-10",
    readingTime: "5 min",
    category: "Fiscal",
    content: `## Ces crédits d'impôt que tu laisses filer

Chaque année, des milliers de parents passent à côté d'avantages fiscaux auxquels ils ont droit. Voici les 5 plus fréquemment oubliés.

### 1. Crédit d'impôt garde d'enfant (max 1 750 €)

Si ton enfant a **moins de 6 ans** et est gardé en crèche, chez une assistante maternelle ou une garde à domicile :
- **50 %** des dépenses (après déduction du CMG)
- Plafond : **3 500 € de dépenses** → crédit max **1 750 €/enfant**
- Case : **7GA** (1er enfant), **7GB** (2e enfant)

### 2. Crédit emploi à domicile (max 6 000 à 7 500 €)

Tu emploies quelqu'un à domicile (ménage, garde, soutien scolaire, jardinage) ?
- **50 %** des dépenses
- Plafond : **12 000 €** + **1 500 €/enfant** (max 15 000 €)
- S'applique même si tu n'es pas imposable (c'est un **crédit**, pas une réduction)

### 3. Réduction pour dons (66 % ou 75 %)

Tu fais des dons à des associations ?
- Associations d'intérêt général : **66 %** du don (plafond 20 % du revenu)
- Associations d'aide aux personnes (Restos du Cœur, etc.) : **75 %** (plafond 1 000 €)
- Un don de 100 € aux Restos ne te coûte que **25 €** après réduction

### 4. Réduction frais de scolarité

Souvent oublié car les montants semblent faibles, mais ils s'accumulent :
- **Collège** : 61 €/enfant
- **Lycée** : 153 €/enfant
- **Études supérieures** : 183 €/enfant
- Pour 2 enfants au lycée : **306 €/an** de réduction

### 5. Crédit d'impôt pour cotisations syndicales

Si tu es syndiqué :
- **66 %** de la cotisation annuelle
- Plafond : 1 % du revenu brut
- Une cotisation de 200 € ne te coûte que **68 €**

### Le total peut être impressionnant

En cumulant ces 5 avantages pour un foyer type (2 enfants, garde, emploi à domicile, dons) :
- Garde : **3 500 €**
- Emploi domicile : **3 000 €**
- Dons : **500 €**
- Scolarité : **306 €**
- **Total économies : ~3 800 €/an**

### Simule ton impôt

Notre [simulateur fiscal gratuit](/outils/simulateur-ir) intègre tous ces crédits et réductions. Lance ta simulation pour voir combien tu peux économiser.`,
  },
  {
    slug: "conge-paternite-2026-guide-complet",
    title: "Congé paternité 2026 : durée, indemnités et démarches complètes",
    description:
      "Tout savoir sur le congé paternité en 2026 : 25 jours calendaires, indemnités journalières, démarches employeur et CPAM, droits du père.",
    date: "2026-02-20",
    readingTime: "5 min",
    category: "Démarches",
    content: `## Le congé paternité : tes droits en tant que daron

Depuis juillet 2021, le congé paternité est passé à **25 jours calendaires** (32 pour des naissances multiples). Voici tout ce que tu dois savoir.

### Durée du congé

| Composante | Durée | Obligatoire ? |
|------------|-------|---------------|
| Congé de naissance | 3 jours ouvrables | Oui |
| Congé paternité | 25 jours calendaires | 4 jours obligatoires + 21 facultatifs |

**Total : 28 jours** dont **7 jours obligatoires** immédiatement après la naissance.

### Les indemnités

Pendant le congé paternité, tu perçois des **indemnités journalières** versées par la Sécurité sociale :
- Montant : **entre 10,79 € et 100,36 €/jour** selon ton salaire
- Calcul : moyenne des 3 derniers salaires bruts, plafonnée
- Certaines conventions collectives prévoient le **maintien de salaire** intégral

### Les démarches, étape par étape

**1 mois avant la naissance :**
- Préviens ton employeur par courrier recommandé ou remise en main propre
- Précise les dates de début et de fin du congé

**À la naissance :**
- Prends les 3 jours de congé de naissance (à utiliser dans les 15 jours)
- Enchaîne avec les 4 jours obligatoires de congé paternité

**Dans les 6 mois suivant la naissance :**
- Les 21 jours restants sont à prendre dans les **6 mois** suivant la naissance
- Tu peux les fractionner en **2 périodes minimum de 5 jours**

**Documents à fournir :**
- Copie de l'acte de naissance ou du livret de famille
- Attestation sur l'honneur (lien de filiation avec l'enfant)

### Cas particuliers

- **Indépendants / auto-entrepreneurs** : mêmes droits, indemnités versées par la CPAM
- **Naissance multiple** (jumeaux+) : 32 jours au lieu de 25
- **Hospitalisation de l'enfant** : possibilité de report du congé

### Ton employeur ne peut pas refuser

Le congé paternité est un **droit**. Ton employeur ne peut ni le refuser, ni te licencier pendant cette période. Toute discrimination liée au congé paternité est illégale.

### Organise-toi avec Darons

Notre [checklist naissance](/outils/checklist-naissance) inclut automatiquement les étapes du congé paternité avec des rappels. [Crée ton compte](/register) pour ne rien oublier.`,
  },
  {
    slug: "20-examens-sante-obligatoires-bebe",
    title: "Les 20 examens de santé obligatoires de 0 à 16 ans",
    description:
      "De la naissance à 16 ans, votre enfant doit passer 20 examens médicaux obligatoires. Calendrier complet, ce qui est vérifié, et comment ne rien oublier.",
    date: "2026-01-15",
    readingTime: "8 min",
    category: "Santé",
    content: `## 20 examens obligatoires : le calendrier complet

Depuis le nouveau carnet de santé 2025, **20 examens médicaux** sont obligatoires entre la naissance et 16 ans. Chacun donne lieu à un certificat médical. Voici le détail.

### Les 14 premiers examens (0-3 ans)

C'est la période la plus dense en examens :

| Examen | Âge | Ce qui est vérifié |
|--------|-----|-------------------|
| 1 | 8 jours | Score Apgar, réflexes, dépistage néonatal |
| 2 | 1 mois | Poids, taille, fontanelles, audition |
| 3 | 2 mois | Vaccins (DTPCa, Hib, HepB, Pneumo), développement moteur |
| 4 | 3 mois | Croissance, vision, tonus |
| 5 | 4 mois | 2e dose vaccins, motricité, alimentation |
| 6 | 5 mois | Méningocoque C, interaction sociale |
| 7 | 6 mois | Diversification alimentaire, position assise |
| 8 | 9 mois | Audition, vision, préhension fine, babillage |
| 9 | 12 mois | ROR + Méningo C, marche, premiers mots |
| 10 | 13 mois | Suivi post-vaccinal, développement |
| 11 | 16-18 mois | ROR 2e dose, langage, autonomie |
| 12 | 2 ans | Langage (50+ mots), comportement, propreté |
| 13 | 2 ans ½ | Repérage troubles neurodéveloppement (TND) |
| 14 | 3 ans | Vision, audition, langage construit, entrée en maternelle |

### Les 6 examens suivants (4-16 ans)

| Examen | Âge | Ce qui est vérifié |
|--------|-----|-------------------|
| 15 | 4 ans | Vision, audition, motricité fine, socialisation |
| 16 | 5 ans | Bilan pré-CP, latéralité, repérage DYS |
| 17 | 6 ans | Entrée CP, vue, audition, poids (courbe IMC) |
| 18 | 8-9 ans | Suivi croissance, repérage difficultés scolaires |
| 19 | 11-13 ans | Puberté, scoliose, santé mentale, rappel vaccins |
| 20 | 15-16 ans | Consultation ado, prévention, vaccins HPV |

### Nouveautés du carnet de santé 2025

Le nouveau carnet introduit :
- **Repérage des écrans** dès 3 mois (questions systématiques)
- **Grille TND** (Troubles Neurodéveloppementaux) à 2 ans ½
- **Suivi activité physique** dès 2 ans
- **Score Apgar** détaillé (1, 5 et 10 minutes)

### Que se passe-t-il si on rate un examen ?

Ces examens sont **obligatoires** et remboursés à 100 % par la Sécurité sociale. En cas d'oubli :
- Aucune sanction légale, mais c'est la santé de ton enfant qui est en jeu
- Le médecin peut rattraper un examen manqué lors de la consultation suivante

### Suivi automatisé avec Darons

Notre outil [examens de santé](/outils/examens-sante) génère automatiquement le calendrier des 20 examens selon la date de naissance de ton enfant, avec des rappels. [Crée ton compte gratuitement](/register).`,
  },
  {
    slug: "allergies-alimentaires-bebe-guide",
    title: "Allergies alimentaires chez le bébé : symptômes, diagnostic et diversification",
    description:
      "Comment repérer une allergie alimentaire chez le nourrisson, les allergènes courants, la diversification en toute sécurité, et quand consulter.",
    date: "2026-02-05",
    readingTime: "7 min",
    category: "Santé",
    content: `## Allergies alimentaires du bébé : pas de panique, mais reste vigilant

Les allergies alimentaires touchent environ **6 à 8 % des enfants** de moins de 3 ans en France. La bonne nouvelle : la majorité d'entre elles disparaissent avant l'âge de 6 ans.

### Les allergènes les plus fréquents

Par ordre de fréquence chez le nourrisson :

1. **Lait de vache** (APLV) — la plus fréquente (2-3 % des bébés)
2. **Œuf** — souvent le blanc d'œuf
3. **Arachide** — en augmentation ces dernières années
4. **Fruits à coque** (noix, noisette, cajou)
5. **Blé / gluten**
6. **Poisson et crustacés**
7. **Soja**

### Les symptômes à surveiller

**Réactions immédiates** (dans les 2 heures) :
- Urticaire (plaques rouges qui grattent)
- Gonflement des lèvres ou du visage
- Vomissements
- Difficultés respiratoires (urgence !)

**Réactions retardées** (heures à jours) :
- Eczéma qui s'aggrave
- Diarrhées chroniques
- Reflux persistant
- Coliques sévères
- Stagnation de la courbe de poids

### Quand et comment diversifier ?

Les recommandations ont **changé** : on ne retarde plus l'introduction des allergènes. Au contraire :

- **Dès 4-6 mois** : commencer la diversification
- **Introduire tôt les allergènes** : arachide, œuf, poisson dès 4-6 mois
- **Un nouvel aliment à la fois**, pendant 3 jours, pour identifier les réactions
- **Petites quantités** au début, augmenter progressivement
- **Ne JAMAIS donner** de miel avant 1 an (risque de botulisme, pas une allergie)

### Que faire en cas de réaction ?

**Réaction légère** (quelques boutons, léger gonflement) :
- Arrêter l'aliment en question
- Consulter le pédiatre dans les 48h
- Noter l'aliment, la quantité, et les symptômes

**Réaction sévère** (difficultés respiratoires, gonflement du visage, malaise) :
- **Appeler le 15 (SAMU) immédiatement**
- Allonger l'enfant (ou position semi-assise si difficultés respiratoires)
- Ne rien donner à manger ni à boire

### Le diagnostic

Le médecin peut prescrire :
- **Prick tests** cutanés (résultats en 20 min)
- **Dosage IgE** spécifiques (prise de sang)
- **Test de provocation orale** (TPO) — en milieu hospitalier, sous surveillance

### Vivre avec une allergie alimentaire

- **Informer la crèche/nounou** par écrit avec le PAI (Projet d'Accueil Individualisé)
- **Lire les étiquettes** systématiquement (les 14 allergènes majeurs sont obligatoirement mentionnés)
- **Avoir un kit d'urgence** si prescrit (antihistaminique + stylo auto-injecteur d'adrénaline)

### Suivi avec Darons

Notre module Santé enrichie permet de suivre les allergies de ton enfant avec des alertes croisées sur les compositions alimentaires. [Crée ton compte](/register) pour un suivi personnalisé.`,
  },
  {
    slug: "inscription-creche-guide-complet",
    title: "Inscription en crèche : le guide complet pour décrocher une place",
    description:
      "Quand s'inscrire, les critères d'attribution, les types de crèches, et nos astuces pour maximiser vos chances d'obtenir une place en crèche.",
    date: "2026-01-25",
    readingTime: "6 min",
    category: "Garde",
    content: `## Inscription en crèche : la stratégie gagnante

Obtenir une place en crèche relève parfois du parcours du combattant. En Île-de-France, le taux de couverture est de **seulement 17 %**. Voici comment maximiser tes chances.

### Quand s'inscrire ?

**Le plus tôt possible :**
- Dès le **6e mois de grossesse** pour les crèches municipales
- Dès la **déclaration de grossesse** pour certaines communes (Paris, Lyon, Marseille)
- Les commissions d'attribution ont lieu en **mars** (rentrée septembre) et **octobre** (rentrée janvier)

### Les types de crèches

| Type | Capacité | Géré par | Coût |
|------|----------|----------|------|
| Crèche municipale | 20-60 places | Mairie | PSU (selon revenus) |
| Crèche associative | 15-40 places | Association | PSU |
| Micro-crèche | 10-12 places | Privé | Forfait ou PSU |
| Crèche d'entreprise | Variable | Employeur | Variable |
| MAM (Maison d'Assistantes Maternelles) | 4-16 places | Indépendantes | Tarif libre |

### Les critères d'attribution

Chaque commune a ses propres critères, mais les plus courants :
1. **Résidence dans la commune** (prioritaire)
2. **Revenus du foyer** (les plus modestes sont prioritaires)
3. **Activité professionnelle** des deux parents
4. **Famille monoparentale** (points bonus)
5. **Fratrie déjà dans la crèche** (points bonus)
6. **Handicap** de l'enfant ou d'un parent (prioritaire)

### Astuces pour maximiser tes chances

1. **Inscris-toi dans plusieurs crèches** — municipales ET privées, ne mise pas tout sur une seule
2. **Rédige une lettre de motivation** — oui, ça se fait. Explique ta situation, tes contraintes horaires
3. **Relance régulièrement** — un appel poli à la mairie tous les 2 mois montre ta motivation
4. **Cible la commission de mars** — les places de septembre sont les plus nombreuses
5. **Explore les micro-crèches** — moins connues, souvent avec des places disponibles
6. **Regarde les crèches d'entreprise** — demande à ton employeur s'il a un partenariat

### Le coût réel

Avec le barème PSU (Prestation de Service Unique), le tarif dépend de tes revenus :

**Exemple :** Couple, 40 000 €/an de revenus, 1 enfant
- Tarif horaire : ~1,20 €
- Coût mensuel (200h) : ~240 €/mois
- Après crédit d'impôt : ~120 €/mois net

### Plan B : l'assistante maternelle

Si tu n'obtiens pas de place en crèche, l'assistante maternelle est une excellente alternative. Utilise notre [simulateur de coût de garde](/outils/simulateur-garde) pour comparer les options.

### Trouve ta crèche avec Darons

Notre module [Recherche de garde](/garde) affiche les crèches autour de chez toi avec leurs disponibilités. [Crée ton compte](/register) pour commencer ta recherche.`,
  },
  {
    slug: "jalons-developpement-0-3-ans",
    title: "Jalons de développement de 0 à 3 ans : quand s'inquiéter ?",
    description:
      "Les étapes clés du développement de votre bébé mois par mois : motricité, langage, cognition, social. Quand consulter si vous avez des doutes.",
    date: "2026-03-15",
    readingTime: "7 min",
    category: "Développement",
    content: `## Le développement de ton bébé mois par mois

Chaque enfant évolue à son rythme. Ces jalons sont des **repères moyens**, pas des obligations. Un retard de quelques semaines est normal. Mais certains signaux méritent une consultation.

### 0-3 mois : les débuts

**Motricité :**
- Tient sa tête quelques secondes (2 mois)
- Tourne la tête vers un son
- Bouge bras et jambes symétriquement

**Langage & communication :**
- Pleure pour exprimer ses besoins
- Réagit aux voix (surtout celle de maman)
- Premiers gazouillis (2-3 mois)

**Social :**
- Sourire réflexe (naissance), puis **sourire social** (6-8 semaines)
- Fixe le regard, suit des yeux un objet

### 4-6 mois : l'éveil

**Motricité :**
- Tient sa tête bien droite (4 mois)
- Attrape un objet (4-5 mois)
- Se retourne (ventre → dos, puis dos → ventre)
- Début position assise avec appui (6 mois)

**Langage :**
- **Babillage** : "bababa", "mamama" (6 mois)
- Rit aux éclats
- Réagit à son prénom

### 7-12 mois : l'exploration

**Motricité :**
- S'assoit seul sans appui (7-8 mois)
- Rampe ou se déplace à 4 pattes (8-10 mois)
- Se met debout en s'accrochant (9-10 mois)
- **Premiers pas** (10-15 mois — grande variabilité !)

**Langage :**
- Premiers mots intentionnels : "mama", "papa" (10-12 mois)
- Comprend "non" et des consignes simples
- Pointe du doigt pour montrer (12 mois) — jalon important !

**Cognition :**
- **Permanence de l'objet** : comprend qu'un objet caché existe toujours (8 mois)
- Cherche un jouet caché sous un tissu

**Social :**
- **Anxiété de séparation** (8-10 mois) — normal !
- Fait "bravo", "au revoir" de la main

### 13-24 mois : l'autonomie

**Motricité :**
- Marche seul (12-18 mois)
- Monte les escaliers à 4 pattes (15 mois)
- Court (18-20 mois)
- Empile 2-3 cubes (15 mois), puis 6+ (24 mois)

**Langage :**
- 10-50 mots à 18 mois
- **50+ mots et premières phrases** à 24 mois ("encore lait", "papa parti")
- Comprend des consignes à 2 étapes ("prends le livre et donne-le à maman")

**Social :**
- Jeu parallèle (joue à côté des autres, pas avec)
- Imite les adultes (balayer, téléphoner)
- Dit "non" (beaucoup)

### 25-36 mois : le langage explose

**Motricité :**
- Saute sur place (2 ans)
- Pédale sur un tricycle (2,5-3 ans)
- S'habille partiellement seul

**Langage :**
- Phrases de 3-4 mots (2,5 ans)
- Se fait comprendre par des inconnus (3 ans)
- Utilise "je", "tu", "il"
- Pose des questions "pourquoi ?" (prépare-toi)

### Quand consulter ?

Consulte ton pédiatre si à :
- **4 mois** : ne tient pas sa tête, pas de sourire social
- **9 mois** : ne s'assoit pas, ne babille pas, pas de réaction au prénom
- **12 mois** : ne pointe pas du doigt, pas de mot
- **18 mois** : ne marche pas, moins de 10 mots, pas d'imitation
- **24 mois** : moins de 50 mots, pas de phrases de 2 mots
- **3 ans** : langage incompréhensible, pas de jeu imaginaire

> **Important** : un retard ne signifie pas un trouble. Mais un dépistage précoce permet une prise en charge rapide et efficace.

### Suis les jalons avec Darons

Notre outil [jalons de développement](/outils/jalons-developpement) te permet de cocher les étapes atteintes et d'identifier les points de vigilance. [Crée ton compte](/register).`,
  },
  {
    slug: "cout-enfant-0-18-ans-france",
    title: "Combien coûte un enfant de 0 à 18 ans en France ? Le vrai budget",
    description:
      "De la naissance à la majorité, un enfant coûte en moyenne 180 000 €. Détail année par année, poste par poste, et comment optimiser.",
    date: "2026-03-01",
    readingTime: "6 min",
    category: "Budget",
    content: `## Le coût réel d'un enfant : entre 150 000 et 200 000 €

Selon les études de l'UNAF et de l'INSEE, élever un enfant de la naissance à 18 ans coûte entre **150 000 et 200 000 €**. Soit environ **700 à 950 €/mois en moyenne**. Mais ce chiffre varie énormément selon les années.

### Le coût par tranche d'âge

| Tranche d'âge | Coût moyen/an | Principaux postes |
|---------------|---------------|-------------------|
| **0-3 ans** | 8 000 - 12 000 € | Garde (60 %), alimentation, couches, santé |
| **3-6 ans** | 5 000 - 7 000 € | Activités, vêtements, cantine |
| **6-11 ans** | 5 000 - 7 000 € | Scolarité, activités extra, loisirs |
| **11-14 ans** | 6 000 - 8 000 € | Collège, vêtements (croissance), numérique |
| **15-18 ans** | 7 000 - 10 000 € | Lycée, permis, smartphone, sorties |

### Détail par poste de dépense

**Alimentation (20-25 %)**
- Lait infantile : 80-120 €/mois la 1ère année (si non-allaité)
- Diversification : petits pots ou fait-maison (30-100 €/mois)
- À partir de 3 ans : ~150-200 €/mois d'alimentation supplémentaire

**Garde (25-30 % les 3 premières années)**
- Crèche municipale : 100-500 €/mois selon revenus (après aides)
- Assistante maternelle : 200-600 €/mois net (après CMG + crédit impôt)
- Garde à domicile : 500-1 200 €/mois net
- Après 3 ans, ce poste chute drastiquement (école gratuite !)

**Vêtements (10 %)**
- Les 2 premières années : changement de taille tous les 3 mois
- Budget moyen : 50-100 €/mois (neuf) ou 20-40 € (occasion)

**Santé (5 %)**
- Consultations pédiatre, urgences, médicaments
- Orthodontie (à partir de 8-10 ans) : 600-2 000 €/semestre
- Lunettes : 100-300 € (remboursées partiellement)

**Activités & loisirs (10-15 %)**
- Sport, musique, art : 30-100 €/mois
- Vacances famille : 500-3 000 €/an
- Jouets, livres : 30-50 €/mois

**Logement (15-20 %)**
- Surcoût chambre supplémentaire : 100-400 €/mois selon la ville
- Équipement (lit, poussette, siège auto) : 1 000-3 000 € la 1ère année

### Comment réduire la facture

1. **Maximise les aides CAF** — PAJE, CMG, allocations familiales, prime rentrée ([simule tes droits](/outils/simulateur-caf))
2. **Utilise les crédits d'impôt** — garde, emploi domicile ([simule ton impôt](/outils/simulateur-ir))
3. **Achète d'occasion** — vêtements, jouets, matériel de puériculture (Vinted, Le Bon Coin, bourses aux vêtements)
4. **Fais du batch cooking** — cuisiner en lot pour bébé revient 3x moins cher que les petits pots
5. **Compare les modes de garde** — la crèche municipale est souvent la moins chère ([compare ici](/outils/simulateur-garde))

### Premier enfant vs suivants

Le 2e enfant coûte en moyenne **30 % de moins** que le premier :
- Réutilisation du matériel, des vêtements
- Allocations familiales (à partir du 2e enfant)
- Expérience parentale (moins d'achats impulsifs)

### Suis ton budget avec Darons

Notre [simulateur de budget familial](/outils/simulateur-budget) te montre exactement où va ton argent mois par mois. Connecte ta banque ou saisis tes dépenses manuellement. [C'est gratuit](/register).`,
  },
  {
    slug: "ecrans-enfants-recommandations-2025",
    title: "Ecrans et enfants : les recommandations officielles 2025",
    description:
      "Combien de temps d'ecran par age ? Les recommandations du carnet de sante 2025, les signes d'alerte et les alternatives concretes.",
    date: "2026-03-15",
    readingTime: "6 min",
    category: "Sante",
    content: `## Ce que dit le carnet de sante 2025

Le nouveau carnet de sante (edition 2025) integre pour la premiere fois un **questionnaire sur l'exposition aux ecrans** des la visite des 3 mois. Les recommandations sont claires :

### Par tranche d'age

| Age | Recommandation |
|-----|---------------|
| **0-2 ans** | Aucun ecran. Zero. Meme en fond sonore. |
| **2-3 ans** | Maximum 30 min/jour, accompagne par un adulte |
| **3-6 ans** | Maximum 1h/jour, contenu adapte et accompagne |
| **6-9 ans** | Maximum 1h30/jour, jamais pendant les repas ni avant le coucher |
| **9-12 ans** | Maximum 2h/jour, pas de smartphone personnel |

### Pourquoi c'est important

L'exposition precoce aux ecrans est associee a :
- **Retards de langage** : les enfants exposes plus de 2h/jour ont 3x plus de risques de retard
- **Troubles du sommeil** : la lumiere bleue perturbe la melatonine
- **Difficultes d'attention** : le zapping permanent reduit la capacite de concentration
- **Sedentarite** : moins de motricite, risque de surpoids

### Les signes d'alerte

Consultez votre pediatre si votre enfant :
- Ne reagit pas quand on l'appelle (hors ecran)
- S'isole ou fait des crises quand on coupe l'ecran
- Prefere systematiquement l'ecran aux interactions humaines
- A du mal a s'endormir sans ecran

### Alternatives concretes par age

**0-2 ans :** jeux d'eveil, lectures a voix haute, sorties au parc, musique, pate a modeler
**2-4 ans :** dessin, puzzles, jeux de construction, jardinage, cuisine (avec surveillance)
**4-6 ans :** sport, velo, jeux de societe, activites manuelles, instruments de musique

### Suivi avec Darons

Notre module [sante enrichie](/sante-enrichie) inclut le questionnaire ecrans du carnet 2025 et suit l'exposition de ton enfant dans le temps. [Cree ton compte](/register) pour un suivi personnalise.

**Voir aussi :** [Les 20 examens de sante obligatoires](/blog/20-examens-sante-obligatoires-bebe) | [Jalons de developpement 0-3 ans](/blog/jalons-developpement-0-3-ans)`,
  },
  {
    slug: "allocation-rentree-scolaire-2026",
    title: "Allocation de rentree scolaire 2026 : montants, conditions et dates",
    description:
      "Tout sur l'ARS 2026 : montants par age, plafonds de revenus, dates de versement et demarches. Verifiez si vous y avez droit.",
    date: "2026-03-10",
    readingTime: "5 min",
    category: "Budget",
    content: `## L'allocation de rentree scolaire (ARS)

L'ARS est versee **chaque annee en aout** aux familles modestes pour aider a financer les fournitures scolaires. Elle concerne les enfants de 6 a 18 ans.

### Montants 2026 (prevision)

| Age de l'enfant | Montant |
|----------------|---------|
| **6-10 ans** | ~416 EUR |
| **11-14 ans** | ~440 EUR |
| **15-18 ans** | ~454 EUR |

*Montants indicatifs bases sur les baremes 2025 + revalorisation estimee.*

### Conditions de revenus

L'ARS est soumise a un **plafond de ressources** (revenus N-2) :

| Nombre d'enfants | Plafond de revenus |
|------------------|-------------------|
| 1 enfant | ~26 000 EUR |
| 2 enfants | ~32 000 EUR |
| 3 enfants | ~38 000 EUR |
| Par enfant supplementaire | +6 000 EUR |

### Dates cles

1. **Mi-aout** : versement automatique si votre enfant a entre 6 et 15 ans et que la CAF a vos revenus
2. **16-18 ans** : vous devez envoyer un justificatif de scolarite a la CAF
3. **Pas de demande a faire** si vous etes deja allocataire et que vos revenus sont connus

### Ce que l'ARS couvre

- Cartable, trousse, cahiers, stylos
- Vetements (chaussures, blouse)
- Activites periscolaires (facultatif)
- Assurance scolaire

### Simulez vos droits

Notre [simulateur d'allocations CAF](/outils/simulateur-caf) calcule instantanement vos droits a l'ARS et aux autres prestations. [Essayez-le gratuitement](/outils/simulateur-caf).

**Voir aussi :** [Simulateur allocations CAF 2025](/blog/simulateur-allocations-caf-2025) | [Budget bebe premiere annee](/blog/budget-bebe-premiere-annee) | [Cout d'un enfant de 0 a 18 ans](/blog/cout-enfant-0-18-ans-france)`,
  },
  {
    slug: "prime-naissance-paje-guide-complet",
    title: "Prime de naissance PAJE : qui y a droit et comment la demander",
    description:
      "Guide complet sur la prime de naissance de la PAJE : conditions, montant, demarches et delais. Ne passez pas a cote de 1 019 euros.",
    date: "2026-03-05",
    readingTime: "5 min",
    category: "Demarches",
    content: `## La prime de naissance PAJE

La prime de naissance fait partie de la **PAJE (Prestation d'Accueil du Jeune Enfant)**. C'est un versement unique de **1 019,40 EUR** pour chaque enfant.

### Conditions

- Declarer votre grossesse a la CAF et a la CPAM **avant la fin du 3e mois**
- Revenus du foyer inferieurs au plafond (environ 34 000 EUR pour un couple avec 1 enfant)
- Etre beneficiaire de la Securite sociale

### Quand est-elle versee ?

La prime est versee **au 7e mois de grossesse** (ou au 2e mois apres adoption).

### Comment la demander ?

1. **Declarez votre grossesse** dans les 14 premieres semaines aupres de la CAF et de la CPAM
2. **Envoyez le formulaire** de declaration de grossesse (remis par votre medecin ou sage-femme)
3. **La CAF calcule automatiquement** vos droits a partir de vos revenus declares
4. **Le versement est automatique** — pas de demande supplementaire si tout est en ordre

### A ne pas confondre

| Prestation | Montant | Frequence |
|-----------|---------|-----------|
| **Prime de naissance** | 1 019 EUR | Unique (7e mois) |
| **Allocation de base** | 184 EUR/mois | Mensuel (naissance a 3 ans) |
| **CMG** | Variable | Mensuel (si mode de garde) |

### Les pieges a eviter

- **Declaration tardive** : si vous declarez apres 14 semaines, vous risquez un retard de versement
- **Depassement de revenus** : verifiez le plafond avant de compter sur la prime
- **Enfant mort-ne** : la prime est quand meme versee si la grossesse a depasse 22 semaines

### Simulez vos droits

Notre [simulateur CAF](/outils/simulateur-caf) calcule la PAJE complete : prime de naissance + allocation de base + CMG.

**Voir aussi :** [Checklist demarches naissance](/blog/checklist-naissance-demarches) | [Conge paternite 2026](/blog/conge-paternite-2026-guide-complet)`,
  },
  {
    slug: "conge-maternite-2026-guide",
    title: "Conge maternite 2026 : duree, indemnites et demarches",
    description:
      "Guide complet du conge maternite : duree selon le nombre d'enfants, calcul des indemnites journalieres, demarches employeur et CPAM.",
    date: "2026-02-28",
    readingTime: "7 min",
    category: "Demarches",
    content: `## Le conge maternite en France

Le conge maternite est un **droit pour toute salariee enceinte**. Il comprend un conge prenatal (avant l'accouchement) et postnatal (apres).

### Duree du conge

| Situation | Prenatal | Postnatal | Total |
|----------|---------|----------|-------|
| **1er ou 2e enfant** | 6 semaines | 10 semaines | **16 semaines** |
| **3e enfant ou plus** | 8 semaines | 18 semaines | **26 semaines** |
| **Jumeaux** | 12 semaines | 22 semaines | **34 semaines** |
| **Triples ou plus** | 24 semaines | 22 semaines | **46 semaines** |

### Report possible

Vous pouvez **reporter 3 semaines** du conge prenatal vers le postnatal (sur avis medical). Le conge prenatal minimum est donc de 3 semaines pour un 1er enfant.

### Indemnites journalieres

L'Assurance Maladie verse des **indemnites journalieres (IJ)** :
- **Calcul** : moyenne des 3 derniers salaires bruts (plafond mensuel ~3 666 EUR en 2026)
- **Montant net** : environ 89% du salaire net pour les salaires en dessous du plafond
- **Pas de delai de carence** : les IJ sont versees des le 1er jour du conge

### Demarches a suivre

1. **Avant le 3e mois** : declarer la grossesse a la CPAM et a la CAF
2. **Au 6e mois** : informer l'employeur par courrier recommande (date prevue d'accouchement, dates de conge)
3. **Dernier jour travaille** : remettre a l'employeur le certificat de la CPAM
4. **Apres l'accouchement** : envoyer l'acte de naissance a la CPAM dans les 48h

### Cas particuliers

- **Grossesse pathologique** : +2 semaines de conge prenatal sur prescription
- **Naissance prematuree** : le conge prenatal non pris est ajoute au postnatal
- **Hospitalisation du nouveau-ne** : le conge postnatal peut etre prolonge

### Protection de l'emploi

Pendant le conge maternite et les 10 semaines suivant le retour :
- **Interdiction de licenciement** (sauf faute grave non liee a la grossesse)
- **Retour au meme poste** ou poste equivalent
- **Maintien des droits** a l'anciennete

### Planifie avec Darons

Notre [checklist demarches](/outils/checklist-naissance) integre automatiquement les etapes du conge maternite avec des rappels. [Cree ton compte](/register) pour ne rien oublier.

**Voir aussi :** [Conge paternite 2026](/blog/conge-paternite-2026-guide-complet) | [Prime de naissance PAJE](/blog/prime-naissance-paje-guide-complet) | [Checklist demarches naissance](/blog/checklist-naissance-demarches)`,
  },
  {
    slug: "emploi-domicile-credit-impot-parents",
    title: "Credit d'impot emploi a domicile : le guide pour les parents",
    description:
      "Garde d'enfant, soutien scolaire, menage : tout sur le credit d'impot emploi a domicile. Plafonds, calcul et declaration.",
    date: "2026-02-20",
    readingTime: "5 min",
    category: "Fiscal",
    content: `## Le credit d'impot emploi a domicile

Si vous employez quelqu'un a domicile (garde, menage, soutien scolaire...), vous beneficiez d'un **credit d'impot de 50%** des depenses engagees.

### Services eligibles pour les parents

- **Garde d'enfant a domicile** (hors heures scolaires)
- **Soutien scolaire** et cours particuliers
- **Aide menagere** (menage, repassage, cuisine)
- **Baby-sitting** a domicile
- **Assistance informatique** (aide aux devoirs en ligne)
- **Jardinage** (plafond specifique de 5 000 EUR/an)

### Montants et plafonds

| Element | Montant |
|---------|---------|
| **Taux du credit** | 50% des depenses |
| **Plafond annuel de base** | 12 000 EUR |
| **Majoration par enfant** | +1 500 EUR |
| **Plafond maximal** | 15 000 EUR (couple + 2 enfants) |
| **Credit max (couple + 2 enfants)** | 7 500 EUR |

### Exemple concret

Famille avec 2 enfants, qui emploie :
- Une nounou 3 soirs/semaine : 8 000 EUR/an
- Une aide menagere 2h/semaine : 4 000 EUR/an
- **Total** : 12 000 EUR
- **Plafond** : 12 000 + 1 500 x 2 = 15 000 EUR (OK, en dessous)
- **Credit d'impot** : 50% x 12 000 = **6 000 EUR**

### Cumul avec le credit garde d'enfant

**Attention** : le credit "emploi a domicile" et le credit "garde d'enfant < 6 ans" (case 7GA) ne se cumulent **pas** pour les memes depenses. Vous devez choisir le plus avantageux.

En general :
- **Creche/assistante maternelle** → credit garde (case 7GA, plafond 3 500 EUR)
- **Garde a domicile** → credit emploi a domicile (case 7DB, plafond 12 000 EUR+)

### CESU : la solution simple

Le **CESU (Cheque Emploi Service Universel)** simplifie les demarches :
- Declaration automatique a l'URSSAF
- Calcul des cotisations sociales
- Attestation fiscale automatique

### Declaration

Inscrivez vos depenses dans la case **7DB** de votre declaration de revenus. L'attestation annuelle de l'URSSAF ou du prestataire fait foi.

### Simulez votre economie

Notre [simulateur d'impot](/outils/simulateur-ir) calcule le credit emploi a domicile en plus du credit garde enfant. [Testez-le gratuitement](/outils/simulateur-ir).

**Voir aussi :** [Credit d'impot garde d'enfant](/blog/credit-impot-garde-enfant-2025) | [5 credits d'impot que les parents oublient](/blog/5-credits-impot-parents-oublient) | [Quotient familial](/blog/quotient-familial-comment-ca-marche)`,
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getAllArticles(): BlogArticle[] {
  return [...BLOG_ARTICLES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAdjacentArticles(slug: string): {
  previous: BlogArticle | null;
  next: BlogArticle | null;
} {
  const sorted = getAllArticles();
  const index = sorted.findIndex((a) => a.slug === slug);
  return {
    previous: index < sorted.length - 1 ? sorted[index + 1] : null,
    next: index > 0 ? sorted[index - 1] : null,
  };
}

export function getRelatedArticles(slug: string, maxCount: number = 3): BlogArticle[] {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  return getAllArticles()
    .filter((a) => a.category === article.category && a.slug !== slug)
    .slice(0, maxCount);
}
