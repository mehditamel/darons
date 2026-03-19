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
    date: "2025-12-15",
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

Notre outil [calendrier vaccinal interactif](/outils/calendrier-vaccinal) te permet de visualiser les dates de vaccin personnalisées pour ton enfant. Crée un compte pour recevoir des rappels automatiques.`,
  },
  {
    slug: "credit-impot-garde-enfant-2025",
    title: "Crédit d'impôt garde d'enfant : guide complet 2025",
    description:
      "Comment bénéficier du crédit d'impôt pour frais de garde d'enfant en 2025. Montants, plafonds, conditions et calcul détaillé.",
    date: "2025-11-20",
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

Utilisez notre [simulateur d'impôt gratuit](/outils/simulateur-ir) pour calculer l'impact du crédit d'impôt garde d'enfant sur votre impôt.`,
  },
  {
    slug: "creche-ou-assistante-maternelle-comparatif",
    title: "Crèche ou assistante maternelle : comparatif coût réel après aides",
    description:
      "Comparaison détaillée du coût réel entre crèche et assistante maternelle après CMG et crédit d'impôt. Quel mode de garde choisir ?",
    date: "2025-10-05",
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
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getAllArticles(): BlogArticle[] {
  return [...BLOG_ARTICLES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
