export interface FiscalYear {
  id: string;
  householdId: string;
  year: number;
  nbParts: number;
  revenuNetImposable: number | null;
  impotBrut: number | null;
  creditsImpot: Record<string, number>;
  impotNet: number | null;
  tmi: number | null;
  tauxEffectif: number | null;
  notes: string | null;
  createdAt: string;
}

export interface TaxSimulationInput {
  revenuNetImposable: number;
  nbParts: number;
  numChildren: number;
  gardeEnfantExpenses: number;
  emploiDomicileExpenses: number;
  donsOrganismes: number;
  donsAidePersonnes: number;
}

export interface TaxSimulationResult {
  revenuNetImposable: number;
  nbParts: number;
  quotientFamilial: number;
  impotBrut: number;
  decote: number;
  creditsImpot: {
    gardeEnfant: number;
    emploiDomicile: number;
    dons: number;
    donsAide: number;
    total: number;
  };
  impotNet: number;
  tmi: number;
  tauxEffectif: number;
  revenueParPart: number;
}
