import type { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "D\u00e9veloppement",
};

export default function DeveloppementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="D\u00e9veloppement"
        description="Suivez les jalons de d\u00e9veloppement et tenez le journal parental"
      />

      <Tabs defaultValue="jalons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jalons">Jalons</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>

        <TabsContent value="jalons">
          <EmptyState
            icon={TrendingUp}
            title="Jalons de d\u00e9veloppement"
            description="Suivez la motricit\u00e9, le langage, la cognition et les comp\u00e9tences sociales de Matis selon les r\u00e9f\u00e9rentiels OMS/HAS."
            actionLabel="D\u00e9couvrir les jalons"
          />
        </TabsContent>

        <TabsContent value="journal">
          <EmptyState
            icon={TrendingUp}
            title="Le journal de votre famille"
            description="Notez les premiers mots, les fous rires, les petites victoires. Vous serez contents de les relire."
            actionLabel="\u00c9crire une premi\u00e8re note"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
