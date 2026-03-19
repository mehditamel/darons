"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildcareSearchForm } from "@/components/garde/childcare-search-form";
import { ChildcareStructureList } from "@/components/garde/childcare-structure-list";
import { GardeCostSimulatorForm } from "@/components/garde/garde-cost-simulator-form";
import { ChildcareFavoritesList } from "@/components/garde/childcare-favorites-list";
import type { ChildcareStructure, ChildcareFavorite } from "@/types/garde";
import type { ChildcareSearchFormData } from "@/lib/validators/garde";
import {
  getChildcareStructures,
  addChildcareFavorite,
  removeChildcareFavorite,
  seedChildcareStructures,
} from "@/lib/actions/garde";

interface GardeTabsProps {
  initialFavorites: ChildcareFavorite[];
}

export function GardeTabs({ initialFavorites }: GardeTabsProps) {
  const [structures, setStructures] = useState<ChildcareStructure[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    new Set(initialFavorites.map((f) => f.structureId))
  );

  const handleSearch = useCallback(async (data: ChildcareSearchFormData) => {
    setIsLoading(true);
    try {
      // Ensure demo data exists
      await seedChildcareStructures();

      const result = await getChildcareStructures({
        query: data.query,
        structureType: data.structureType,
      });

      if (result.success && result.data) {
        setStructures(result.data);
      }
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleFavorite = useCallback(
    async (structureId: string) => {
      if (favoriteIds.has(structureId)) {
        // Find and remove
        const fav = initialFavorites.find(
          (f) => f.structureId === structureId
        );
        if (fav) {
          const result = await removeChildcareFavorite(fav.id);
          if (result.success) {
            setFavoriteIds((prev) => {
              const next = new Set(prev);
              next.delete(structureId);
              return next;
            });
          }
        }
      } else {
        const result = await addChildcareFavorite({
          structureId,
          notes: null,
          status: "shortlisted",
        });
        if (result.success) {
          setFavoriteIds((prev) => new Set(prev).add(structureId));
        }
      }
    },
    [favoriteIds, initialFavorites]
  );

  return (
    <Tabs defaultValue="recherche" className="space-y-4">
      <TabsList>
        <TabsTrigger value="recherche">Recherche</TabsTrigger>
        <TabsTrigger value="simulateur">Simulateur coût</TabsTrigger>
        <TabsTrigger value="favoris">
          Mes favoris
          {initialFavorites.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {initialFavorites.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="recherche" className="space-y-4">
        <ChildcareSearchForm onSearch={handleSearch} isLoading={isLoading} />
        <ChildcareStructureList
          structures={structures}
          favoriteIds={favoriteIds}
          onToggleFavorite={handleToggleFavorite}
          hasSearched={hasSearched}
        />
      </TabsContent>

      <TabsContent value="simulateur">
        <GardeCostSimulatorForm />
      </TabsContent>

      <TabsContent value="favoris">
        <ChildcareFavoritesList initialFavorites={initialFavorites} />
      </TabsContent>
    </Tabs>
  );
}
