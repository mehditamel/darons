import type { Metadata } from "next";
import { Baby } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Recherche de garde",
};

export default function GardePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Recherche de garde"
        description="Trouvez le mode de garde id\u00e9al pr\u00e8s de chez vous et estimez le co\u00fbt"
      />

      <Tabs defaultValue="recherche" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recherche">Recherche</TabsTrigger>
          <TabsTrigger value="simulateur">Simulateur co\u00fbt</TabsTrigger>
          <TabsTrigger value="favoris">Mes favoris</TabsTrigger>
        </TabsList>

        <TabsContent value="recherche">
          <EmptyState
            icon={Baby}
            title="Recherche de modes de garde"
            description="Trouvez cr\u00e8ches, assistantes maternelles, MAM et accueils de loisirs autour de votre domicile."
            actionLabel="Lancer une recherche"
          />
        </TabsContent>

        <TabsContent value="simulateur">
          <EmptyState
            icon={Baby}
            title="Simulateur de co\u00fbt"
            description="Estimez votre reste \u00e0 charge apr\u00e8s CMG selon vos revenus et le mode de garde choisi."
            actionLabel="Simuler le co\u00fbt"
          />
        </TabsContent>

        <TabsContent value="favoris">
          <EmptyState
            icon={Baby}
            title="Aucun favori"
            description="Ajoutez des structures en favoris pour les comparer facilement."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
