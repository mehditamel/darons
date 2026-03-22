import type { Metadata } from "next";
import { Baby } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GardeTabs } from "@/components/garde/garde-tabs";
import { getChildcareFavorites } from "@/lib/actions/garde";

export const metadata: Metadata = {
  title: "Recherche de garde",
  description:
    "Trouvez le mode de garde idéal près de chez vous et estimez le coût",
};

export default async function GardePage() {
  const favoritesResult = await getChildcareFavorites();
  const favorites = favoritesResult.success ? (favoritesResult.data ?? []) : [];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Recherche de garde"
        description="Trouve la crèche ou la nounou idéale près de chez toi"
        icon={<Baby className="h-5 w-5" />}
      />

      <GardeTabs initialFavorites={favorites} />
    </div>
  );
}
