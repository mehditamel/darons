/**
 * Mock data for restricted government APIs (API Particulier, API Impôt)
 * Used in development when habilitations are not available
 * Enable with NEXT_PUBLIC_USE_MOCK_GOV_API=true
 */

export const MOCK_API_PARTICULIER = {
  quotientFamilial: {
    quotientFamilial: 850,
    mois: 3,
    annee: 2025,
    allocataires: [
      { nomPrenom: "TAMELGHAGHET MEHDI", dateNaissance: "1990-03-15" },
      { nomPrenom: "TAMELGHAGHET YASMINE", dateNaissance: "1993-05-15" },
    ],
    enfants: [
      { nomPrenom: "TAMELGHAGHET MATIS", dateNaissance: "2025-03-10" },
    ],
  },
  compositionFamiliale: {
    nombreAdultes: 2,
    nombreEnfants: 1,
    situationFamiliale: "marie",
  },
};

export const MOCK_API_IMPOT = {
  revenuFiscalReference: 60000,
  nombreParts: 2.5,
  situationFamille: "M",
  nombrePersonnesCharge: 1,
  montantImpot: 4500,
  anneeRevenus: 2024,
  anneeImpots: 2025,
};

export const MOCK_PRACTITIONERS = [
  {
    id: "prat-001",
    firstName: "Marie",
    lastName: "DUPONT",
    specialty: "Pédiatre",
    address: "12 rue de la République, 13001 Marseille",
    phone: "04 91 00 00 01",
    distance: 0.8,
  },
  {
    id: "prat-002",
    firstName: "Jean",
    lastName: "MARTIN",
    specialty: "Pédiatre",
    address: "45 boulevard Longchamp, 13001 Marseille",
    phone: "04 91 00 00 02",
    distance: 1.2,
  },
  {
    id: "prat-003",
    firstName: "Sophie",
    lastName: "BERNARD",
    specialty: "Dentiste pédiatrique",
    address: "8 cours Julien, 13006 Marseille",
    phone: "04 91 00 00 03",
    distance: 2.1,
  },
];

export const MOCK_SCHOOLS = [
  {
    id: "school-001",
    name: "École maternelle Les Chartreux",
    type: "Ecole maternelle",
    address: "15 rue des Chartreux",
    postalCode: "13004",
    city: "Marseille",
    phone: "04 91 00 00 10",
    status: "Public",
  },
  {
    id: "school-002",
    name: "École élémentaire Saint-Charles",
    type: "Ecole élémentaire",
    address: "28 rue Saint-Charles",
    postalCode: "13001",
    city: "Marseille",
    phone: "04 91 00 00 11",
    status: "Public",
  },
  {
    id: "school-003",
    name: "Collège Thiers",
    type: "Collège",
    address: "5 place du Lycée",
    postalCode: "13001",
    city: "Marseille",
    phone: "04 91 00 00 12",
    status: "Public",
  },
];

export const MOCK_COMMUNES = [
  {
    nom: "Marseille",
    code: "13055",
    codesPostaux: ["13001", "13002", "13003", "13004", "13005", "13006", "13007", "13008"],
    population: 873076,
    latitude: 43.2965,
    longitude: 5.3698,
  },
  {
    nom: "Paris",
    code: "75056",
    codesPostaux: ["75001", "75002", "75003", "75004", "75005"],
    population: 2165423,
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    nom: "Lyon",
    code: "69123",
    codesPostaux: ["69001", "69002", "69003", "69004", "69005"],
    population: 522969,
    latitude: 45.7640,
    longitude: 4.8357,
  },
  {
    nom: "Aix-en-Provence",
    code: "13001",
    codesPostaux: ["13090", "13100", "13290", "13540"],
    population: 147122,
    latitude: 43.5298,
    longitude: 5.4474,
  },
  {
    nom: "Toulouse",
    code: "31555",
    codesPostaux: ["31000", "31100", "31200", "31300", "31400", "31500"],
    population: 493465,
    latitude: 43.6047,
    longitude: 1.4442,
  },
];

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_GOV_API === "true";
}
