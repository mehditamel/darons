import { CURRENT_TAX_YEAR } from "@/lib/constants";

export interface ToolCard {
  href: string;
  iconName: string;
  title: string;
  description: string;
  color: string;
  isNew?: boolean;
}

interface ToolSection {
  title: string;
  tools: ToolCard[];
}

export const SECTIONS: ToolSection[] = [
  {
    title: "Argent & droits",
    tools: [
      {
        href: "/outils/simulateur-ir",
        iconName: "Calculator",
        title: `Simulateur impôt ${CURRENT_TAX_YEAR}`,
        description: "Calcule ton impôt, ton TMI et tes crédits d'impôt (garde, emploi domicile, dons). Barème officiel.",
        color: "text-warm-gold bg-warm-gold/10",
      },
      {
        href: "/outils/simulateur-caf",
        iconName: "Baby",
        title: "Simulateur allocations CAF",
        description: "Allocations familiales, PAJE, CMG, allocation rentrée scolaire. Tous tes droits CAF.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/simulateur-garde",
        iconName: "Baby",
        title: "Coût de garde : le vrai prix",
        description: "Crèche, nounou, garde à domicile : calcule ton reste à charge réel après CMG et crédit d'impôt.",
        color: "text-warm-blue bg-warm-blue/10",
      },
      {
        href: "/outils/simulateur-budget",
        iconName: "Wallet",
        title: "Budget familial",
        description: "Revenus, dépenses par catégorie, reste à vivre. Fais le point sur tes finances de parent.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/combien-coute-enfant",
        iconName: "PiggyBank",
        title: "Coût d'un enfant (0-18 ans)",
        description: "Le vrai coût d'un enfant de la naissance à 18 ans. Poste par poste, tranche d'âge par tranche.",
        color: "text-warm-gold bg-warm-gold/10",
      },
      {
        href: "/outils/mes-droits",
        iconName: "Scale",
        title: "Tous tes droits sociaux",
        description: "Allocations, PAJE, CMG, prime d'activité, RSA : calcule toutes les aides en 2 minutes.",
        color: "text-warm-green bg-warm-green/10",
      },
      {
        href: "/outils/conge-parental",
        iconName: "Home",
        title: "Simulateur congé parental",
        description: "PreParE taux plein ou mi-temps, durée max, impact sur tes revenus. Compare les options.",
        color: "text-warm-blue bg-warm-blue/10",
        isNew: true,
      },
    ],
  },
  {
    title: "Santé",
    tools: [
      {
        href: "/outils/calendrier-vaccinal",
        iconName: "Syringe",
        title: "Calendrier vaccinal interactif",
        description: "Les dates des vaccinations de ton enfant, à vérifier avec un professionnel de santé.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/courbe-croissance",
        iconName: "Ruler",
        title: "Courbes de croissance OMS",
        description: "Poids, taille, périmètre crânien. Suis la croissance de ton bébé avec les courbes OMS.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/examens-sante",
        iconName: "Stethoscope",
        title: "20 examens obligatoires",
        description: "Le calendrier des 20 visites de santé obligatoires de 8 jours à 18 ans.",
        color: "text-warm-teal bg-warm-teal/10",
      },
      {
        href: "/outils/numeros-urgence",
        iconName: "Phone",
        title: "Numéros d'urgence",
        description: "SAMU, pompiers, centre antipoison, SOS Médecins. Appel direct en 1 tap.",
        color: "text-warm-red bg-warm-red/10",
      },
      {
        href: "/outils/ecrans-enfants",
        iconName: "Monitor",
        title: "Guide écrans par âge",
        description: "Recommandations officielles du carnet de santé 2025. Alternatives et conseils.",
        color: "text-warm-purple bg-warm-purple/10",
      },
    ],
  },
  {
    title: "Vie de parent",
    tools: [
      {
        href: "/outils/checklist-naissance",
        iconName: "ClipboardCheck",
        title: "Checklist naissance",
        description: "Toutes les démarches de la grossesse aux 3 ans. Coche au fur et à mesure.",
        color: "text-warm-orange bg-warm-orange/10",
      },
      {
        href: "/outils/jalons-developpement",
        iconName: "TrendingUp",
        title: "Jalons de développement",
        description: "Premiers mots, premiers pas. Référentiels OMS/HAS par catégorie.",
        color: "text-warm-purple bg-warm-purple/10",
        isNew: true,
      },
      {
        href: "/outils/timeline-administrative",
        iconName: "CalendarRange",
        title: "Timeline administrative",
        description: "La frise de la vie de parent : tout ce que tu dois faire, quand.",
        color: "text-warm-orange bg-warm-orange/10",
        isNew: true,
      },
    ],
  },
];

export const TOTAL_TOOLS = SECTIONS.reduce((acc, s) => acc + s.tools.length, 0);

