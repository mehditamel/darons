import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Foyer fiscal",
};

export default function FiscalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Foyer fiscal"
        description="Simulation IR, cr\u00e9dits d'imp\u00f4t et \u00e9ch\u00e9ancier fiscal"
      />

      <Tabs defaultValue="simulation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulation">Simulation IR</TabsTrigger>
          <TabsTrigger value="credits">Cr\u00e9dits d&apos;imp\u00f4t</TabsTrigger>
          <TabsTrigger value="echeancier">\u00c9ch\u00e9ancier</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation">
          <EmptyState
            icon={Calculator}
            title="Simulateur d'imp\u00f4t sur le revenu"
            description="Estimez votre imp\u00f4t 2025, optimisez votre quotient familial et d\u00e9couvrez vos \u00e9conomies possibles."
            actionLabel="Lancer une simulation"
          />
        </TabsContent>

        <TabsContent value="credits">
          <EmptyState
            icon={Calculator}
            title="Cr\u00e9dits et r\u00e9ductions"
            description="D\u00e9tail des cr\u00e9dits d'imp\u00f4t : garde d'enfant, emploi \u00e0 domicile, dons..."
            actionLabel="Configurer mes cr\u00e9dits"
          />
        </TabsContent>

        <TabsContent value="echeancier">
          <EmptyState
            icon={Calculator}
            title="\u00c9ch\u00e9ancier fiscal"
            description="Visualisez les dates cl\u00e9s : d\u00e9claration, acomptes, solde. Ne manquez plus aucune \u00e9ch\u00e9ance."
            actionLabel="Voir l'\u00e9ch\u00e9ancier"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
