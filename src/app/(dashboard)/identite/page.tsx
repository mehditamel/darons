import type { Metadata } from "next";
import { IdCard, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Identit\u00e9 & documents",
};

export default function IdentitePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Identit\u00e9 & documents"
        description="G\u00e9rez les pi\u00e8ces d'identit\u00e9 de votre famille et recevez des alertes d'expiration"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un document
        </Button>
      </PageHeader>

      <EmptyState
        icon={IdCard}
        title="Aucun document enregistr\u00e9"
        description="Ajoutez les pi\u00e8ces d'identit\u00e9 de votre famille pour ne plus jamais oublier une date d'expiration."
        actionLabel="Ajouter un premier document"
      />
    </div>
  );
}
