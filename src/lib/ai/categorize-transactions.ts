import { callClaude, parseJsonResponse } from "./anthropic";

const CATEGORIZE_PROMPT = `Tu es un assistant spécialisé dans la catégorisation de transactions bancaires pour un foyer familial français.

Pour chaque transaction, attribue UNE catégorie parmi :
- alimentation (courses, restaurants, boulangerie)
- sante (pharmacie, médecin, mutuelle, hôpital)
- garde (crèche, assistante maternelle, babysitter)
- vetements (magasins de vêtements, chaussures)
- loisirs (jouets, sorties, vacances, sport)
- scolarite (fournitures, cantine, activités scolaires)
- transport (carburant, transports en commun, parking)
- logement (loyer, charges, travaux, mobilier)
- assurance (primes d'assurance, cotisations)
- autre (tout ce qui ne rentre pas dans les catégories ci-dessus)

TRANSACTIONS À CATÉGORISER :
{transactions}

Réponds UNIQUEMENT en JSON, un tableau d'objets :
[{"id": "...", "category": "..."}]`;

interface TransactionInput {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface CategorizationResult {
  id: string;
  category: string;
}

export async function categorizeTransactions(
  transactions: TransactionInput[]
): Promise<CategorizationResult[]> {
  if (transactions.length === 0) return [];

  const batch = transactions.slice(0, 20);
  const txList = batch
    .map(
      (tx) =>
        `- id: ${tx.id}, description: "${tx.description}", montant: ${tx.amount}€, date: ${tx.date}`
    )
    .join("\n");

  const prompt = CATEGORIZE_PROMPT.replace("{transactions}", txList);

  try {
    const systemPrompt =
      "Tu es un assistant de catégorisation de transactions bancaires. Réponds uniquement en JSON valide.";
    const result = await callClaude(systemPrompt, prompt, 512);
    const parsed = parseJsonResponse<CategorizationResult[]>(result);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
