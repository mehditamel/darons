import type { Metadata } from "next";
import { Wallet, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Budget familial",
};

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget familial"
        description="Suivez vos d\u00e9penses, allocations CAF et reste \u00e0 charge"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une d\u00e9pense
        </Button>
      </PageHeader>

      <EmptyState
        icon={Wallet}
        title="Votre budget vous attend"
        description="Connectez votre banque pour un suivi automatique, ou ajoutez vos d\u00e9penses manuellement."
        actionLabel="Connecter ma banque"
        secondaryLabel="Saisie manuelle"
      />
    </div>
  );
}
