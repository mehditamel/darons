import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { FiscalTabs } from "@/components/fiscal/fiscal-tabs";
import { getFamilyMembers } from "@/lib/actions/family";
import { getFiscalYears } from "@/lib/actions/fiscal";

export const metadata: Metadata = {
  title: "Foyer fiscal",
  description: "Simulation IR, crédits d'impôt et échéancier fiscal",
};

export default async function FiscalPage() {
  const [membersResult, fiscalResult] = await Promise.all([
    getFamilyMembers(),
    getFiscalYears(),
  ]);

  const members = membersResult.data ?? [];
  const adults = members.filter((m) => m.memberType === "adult");
  const children = members.filter((m) => m.memberType === "child");

  // Calculate default parts: 2 per couple (or 1 if single) + 0.5 per child (first 2), +1 per child after
  const adultParts = Math.min(adults.length, 2);
  const childParts = children.reduce((acc, _, index) => {
    return acc + (index < 2 ? 0.5 : 1);
  }, 0);
  const defaultNbParts = adultParts + childParts;

  const savedFiscalYears = fiscalResult.data ?? [];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Foyer fiscal"
        description="Tes impôts, on t'aide à payer moins"
        icon={<Calculator className="h-5 w-5" />}
      />

      <FiscalTabs
        defaultNbParts={defaultNbParts || 1}
        defaultNumChildren={children.length}
        savedFiscalYears={savedFiscalYears}
      />
    </div>
  );
}
