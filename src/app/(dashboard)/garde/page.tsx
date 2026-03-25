import type { Metadata } from "next";
import { Baby, Heart, MapPin, Euro } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { GardeTabs } from "@/components/garde/garde-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getChildcareFavorites, getChildcareStructures } from "@/lib/actions/garde";
import { getFamilyMembers } from "@/lib/actions/family";
import { calculateAge, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recherche de garde",
  description:
    "Trouvez le mode de garde idéal près de chez vous et estimez le coût",
};

export default async function GardePage() {
  const [favoritesResult, structuresResult, membersResult] = await Promise.all([
    getChildcareFavorites(),
    getChildcareStructures(),
    getFamilyMembers(),
  ]);

  const favorites = favoritesResult.success ? (favoritesResult.data ?? []) : [];
  const structures = structuresResult.success ? (structuresResult.data ?? []) : [];
  const members = membersResult.data ?? [];
  const children = members.filter((m) => m.memberType === "child");

  // Calculate average hourly rate from structures
  const structuresWithRate = structures.filter((s) => s.hourlyRate && s.hourlyRate > 0);
  const avgHourlyRate = structuresWithRate.length > 0
    ? structuresWithRate.reduce((acc, s) => acc + (s.hourlyRate ?? 0), 0) / structuresWithRate.length
    : null;

  // Check if any child is approaching the end of CMG eligibility (> 3 years old for crèche)
  const childrenApproachingCmgEnd = children.filter((child) => {
    const age = calculateAge(child.birthDate);
    return age.years >= 2 && age.years < 4;
  });

  // Check for children under 3 who might need childcare
  const childrenNeedingCare = children.filter((child) => {
    const age = calculateAge(child.birthDate);
    return age.years < 6;
  });

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Recherche de garde"
        description="Trouve la crèche ou la nounou idéale près de chez toi"
        icon={<Baby className="h-5 w-5" />}
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Favoris"
          value={String(favorites.length)}
          icon={Heart}
          color="bg-warm-red/10 text-warm-red"
          gradientClass="card-gradient-red"
        />
        <StatCard
          label="Structures disponibles"
          value={String(structures.length)}
          icon={MapPin}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Tarif moyen/heure"
          value={avgHourlyRate ? formatCurrency(avgHourlyRate) : "—"}
          icon={Euro}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
        />
      </div>

      {/* Quick access to simulators */}
      {childrenNeedingCare.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Simulateurs rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/outils/simulateur-garde">
                <Euro className="h-4 w-4 mr-2" />
                Simuler le coût de garde
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/outils/simulateur-caf">
                <Baby className="h-4 w-4 mr-2" />
                Simuler tes droits PAJE / CMG
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Alert: CMG approaching end */}
      {childrenApproachingCmgEnd.map((child) => {
        const age = calculateAge(child.birthDate);
        if (age.years >= 3) {
          return (
            <AlertCard
              key={child.id}
              title={`CMG crèche : fin pour ${child.firstName}`}
              message={`${child.firstName} a ${age.label}. Le CMG pour la crèche s'arrête au 6e anniversaire, mais pense à anticiper le relai (périscolaire, nounou).`}
              priority="medium"
              category="Garde"
              actionUrl="/demarches"
            />
          );
        }
        return null;
      })}

      {/* Alert if no favorites yet */}
      {favorites.length === 0 && childrenNeedingCare.length > 0 && (
        <AlertCard
          title="Aucune structure en favoris"
          message="Recherche des crèches et nounous près de chez toi et ajoute-les en favoris pour suivre tes candidatures."
          priority="low"
          category="Garde"
        />
      )}

      <GardeTabs initialFavorites={favorites} />
    </div>
  );
}
