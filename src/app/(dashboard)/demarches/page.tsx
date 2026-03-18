import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "D\u00e9marches & droits",
};

export default function DemarchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="D\u00e9marches & droits"
        description="Checklist des d\u00e9marches administratives et simulation de vos droits sociaux"
      />

      <EmptyState
        icon={ClipboardList}
        title="Vos d\u00e9marches en un coup d'\u0153il"
        description="D\u00e9couvrez les d\u00e9marches \u00e0 effectuer selon l'\u00e2ge de vos enfants et simulez vos droits aux allocations."
        actionLabel="D\u00e9couvrir mes d\u00e9marches"
      />
    </div>
  );
}
