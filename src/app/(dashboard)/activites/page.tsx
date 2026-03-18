import type { Metadata } from "next";
import { Palette, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Activit\u00e9s & loisirs",
};

export default function ActivitesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Activit\u00e9s & loisirs"
        description="G\u00e9rez les activit\u00e9s extra-scolaires et le planning hebdomadaire"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une activit\u00e9
        </Button>
      </PageHeader>

      <EmptyState
        icon={Palette}
        title="Aucune activit\u00e9 enregistr\u00e9e"
        description="Ajoutez les activit\u00e9s de vos enfants : sport, musique, \u00e9veil... et suivez le planning familial."
        actionLabel="Ajouter une activit\u00e9"
      />
    </div>
  );
}
