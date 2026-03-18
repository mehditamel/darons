import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Scolarit\u00e9",
};

export default function ScolaritePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scolarit\u00e9"
        description="Timeline pr\u00e9visionnelle et suivi de la scolarit\u00e9 de vos enfants"
      />

      <EmptyState
        icon={GraduationCap}
        title="Timeline scolaire"
        description="Matis entrera en cr\u00e8che puis en maternelle. Visualisez les \u00e9tapes cl\u00e9s et les dates d'inscription."
        actionLabel="Configurer la timeline"
      />
    </div>
  );
}
