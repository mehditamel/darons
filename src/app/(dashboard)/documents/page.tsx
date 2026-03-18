import type { Metadata } from "next";
import { FolderLock, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Coffre-fort num\u00e9rique",
};

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Coffre-fort num\u00e9rique"
        description="Stockez et organisez tous les documents importants de votre famille"
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Importer un document
        </Button>
      </PageHeader>

      <EmptyState
        icon={FolderLock}
        title="Votre coffre-fort est vide"
        description="Importez vos documents importants : pi\u00e8ces d'identit\u00e9, ordonnances, factures, bulletins scolaires..."
        actionLabel="Importer un document"
      />
    </div>
  );
}
