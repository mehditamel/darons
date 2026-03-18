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

### Suivi avec Ma Vie Parentale

Notre outil [calendrier vaccinal interactif](/outils/calendrier-vaccinal) vous permet de visualiser les dates de vaccin personnalisées pour votre enfant. Créez un compte pour recevoir des rappels automatiques.`,
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
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getAllArticles(): BlogArticle[] {
  return [...BLOG_ARTICLES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
