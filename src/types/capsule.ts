export type MemoryType = "photo" | "video" | "note";

export interface Memory {
  id: string;
  householdId: string;
  memberId: string;
  memoryType: MemoryType;
  filePath: string | null;
  mimeType: string | null;
  fileSize: number | null;
  caption: string | null;
  memoryDate: string;
  tags: string[] | null;
  createdBy: string | null;
  createdAt: string;
}

export interface MemoryWithUrl extends Memory {
  signedUrl: string | null;
}

export type RecapPeriod = "quarter" | "year" | "custom";
export type RecapStatus = "generating" | "ready" | "failed";

export interface CapsuleRecap {
  id: string;
  householdId: string;
  memberId: string;
  periodType: RecapPeriod;
  periodStart: string;
  periodEnd: string;
  title: string | null;
  content: CapsuleContent;
  coverMemoryId: string | null;
  status: RecapStatus;
  errorMessage: string | null;
  generatedAt: string;
}

export interface CapsuleSection {
  kind: "jalons" | "sante" | "moments" | "premieres_fois" | "chiffres";
  title: string;
  items: string[];
}

export interface CapsuleContent {
  title: string;
  intro: string;
  sections: CapsuleSection[];
  stats?: Record<string, string | number>;
  message_for_later?: string;
}

export interface CapsuleRecapWithMember extends CapsuleRecap {
  memberFirstName: string;
  memberLastName: string;
}

export function periodLabel(periodType: RecapPeriod, periodStart: string): string {
  const date = new Date(periodStart);
  const month = date.getMonth();
  const year = date.getFullYear();
  if (periodType === "year") return `Année ${year}`;
  if (periodType === "quarter") {
    const seasonStart = ["Hiver", "Printemps", "Été", "Automne"];
    const seasonIdx = Math.floor(month / 3);
    return `${seasonStart[seasonIdx]} ${year}`;
  }
  return new Date(periodStart).toLocaleDateString("fr-FR");
}
