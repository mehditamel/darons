// Feature gating by subscription plan
export const PLAN_LIMITS = {
  free: {
    maxAdults: 1,
    maxChildren: 1,
    maxDocuments: 5,
    storageBytes: 500 * 1024 * 1024,
    journalEntriesPerMonth: 10,
    hasOpenBanking: false,
    hasAiCoach: false,
    hasCalendarSync: false,
    hasOcr: false,
    hasPdfExport: false,
    hasMultiHousehold: false,
    alertChannels: ["email"] as const,
  },
  premium: {
    maxAdults: Infinity,
    maxChildren: Infinity,
    maxDocuments: Infinity,
    storageBytes: 10 * 1024 * 1024 * 1024,
    journalEntriesPerMonth: Infinity,
    hasOpenBanking: true,
    hasAiCoach: true,
    hasCalendarSync: true,
    hasOcr: false,
    hasPdfExport: false,
    hasMultiHousehold: false,
    alertChannels: ["email", "push"] as const,
  },
  family_pro: {
    maxAdults: Infinity,
    maxChildren: Infinity,
    maxDocuments: Infinity,
    storageBytes: 50 * 1024 * 1024 * 1024,
    journalEntriesPerMonth: Infinity,
    hasOpenBanking: true,
    hasAiCoach: true,
    hasCalendarSync: true,
    hasOcr: true,
    hasPdfExport: true,
    hasMultiHousehold: true,
    alertChannels: ["email", "push", "sms"] as const,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

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
    name: "Dipht\u00e9rie-T\u00e9tanos-Polio-Coqueluche",
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
    name: "H\u00e9patite B",
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
    name: "M\u00e9ningocoque C",
    doses: [
      { doseNumber: 1, ageMonths: 5, label: "5 mois" },
      { doseNumber: 2, ageMonths: 12, label: "12 mois" },
    ],
  },
  {
    code: "ROR",
    name: "Rougeole-Oreillons-Rub\u00e9ole",
    doses: [
      { doseNumber: 1, ageMonths: 12, label: "12 mois" },
      { doseNumber: 2, ageMonths: 18, label: "16-18 mois" },
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

// Plan pricing
export const PLAN_PRICING = {
  free: { price: 0, label: "Gratuit" },
  premium: { price: 9.90, label: "Premium" },
  family_pro: { price: 19.90, label: "Family Pro" },
} as const;

// Sidebar navigation
export const SIDEBAR_NAVIGATION = [
  {
    group: "Vue d'ensemble",
    items: [
      { label: "Tableau de bord", href: "/", icon: "LayoutDashboard" },
    ],
  },
  {
    group: "Administratif",
    items: [
      { label: "Identit\u00e9 & documents", href: "/identite", icon: "IdCard" },
      { label: "Sant\u00e9 & vaccins", href: "/sante", icon: "HeartPulse" },
      { label: "Coffre-fort", href: "/documents", icon: "FolderLock" },
    ],
  },
  {
    group: "\u00c9ducatif",
    items: [
      { label: "Scolarit\u00e9", href: "/scolarite", icon: "GraduationCap" },
      { label: "Activit\u00e9s", href: "/activites", icon: "Palette" },
      { label: "D\u00e9veloppement", href: "/developpement", icon: "TrendingUp" },
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
      { label: "D\u00e9marches", href: "/demarches", icon: "ClipboardList" },
    ],
  },
] as const;

// Error codes
export const ERROR_CODES = {
  AUTH_001: "Votre session a expir\u00e9. Veuillez vous reconnecter.",
  AUTH_002: "Cet email est d\u00e9j\u00e0 utilis\u00e9 par un autre compte.",
  AUTH_003: "Le lien magic link a expir\u00e9. Demandez-en un nouveau.",
  HOUSEHOLD_001: "Nombre maximum de membres atteint pour votre plan.",
  HOUSEHOLD_002: "Vous devez avoir au moins un enfant pour utiliser ce module.",
  DOC_001: "Le fichier d\u00e9passe la taille maximale (10 Mo).",
  DOC_002: "Format de fichier non support\u00e9. Formats accept\u00e9s : PDF, JPG, PNG.",
  DOC_003: "Espace de stockage insuffisant. Passez au plan sup\u00e9rieur.",
  AI_001: "Le coach IA est momentan\u00e9ment indisponible. R\u00e9essayez dans quelques minutes.",
  AI_002: "Vous avez atteint votre limite mensuelle de consultations IA.",
  STRIPE_001: "Le paiement a \u00e9chou\u00e9. V\u00e9rifiez vos informations bancaires.",
  STRIPE_002: "Votre abonnement a expir\u00e9. Renouvelez pour continuer.",
} as const;
