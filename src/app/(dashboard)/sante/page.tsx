import type { Metadata } from "next";
import { HeartPulse, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Sant\u00e9 & vaccinations",
};

export default function SantePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sant\u00e9 & vaccinations"
        description="Suivez les vaccins, rendez-vous m\u00e9dicaux et courbes de croissance"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Enregistrer un vaccin
        </Button>
      </PageHeader>

      <Tabs defaultValue="vaccins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vaccins">Vaccins</TabsTrigger>
          <TabsTrigger value="rdv">Rendez-vous</TabsTrigger>
          <TabsTrigger value="croissance">Croissance</TabsTrigger>
        </TabsList>

        <TabsContent value="vaccins">
          <EmptyState
            icon={HeartPulse}
            title="Carnet de vaccins vierge"
            description="Le calendrier vaccinal de Matis est pr\u00eat. Commencez par enregistrer les vaccins d\u00e9j\u00e0 faits."
            actionLabel="Enregistrer un vaccin"
          />
        </TabsContent>

        <TabsContent value="rdv">
          <EmptyState
            icon={HeartPulse}
            title="Aucun rendez-vous"
            description="Planifiez et suivez les rendez-vous m\u00e9dicaux de votre famille."
            actionLabel="Ajouter un rendez-vous"
          />
        </TabsContent>

        <TabsContent value="croissance">
          <EmptyState
            icon={HeartPulse}
            title="Aucune mesure"
            description="Enregistrez les mesures de poids, taille et p\u00e9rim\u00e8tre cr\u00e2nien pour suivre la croissance."
            actionLabel="Ajouter une mesure"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
