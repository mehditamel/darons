/**
 * Cross-reference table: common allergens → foods/products that may contain them.
 * Used to show warnings when an allergy is recorded.
 */
export const ALLERGEN_CROSS_REFERENCE: Record<
  string,
  { label: string; foods: string[]; advice: string }
> = {
  arachide: {
    label: "Arachide",
    foods: [
      "Beurre de cacahuète",
      "Huile d'arachide",
      "Plats asiatiques (pad thaï, satay)",
      "Certaines céréales et barres de céréales",
      "Pâtisseries industrielles",
      "Glaces et sorbets",
      "Sauces type pesto (certaines recettes)",
    ],
    advice:
      "Vérifier systématiquement les étiquettes (mention obligatoire). Avoir une trousse d'urgence avec adrénaline auto-injectable si prescrite.",
  },
  "lait de vache": {
    label: "Protéines de lait de vache (PLV)",
    foods: [
      "Lait, yaourts, fromages",
      "Beurre, crème fraîche",
      "Pâtisseries et viennoiseries",
      "Chocolat au lait",
      "Purée en flocons",
      "Certaines charcuteries",
      "Sauces béchamel, carbonara",
    ],
    advice:
      "Privilégier les laits végétaux enrichis en calcium. Lire les étiquettes : caséine, lactosérum, lactose = dérivés du lait.",
  },
  oeuf: {
    label: "Œuf",
    foods: [
      "Pâtes aux œufs",
      "Mayonnaise",
      "Meringues, macarons",
      "Pâtisseries et crêpes",
      "Panures et beignets",
      "Certaines glaces",
      "Surimi",
    ],
    advice:
      "L'allergie à l'œuf disparaît souvent avant 6 ans. Certains enfants tolèrent l'œuf cuit mais pas cru. À discuter avec l'allergologue.",
  },
  gluten: {
    label: "Gluten (blé, seigle, orge, avoine)",
    foods: [
      "Pain, pâtes, semoule",
      "Biscuits et gâteaux",
      "Pizzas, quiches, tartes",
      "Certaines sauces (épaissies à la farine)",
      "Bière (pour les ados)",
      "Chapelure, panure",
    ],
    advice:
      "Distinguer allergie au gluten, maladie cœliaque et sensibilité non cœliaque. Seul un bilan médical peut trancher.",
  },
  "fruits à coque": {
    label: "Fruits à coque",
    foods: [
      "Noix, noisettes, amandes, cajou, pistaches, noix de pécan",
      "Pâtes à tartiner (Nutella, pralinés)",
      "Muesli et granola",
      "Pâtisseries (financiers, cookies)",
      "Huiles de noix",
      "Certains fromages (roquefort aux noix)",
    ],
    advice:
      "Allergie croisée fréquente entre fruits à coque. Prudence avec tous les fruits à coque même si allergie identifiée à un seul.",
  },
  poisson: {
    label: "Poisson",
    foods: [
      "Surimi, tarama",
      "Sauce Worcestershire",
      "Bouillons de poisson (soupes, risottos)",
      "Certains plats asiatiques (nuoc-mâm, sauce soja au poisson)",
      "Oméga-3 en complément alimentaire",
    ],
    advice:
      "L'allergie au poisson ne signifie pas forcément allergie aux crustacés (et inversement). Tester séparément.",
  },
  crustaces: {
    label: "Crustacés et mollusques",
    foods: [
      "Crevettes, crabes, homard, langoustines",
      "Moules, huîtres, calamars",
      "Bisques et soupes de crustacés",
      "Paella, sushis",
      "Glucosamine (complément alimentaire)",
    ],
    advice:
      "Allergie potentiellement sévère. Risque d'allergie croisée avec les acariens (tropomyosine commune).",
  },
  soja: {
    label: "Soja",
    foods: [
      "Sauce soja, tofu, miso",
      "Lait de soja et yaourts au soja",
      "Lécithine de soja (très répandue dans l'industrie)",
      "Huile de soja",
      "Protéines de soja texturées",
    ],
    advice:
      "La lécithine de soja est généralement tolérée même en cas d'allergie aux protéines de soja. Vérifier avec l'allergologue.",
  },
};

/**
 * Find matching allergens for a given allergy name.
 * Uses fuzzy matching (lowercase, includes).
 */
export function findAllergenMatches(
  allergenName: string
): { label: string; foods: string[]; advice: string }[] {
  const normalized = allergenName.toLowerCase().trim();
  const matches: { label: string; foods: string[]; advice: string }[] = [];

  for (const [key, value] of Object.entries(ALLERGEN_CROSS_REFERENCE)) {
    if (
      normalized.includes(key) ||
      key.includes(normalized) ||
      value.label.toLowerCase().includes(normalized) ||
      normalized.includes(value.label.toLowerCase())
    ) {
      matches.push(value);
    }
  }

  return matches;
}
