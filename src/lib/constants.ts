// Darons est 100% gratuit — pas de tiers, pas de premium, tout est accessible
export const APP_LIMITS = {
  maxAdults: Infinity,
  maxChildren: Infinity,
  maxDocuments: Infinity,
  storageBytes: 1 * 1024 * 1024 * 1024, // 1 Go
  journalEntriesPerMonth: Infinity,
  hasOpenBanking: true,
  hasAiCoach: true,
  hasCalendarSync: true,
  hasOcr: true,
  hasPdfExport: true,
  hasMultiHousehold: true,
  alertChannels: ["email", "push", "sms"] as const,
} as const;

// Backward compat — PLAN_LIMITS maps all tiers to the same unlimited config
export const PLAN_LIMITS = {
  free: APP_LIMITS,
  premium: APP_LIMITS,
  family_pro: APP_LIMITS,
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

// AI usage: 500 calls/month for everyone
export const AI_MONTHLY_LIMIT = 500;
export const AI_MONTHLY_LIMITS: Record<PlanName, number> = {
  free: 500,
  premium: 500,
  family_pro: 500,
} as const;

// Barème IR 2025 (revenus 2024)
export const IR_BRACKETS_2025 = [
  { min: 0, max: 11294, rate: 0 },
  { min: 11295, max: 28797, rate: 0.11 },
  { min: 28798, max: 82341, rate: 0.30 },
  { min: 82342, max: 177106, rate: 0.41 },
  { min: 177107, max: Infinity, rate: 0.45 },
] as const;

// Plafonds crédits d'impôt
export const TAX_CREDITS = {
  gardeEnfant: { rate: 0.50, maxExpenses: 3500, maxCredit: 1750 },
  emploiDomicile: { rate: 0.50, maxExpenses: 12000, extraPerChild: 1500 },
  donsOrganismes: { rate: 0.66, maxRateOfIncome: 0.20 },
  donsAidePersonnes: { rate: 0.75, maxAmount: 1000 },
} as const;

// Allocations CAF 2025
export const CAF_RATES_2025 = {
  primeNaissance: 1019.40,
  allocationBase: 184.81,
  allocationRentreeScolaire6_10: 416.40,
  allocationRentreeScolaire11_14: 439.38,
  allocationRentreeScolaire15_18: 454.60,
} as const;

// Calendrier vaccinal français obligatoire
export const VACCINATION_SCHEDULE = [
  {
    code: "DTPCa",
    name: "Diphtérie-Tétanos-Polio-Coqueluche",
    doses: [
      { doseNumber: 1, ageMonths: 2, label: "2 mois" },
      { doseNumber: 2, ageMonths: 4, label: "4 mois" },
      { doseNumber: 3, ageMonths: 11, label: "11 mois" },
    ],
  },
  {
    code: "Hib",
    name: "Haemophilus influenzae b",
    doses: [
      { doseNumber: 1, ageMonths: 2, label: "2 mois" },
      { doseNumber: 2, ageMonths: 4, label: "4 mois" },
      { doseNumber: 3, ageMonths: 11, label: "11 mois" },
    ],
  },
  {
    code: "HepB",
    name: "Hépatite B",
    doses: [
      { doseNumber: 1, ageMonths: 2, label: "2 mois" },
      { doseNumber: 2, ageMonths: 4, label: "4 mois" },
      { doseNumber: 3, ageMonths: 11, label: "11 mois" },
    ],
  },
  {
    code: "PCV",
    name: "Pneumocoque",
    doses: [
      { doseNumber: 1, ageMonths: 2, label: "2 mois" },
      { doseNumber: 2, ageMonths: 4, label: "4 mois" },
      { doseNumber: 3, ageMonths: 11, label: "11 mois" },
    ],
  },
  {
    code: "MenC",
    name: "Méningocoque C",
    doses: [
      { doseNumber: 1, ageMonths: 5, label: "5 mois" },
      { doseNumber: 2, ageMonths: 12, label: "12 mois" },
    ],
  },
  {
    code: "ROR",
    name: "Rougeole-Oreillons-Rubéole",
    doses: [
      { doseNumber: 1, ageMonths: 12, label: "12 mois" },
      { doseNumber: 2, ageMonths: 16, label: "16-18 mois" },
    ],
  },
] as const;

// 20 examens de santé obligatoires
export const HEALTH_EXAMINATIONS = [
  { number: 1, ageLabel: "8 jours", ageDays: 8 },
  { number: 2, ageLabel: "1 mois", ageMonths: 1 },
  { number: 3, ageLabel: "2 mois", ageMonths: 2 },
  { number: 4, ageLabel: "3 mois", ageMonths: 3 },
  { number: 5, ageLabel: "4 mois", ageMonths: 4 },
  { number: 6, ageLabel: "5 mois", ageMonths: 5 },
  { number: 7, ageLabel: "6 mois", ageMonths: 6 },
  { number: 8, ageLabel: "9 mois", ageMonths: 9 },
  { number: 9, ageLabel: "12 mois", ageMonths: 12 },
  { number: 10, ageLabel: "13 mois", ageMonths: 13 },
  { number: 11, ageLabel: "16-18 mois", ageMonths: 17 },
  { number: 12, ageLabel: "2 ans", ageMonths: 24 },
  { number: 13, ageLabel: "3 ans", ageMonths: 36 },
  { number: 14, ageLabel: "4 ans", ageMonths: 48 },
  { number: 15, ageLabel: "5 ans", ageMonths: 60 },
  { number: 16, ageLabel: "6 ans", ageMonths: 72 },
  { number: 17, ageLabel: "8-9 ans", ageMonths: 102 },
  { number: 18, ageLabel: "11-13 ans", ageMonths: 144 },
  { number: 19, ageLabel: "15-16 ans", ageMonths: 186 },
  { number: 20, ageLabel: "16-18 ans", ageMonths: 204 },
] as const;

// Development milestones reference (OMS/HAS)
export const DEVELOPMENT_MILESTONES_REFERENCE = [
  // Motricité
  { category: "motricite", name: "Tient sa tête", expectedAgeMonths: 3 },
  { category: "motricite", name: "Se retourne", expectedAgeMonths: 5 },
  { category: "motricite", name: "S'assoit sans soutien", expectedAgeMonths: 8 },
  { category: "motricite", name: "Se met debout avec appui", expectedAgeMonths: 10 },
  { category: "motricite", name: "Marche seul", expectedAgeMonths: 14 },
  { category: "motricite", name: "Monte les escaliers", expectedAgeMonths: 18 },
  { category: "motricite", name: "Court", expectedAgeMonths: 20 },
  { category: "motricite", name: "Saute sur place", expectedAgeMonths: 30 },
  { category: "motricite", name: "Fait du tricycle", expectedAgeMonths: 36 },
  // Langage
  { category: "langage", name: "Gazouille", expectedAgeMonths: 3 },
  { category: "langage", name: "Babille (ba-ba, ma-ma)", expectedAgeMonths: 8 },
  { category: "langage", name: "Premier mot", expectedAgeMonths: 12 },
  { category: "langage", name: "Dit 5-10 mots", expectedAgeMonths: 18 },
  { category: "langage", name: "Associe 2 mots", expectedAgeMonths: 24 },
  { category: "langage", name: "Fait des phrases simples", expectedAgeMonths: 30 },
  { category: "langage", name: "Raconte une histoire courte", expectedAgeMonths: 36 },
  // Cognition
  { category: "cognition", name: "Suit un objet du regard", expectedAgeMonths: 2 },
  { category: "cognition", name: "Attrape un objet", expectedAgeMonths: 5 },
  { category: "cognition", name: "Permanence de l'objet", expectedAgeMonths: 9 },
  { category: "cognition", name: "Empile 2-3 cubes", expectedAgeMonths: 15 },
  { category: "cognition", name: "Tri par couleur", expectedAgeMonths: 24 },
  { category: "cognition", name: "Compte jusqu'à 3", expectedAgeMonths: 30 },
  { category: "cognition", name: "Connaît les couleurs", expectedAgeMonths: 36 },
  // Social
  { category: "social", name: "Sourire social", expectedAgeMonths: 2 },
  { category: "social", name: "Reconnaît les visages familiers", expectedAgeMonths: 4 },
  { category: "social", name: "Angoisse de séparation", expectedAgeMonths: 8 },
  { category: "social", name: "Joue à côté des autres", expectedAgeMonths: 18 },
  { category: "social", name: "Joue avec les autres", expectedAgeMonths: 30 },
  { category: "social", name: "Partage avec les autres", expectedAgeMonths: 36 },
  // Autonomie
  { category: "autonomie", name: "Tient son biberon", expectedAgeMonths: 8 },
  { category: "autonomie", name: "Mange avec les doigts", expectedAgeMonths: 10 },
  { category: "autonomie", name: "Boit au verre", expectedAgeMonths: 14 },
  { category: "autonomie", name: "Utilise une cuillère", expectedAgeMonths: 18 },
  { category: "autonomie", name: "S'habille avec aide", expectedAgeMonths: 24 },
  { category: "autonomie", name: "Propreté de jour", expectedAgeMonths: 30 },
  { category: "autonomie", name: "S'habille seul", expectedAgeMonths: 36 },
] as const;

// Échéancier fiscal annuel (dates clés)
export const FISCAL_DEADLINES = [
  { label: "Ouverture déclaration en ligne", month: 4, day: 10, description: "Début de la campagne de déclaration" },
  { label: "Date limite déclaration (zone 1)", month: 5, day: 22, description: "Départements 01 à 19 + non-résidents" },
  { label: "Date limite déclaration (zone 2)", month: 5, day: 29, description: "Départements 20 à 54" },
  { label: "Date limite déclaration (zone 3)", month: 6, day: 5, description: "Départements 55 à 976" },
  { label: "Réception avis d'imposition", month: 7, day: 25, description: "Avis disponible en ligne" },
  { label: "Solde IR (si reste à payer)", month: 9, day: 15, description: "Prélèvement du solde d'impôt" },
  { label: "Acompte prélèvement à la source", month: 9, day: 15, description: "Ajustement du taux de PAS" },
] as const;

// Mapping âge → niveau scolaire français
export const SCHOOL_LEVELS = [
  { minAge: 2, maxAge: 3, level: "TPS", label: "Toute Petite Section", type: "maternelle" },
  { minAge: 3, maxAge: 4, level: "PS", label: "Petite Section", type: "maternelle" },
  { minAge: 4, maxAge: 5, level: "MS", label: "Moyenne Section", type: "maternelle" },
  { minAge: 5, maxAge: 6, level: "GS", label: "Grande Section", type: "maternelle" },
  { minAge: 6, maxAge: 7, level: "CP", label: "CP", type: "élémentaire" },
  { minAge: 7, maxAge: 8, level: "CE1", label: "CE1", type: "élémentaire" },
  { minAge: 8, maxAge: 9, level: "CE2", label: "CE2", type: "élémentaire" },
  { minAge: 9, maxAge: 10, level: "CM1", label: "CM1", type: "élémentaire" },
  { minAge: 10, maxAge: 11, level: "CM2", label: "CM2", type: "élémentaire" },
  { minAge: 11, maxAge: 12, level: "6e", label: "Sixième", type: "collège" },
  { minAge: 12, maxAge: 13, level: "5e", label: "Cinquième", type: "collège" },
  { minAge: 13, maxAge: 14, level: "4e", label: "Quatrième", type: "collège" },
  { minAge: 14, maxAge: 15, level: "3e", label: "Troisième", type: "collège" },
  { minAge: 15, maxAge: 16, level: "2nde", label: "Seconde", type: "lycée" },
  { minAge: 16, maxAge: 17, level: "1ère", label: "Première", type: "lycée" },
  { minAge: 17, maxAge: 18, level: "Tle", label: "Terminale", type: "lycée" },
] as const;

// Darons est gratuit — pas de pricing
export const PLAN_PRICING = {
  free: { price: 0, label: "Gratuit" },
} as const;

// Sidebar navigation
export const SIDEBAR_NAVIGATION = [
  {
    group: "Vue d'ensemble",
    items: [
      { label: "Tableau de bord", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Alertes", href: "/alertes", icon: "Bell" },
    ],
  },
  {
    group: "Administratif",
    items: [
      { label: "Identité & documents", href: "/identite", icon: "IdCard" },
      { label: "Santé & vaccins", href: "/sante", icon: "HeartPulse" },
      { label: "Coffre-fort", href: "/documents", icon: "FolderLock" },
    ],
  },
  {
    group: "Éducatif",
    items: [
      { label: "Scolarité", href: "/scolarite", icon: "GraduationCap" },
      { label: "Activités", href: "/activites", icon: "Palette" },
      { label: "Développement", href: "/developpement", icon: "TrendingUp" },
    ],
  },
  {
    group: "Finances",
    items: [
      { label: "Foyer fiscal", href: "/fiscal", icon: "Calculator" },
      { label: "Budget", href: "/budget", icon: "Wallet" },
    ],
  },
  {
    group: "Services",
    items: [
      { label: "Recherche de garde", href: "/garde", icon: "Baby" },
      { label: "Démarches", href: "/demarches", icon: "ClipboardList" },
    ],
  },
  {
    group: "Santé enrichie",
    items: [
      { label: "Santé enrichie", href: "/sante-enrichie", icon: "Stethoscope" },
    ],
  },
  {
    group: "Partage",
    items: [
      { label: "Multi-foyers", href: "/partage", icon: "UsersRound" },
      { label: "Dépenses partagées", href: "/depenses-partagees", icon: "Split" },
      { label: "Parrainage", href: "/parrainage", icon: "Gift" },
    ],
  },
  {
    group: "Administration",
    items: [
      { label: "Admin SaaS", href: "/admin", icon: "BarChart3" },
    ],
  },
] as const;

// Checklist démarches administratives (grossesse → 3 ans)
// triggerAgeMonths: 0 = naissance, négatif = avant naissance, positif = après
export const DEMARCHES_CHECKLIST_TEMPLATES = [
  // Grossesse (avant naissance)
  {
    id: "declaration_grossesse",
    title: "Déclarer la grossesse",
    description: "Déclaration de grossesse auprès de la CAF et de la CPAM avant la fin du 3e mois.",
    category: "grossesse" as const,
    triggerAgeMonths: -6,
    priority: "urgent" as const,
    url: "https://www.service-public.fr/particuliers/vosdroits/F968",
  },
  {
    id: "conge_maternite",
    title: "Préparer le congé maternité",
    description: "Informer l'employeur et la CPAM du congé maternité.",
    category: "grossesse" as const,
    triggerAgeMonths: -3,
    priority: "high" as const,
    url: "https://www.service-public.fr/particuliers/vosdroits/F2265",
  },
  {
    id: "inscription_maternite",
    title: "S'inscrire à la maternité",
    description: "Réserver sa place en maternité le plus tôt possible.",
    category: "grossesse" as const,
    triggerAgeMonths: -6,
    priority: "high" as const,
  },
  {
    id: "recherche_garde",
    title: "Commencer la recherche de mode de garde",
    description: "Crèche, assistante maternelle, MAM : les places sont rares, commencez tôt.",
    category: "garde" as const,
    triggerAgeMonths: -4,
    priority: "high" as const,
  },
  {
    id: "preparation_chambre",
    title: "Préparer la chambre et les affaires",
    description: "Équipement, vêtements, poussette, siège auto.",
    category: "grossesse" as const,
    triggerAgeMonths: -2,
    priority: "normal" as const,
  },
  // Naissance (mois 0)
  {
    id: "declaration_naissance",
    title: "Déclarer la naissance en mairie",
    description: "Obligatoire dans les 5 jours suivant la naissance. Munissez-vous du certificat d'accouchement.",
    category: "naissance" as const,
    triggerAgeMonths: 0,
    priority: "urgent" as const,
    url: "https://www.service-public.fr/particuliers/vosdroits/F961",
  },
  {
    id: "livret_famille",
    title: "Mise à jour du livret de famille",
    description: "Demander la mise à jour ou la création du livret de famille en mairie.",
    category: "naissance" as const,
    triggerAgeMonths: 0,
    priority: "high" as const,
    url: "https://www.service-public.fr/particuliers/vosdroits/F1345",
  },
  {
    id: "declaration_caf",
    title: "Déclarer la naissance à la CAF",
    description: "Pour activer vos droits aux allocations (PAJE, allocations familiales).",
    category: "caf" as const,
    triggerAgeMonths: 0,
    priority: "urgent" as const,
    url: "https://www.caf.fr",
  },
  {
    id: "demande_paje",
    title: "Demander la PAJE (Prime de naissance)",
    description: "Prime de naissance de 1 019,40 € versée au 7e mois de grossesse ou à la naissance.",
    category: "caf" as const,
    triggerAgeMonths: 0,
    priority: "high" as const,
  },
  {
    id: "conge_paternite",
    title: "Déclarer le congé paternité",
    description: "25 jours calendaires (+ 3 jours naissance). À prendre dans les 6 mois.",
    category: "naissance" as const,
    triggerAgeMonths: 0,
    priority: "high" as const,
    url: "https://www.service-public.fr/particuliers/vosdroits/F3156",
  },
  {
    id: "securite_sociale_enfant",
    title: "Rattacher l'enfant à la Sécurité sociale",
    description: "Inscrire l'enfant sur la carte Vitale d'un des parents.",
    category: "sante" as const,
    triggerAgeMonths: 0,
    priority: "high" as const,
    url: "https://www.ameli.fr",
  },
  {
    id: "mutuelle_enfant",
    title: "Ajouter l'enfant à la mutuelle",
    description: "Contacter votre mutuelle pour ajouter l'enfant comme ayant droit.",
    category: "sante" as const,
    triggerAgeMonths: 0,
    priority: "normal" as const,
  },
  // 0-6 mois
  {
    id: "vaccins_2mois",
    title: "Vaccins obligatoires — 2 mois",
    description: "DTPCa, Hib, Hépatite B, Pneumocoque (1re dose).",
    category: "sante" as const,
    triggerAgeMonths: 2,
    priority: "urgent" as const,
  },
  {
    id: "examen_1mois",
    title: "Examen de santé obligatoire — 1 mois",
    description: "2e examen médical obligatoire chez le pédiatre.",
    category: "sante" as const,
    triggerAgeMonths: 1,
    priority: "high" as const,
  },
  {
    id: "demande_cmg",
    title: "Demander le CMG si mode de garde trouvé",
    description: "Complément de libre choix du mode de garde : aide financière pour crèche, assmat ou garde à domicile.",
    category: "caf" as const,
    triggerAgeMonths: 3,
    priority: "high" as const,
    url: "https://www.caf.fr/allocataires/droits-et-prestations/s-informer-sur-les-aides/petite-enfance/le-complement-de-libre-choix-du-mode-de-garde",
  },
  {
    id: "vaccins_4mois",
    title: "Vaccins obligatoires — 4 mois",
    description: "DTPCa, Hib, Hépatite B, Pneumocoque (2e dose).",
    category: "sante" as const,
    triggerAgeMonths: 4,
    priority: "urgent" as const,
  },
  {
    id: "vaccin_meningo_5mois",
    title: "Vaccin méningocoque C — 5 mois",
    description: "1re dose du vaccin méningocoque C.",
    category: "sante" as const,
    triggerAgeMonths: 5,
    priority: "urgent" as const,
  },
  // 6-12 mois
  {
    id: "bilan_9mois",
    title: "Bilan de santé — 9 mois",
    description: "Examen obligatoire avec certificat médical. Vérification développement moteur et sensoriel.",
    category: "sante" as const,
    triggerAgeMonths: 9,
    priority: "high" as const,
  },
  {
    id: "vaccins_11mois",
    title: "Vaccins obligatoires — 11 mois",
    description: "DTPCa, Hib, Hépatite B, Pneumocoque (3e dose / rappel).",
    category: "sante" as const,
    triggerAgeMonths: 11,
    priority: "urgent" as const,
  },
  // 12-24 mois
  {
    id: "vaccins_12mois",
    title: "Vaccins ROR + Méningocoque C — 12 mois",
    description: "1re dose ROR et 2e dose méningocoque C.",
    category: "sante" as const,
    triggerAgeMonths: 12,
    priority: "urgent" as const,
  },
  {
    id: "vaccin_ror_rappel",
    title: "Vaccin ROR — rappel 16-18 mois",
    description: "2e dose du vaccin ROR.",
    category: "sante" as const,
    triggerAgeMonths: 16,
    priority: "urgent" as const,
  },
  {
    id: "declaration_revenus",
    title: "Déclaration de revenus annuelle",
    description: "N'oubliez pas de déclarer les frais de garde pour le crédit d'impôt.",
    category: "fiscal" as const,
    triggerAgeMonths: 12,
    priority: "high" as const,
    url: "https://www.impots.gouv.fr",
  },
  // 24-36 mois
  {
    id: "bilan_24mois",
    title: "Bilan de santé — 24 mois",
    description: "Examen obligatoire avec certificat médical. Repérage troubles du développement.",
    category: "sante" as const,
    triggerAgeMonths: 24,
    priority: "high" as const,
  },
  {
    id: "inscription_maternelle",
    title: "Inscription en école maternelle",
    description: "Inscription en mairie puis à l'école. Généralement entre janvier et mars pour la rentrée de septembre.",
    category: "scolarite" as const,
    triggerAgeMonths: 30,
    priority: "high" as const,
    url: "https://www.service-public.fr/particuliers/vosdroits/F1864",
  },
  {
    id: "renouvellement_cmg",
    title: "Vérifier le renouvellement du CMG",
    description: "Le CMG est versé jusqu'aux 6 ans de l'enfant. Vérifiez que vos droits sont à jour.",
    category: "caf" as const,
    triggerAgeMonths: 24,
    priority: "normal" as const,
  },
  {
    id: "passeport_enfant",
    title: "Demander un passeport pour l'enfant",
    description: "Si vous prévoyez de voyager, le passeport est nécessaire même pour un bébé.",
    category: "identite" as const,
    triggerAgeMonths: 3,
    priority: "low" as const,
    url: "https://www.service-public.fr/particuliers/vosdroits/N360",
  },
] as const;

export type DemarcheTemplate = (typeof DEMARCHES_CHECKLIST_TEMPLATES)[number];

// Emergency numbers (France)
export const EMERGENCY_NUMBERS = [
  { name: "SAMU", number: "15", description: "Urgences médicales" },
  { name: "Urgences européennes", number: "112", description: "Numéro d'urgence européen" },
  { name: "Numéro d'urgence pour les sourds", number: "114", description: "Par SMS ou fax" },
  { name: "Centre antipoison", number: "01 40 05 48 48", description: "Hôpital Fernand-Widal, Paris (24h/24)" },
  { name: "SOS Médecins", number: "3624", description: "Médecin de garde à domicile" },
  { name: "Pompiers", number: "18", description: "Secours et incendies" },
  { name: "Enfance en danger", number: "119", description: "Numéro national (24h/24)" },
] as const;

// TND screening grids by age range (simplified observation items)
export const TND_SCREENING_GRIDS = [
  {
    ageRange: "3-6 mois",
    minMonths: 3,
    maxMonths: 6,
    items: [
      { category: "motricite", label: "Tient sa tête bien droite", key: "head_control" },
      { category: "motricite", label: "Attrape un objet présenté", key: "grasping" },
      { category: "motricite", label: "Se retourne du dos au ventre", key: "rolling" },
      { category: "langage", label: "Gazouille, vocalise", key: "cooing" },
      { category: "langage", label: "Réagit aux bruits", key: "sound_reaction" },
      { category: "attention", label: "Suit un objet du regard", key: "visual_tracking" },
      { category: "attention", label: "S'intéresse à son environnement", key: "environment_interest" },
      { category: "social", label: "Sourire social", key: "social_smile" },
      { category: "social", label: "Contact visuel", key: "eye_contact" },
    ],
  },
  {
    ageRange: "6-12 mois",
    minMonths: 6,
    maxMonths: 12,
    items: [
      { category: "motricite", label: "S'assoit sans soutien", key: "sitting" },
      { category: "motricite", label: "Transfert d'objet d'une main à l'autre", key: "object_transfer" },
      { category: "motricite", label: "Se déplace (à quatre pattes ou rampe)", key: "crawling" },
      { category: "langage", label: "Babille (ba-ba, ma-ma)", key: "babbling" },
      { category: "langage", label: "Répond à son prénom", key: "name_response" },
      { category: "attention", label: "Permanence de l'objet (cherche un jouet caché)", key: "object_permanence" },
      { category: "attention", label: "Explore les objets", key: "object_exploration" },
      { category: "social", label: "Angoisse de séparation", key: "separation_anxiety" },
      { category: "social", label: "Imite des gestes simples (coucou, bravo)", key: "gesture_imitation" },
    ],
  },
  {
    ageRange: "12-24 mois",
    minMonths: 12,
    maxMonths: 24,
    items: [
      { category: "motricite", label: "Marche seul", key: "walking" },
      { category: "motricite", label: "Empile 2-3 cubes", key: "stacking" },
      { category: "motricite", label: "Gribouille avec un crayon", key: "scribbling" },
      { category: "langage", label: "Dit au moins 5 mots", key: "five_words" },
      { category: "langage", label: "Montre du doigt pour désigner", key: "pointing" },
      { category: "langage", label: "Comprend des consignes simples", key: "simple_instructions" },
      { category: "attention", label: "Joue avec des jouets de manière adaptée", key: "appropriate_play" },
      { category: "attention", label: "Maintient l'attention sur une activité quelques minutes", key: "attention_span" },
      { category: "social", label: "Joue à côté des autres enfants", key: "parallel_play" },
      { category: "social", label: "Cherche le réconfort de l'adulte", key: "comfort_seeking" },
    ],
  },
  {
    ageRange: "24-36 mois",
    minMonths: 24,
    maxMonths: 36,
    items: [
      { category: "motricite", label: "Court", key: "running" },
      { category: "motricite", label: "Monte et descend les escaliers", key: "stairs" },
      { category: "motricite", label: "Saute sur place", key: "jumping" },
      { category: "langage", label: "Associe 2 mots (phrase simple)", key: "two_word_phrases" },
      { category: "langage", label: "Utilise le « je »", key: "uses_i" },
      { category: "langage", label: "Nomme des images", key: "names_pictures" },
      { category: "attention", label: "Tri par couleur ou forme", key: "sorting" },
      { category: "attention", label: "Suit une histoire courte", key: "story_following" },
      { category: "social", label: "Joue avec les autres enfants", key: "cooperative_play" },
      { category: "social", label: "Exprime ses émotions", key: "emotion_expression" },
      { category: "social", label: "Partage (avec encouragement)", key: "sharing" },
    ],
  },
] as const;

// Screen exposure recommendations by age (carnet de santé 2025)
export const SCREEN_EXPOSURE_RECOMMENDATIONS = [
  {
    ageRange: "0-2 ans",
    minMonths: 0,
    maxMonths: 24,
    recommendation: "Aucun écran recommandé",
    details: "Les écrans ne sont pas recommandés avant 2 ans. Privilégiez les interactions directes, les jeux libres et la lecture.",
    maxMinutesPerDay: 0,
  },
  {
    ageRange: "2-3 ans",
    minMonths: 24,
    maxMonths: 36,
    recommendation: "Maximum 30 minutes par jour, supervisé",
    details: "Si écran, toujours accompagné d'un adulte. Contenu adapté à l'âge. Jamais pendant les repas ni avant le coucher.",
    maxMinutesPerDay: 30,
  },
  {
    ageRange: "3-6 ans",
    minMonths: 36,
    maxMonths: 72,
    recommendation: "Maximum 1 heure par jour, supervisé",
    details: "Contenu éducatif privilégié. Pas d'écran dans la chambre. Pas d'écran 1 heure avant le coucher.",
    maxMinutesPerDay: 60,
  },
  {
    ageRange: "6+ ans",
    minMonths: 72,
    maxMonths: 216,
    recommendation: "Temps limité, règles familiales",
    details: "Définir des règles claires en famille. Pas d'écran pendant les repas, les devoirs et avant le coucher.",
    maxMinutesPerDay: 120,
  },
] as const;

// Congé parental — PreParE (barèmes 2025)
export const CONGE_PARENTAL_RATES = {
  taux_plein: 428.71,    // €/mois à taux plein
  mi_temps: 277.14,      // €/mois à mi-temps (50%)
  temps_partiel_80: 160.09, // €/mois à 80%
  duree_1er_enfant_mois: 6,   // max 6 mois par parent pour 1er enfant
  duree_2plus_enfant_mois: 24, // max 24 mois pour 2e enfant+
} as const;

// Coût moyen d'un enfant par tranche d'âge (€/mois, source INSEE/DREES 2024)
export const CHILD_COST_REFERENCE = [
  {
    ageRange: "0-1 an",
    minMonths: 0,
    maxMonths: 12,
    categories: {
      alimentation: 120,
      couches_hygiene: 80,
      garde: 600,
      vetements: 60,
      sante: 30,
      loisirs: 20,
      equipement: 80,
    },
  },
  {
    ageRange: "1-3 ans",
    minMonths: 12,
    maxMonths: 36,
    categories: {
      alimentation: 150,
      couches_hygiene: 50,
      garde: 500,
      vetements: 50,
      sante: 25,
      loisirs: 40,
      equipement: 30,
    },
  },
  {
    ageRange: "3-6 ans",
    minMonths: 36,
    maxMonths: 72,
    categories: {
      alimentation: 180,
      couches_hygiene: 20,
      garde: 200,
      vetements: 50,
      sante: 25,
      loisirs: 80,
      scolarite: 30,
    },
  },
  {
    ageRange: "6-11 ans",
    minMonths: 72,
    maxMonths: 132,
    categories: {
      alimentation: 200,
      couches_hygiene: 15,
      garde: 100,
      vetements: 60,
      sante: 30,
      loisirs: 100,
      scolarite: 40,
    },
  },
  {
    ageRange: "11-14 ans",
    minMonths: 132,
    maxMonths: 168,
    categories: {
      alimentation: 230,
      couches_hygiene: 20,
      garde: 0,
      vetements: 80,
      sante: 30,
      loisirs: 120,
      scolarite: 60,
    },
  },
  {
    ageRange: "14-18 ans",
    minMonths: 168,
    maxMonths: 216,
    categories: {
      alimentation: 250,
      couches_hygiene: 25,
      garde: 0,
      vetements: 100,
      sante: 35,
      loisirs: 150,
      scolarite: 80,
    },
  },
] as const;

// Seuils droits sociaux 2025 (fourchettes simplifiées)
export const SOCIAL_RIGHTS_THRESHOLDS = {
  allocationsFamiliales: {
    minChildren: 2,
    tranche1_plafond: 74966,   // revenus < ce seuil = taux plein
    tranche2_plafond: 99922,
    montant_2enfants_plein: 141.99,
    montant_3enfants_plein: 323.91,
    montant_par_enfant_sup: 181.92,
  },
  primeActivite: {
    plafond_solo_sans_enfant: 1885,    // revenus nets/mois
    plafond_couple_1enfant: 2794,
    montant_forfaitaire: 622.63,
  },
  rsa: {
    personne_seule: 635.71,
    couple: 953.56,
    supplement_par_enfant: 254.28,
  },
} as const;

// Error codes
export const ERROR_CODES = {
  AUTH_001: "Votre session a expiré. Veuillez vous reconnecter.",
  AUTH_002: "Cet email est déjà utilisé par un autre compte.",
  AUTH_003: "Le lien magic link a expiré. Demandez-en un nouveau.",
  HOUSEHOLD_001: "Une erreur est survenue lors de l'ajout du membre.",
  HOUSEHOLD_002: "Vous devez avoir au moins un enfant pour utiliser ce module.",
  DOC_001: "Le fichier dépasse la taille maximale (10 Mo).",
  DOC_002: "Format de fichier non supporté. Formats acceptés : PDF, JPG, PNG.",
  DOC_003: "Espace de stockage insuffisant.",
  AI_001: "Le coach IA est momentanément indisponible. Réessayez dans quelques minutes.",
  AI_002: "Vous avez atteint votre limite mensuelle de consultations IA.",
  STRIPE_001: "Le paiement a échoué. Vérifiez vos informations bancaires.",
} as const;
