"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildSelector } from "@/components/sante/child-selector";
import { ExaminationsList } from "@/components/sante-enrichie/examinations-list";
import { TndScreening } from "@/components/sante-enrichie/tnd-screening";
import dynamic from "next/dynamic";

const ScreenExposure = dynamic(() => import("@/components/sante-enrichie/screen-exposure").then((m) => m.ScreenExposure), {
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-muted" />,
  ssr: false,
});
import { DailyJournalList } from "@/components/sante-enrichie/daily-journal-list";
import { AllergiesList } from "@/components/sante-enrichie/allergies-list";
import { PrescriptionsList } from "@/components/sante-enrichie/prescriptions-list";
import { PediatricianQuestions } from "@/components/sante-enrichie/pediatrician-questions";
import { AllergenCrossAlerts } from "@/components/sante-enrichie/allergen-cross-alerts";
import { EmergencyNumbers } from "@/components/sante-enrichie/emergency-numbers";
import type { FamilyMember } from "@/types/family";
import type {
  HealthExamination,
  DailyHealthJournal,
  Allergy,
  Prescription,
} from "@/types/health";

interface SanteEnrichieTabsProps {
  childMembers: FamilyMember[];
  examinationsByMember: Record<string, HealthExamination[]>;
  journalByMember: Record<string, DailyHealthJournal[]>;
  allergiesByMember: Record<string, Allergy[]>;
  prescriptionsByMember: Record<string, Prescription[]>;
}

export function SanteEnrichieTabs({
  childMembers,
  examinationsByMember,
  journalByMember,
  allergiesByMember,
  prescriptionsByMember,
}: SanteEnrichieTabsProps) {
  const [selectedChildId, setSelectedChildId] = useState(childMembers[0]?.id ?? "");

  const selectedChild = childMembers.find((c) => c.id === selectedChildId);
  const examinations = examinationsByMember[selectedChildId] ?? [];
  const journal = journalByMember[selectedChildId] ?? [];
  const allergies = allergiesByMember[selectedChildId] ?? [];
  const prescriptions = prescriptionsByMember[selectedChildId] ?? [];

  if (!selectedChild) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun enfant dans le foyer. Ajoutez un enfant dans les paramètres pour commencer le suivi santé.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <EmergencyNumbers />

      <ChildSelector
        selectedId={selectedChildId}
        onSelect={setSelectedChildId}
      >
        {childMembers}
      </ChildSelector>

      <Tabs defaultValue="examens" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="examens">Examens</TabsTrigger>
          <TabsTrigger value="tnd">Repérage TND</TabsTrigger>
          <TabsTrigger value="ecrans">Écrans</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="ordonnances">Ordonnances</TabsTrigger>
        </TabsList>

        <TabsContent value="examens">
          <ExaminationsList member={selectedChild} examinations={examinations} />
        </TabsContent>

        <TabsContent value="tnd">
          <TndScreening member={selectedChild} examinations={examinations} />
        </TabsContent>

        <TabsContent value="ecrans">
          <ScreenExposure member={selectedChild} journal={journal} />
        </TabsContent>

        <TabsContent value="journal">
          <DailyJournalList member={selectedChild} entries={journal} />
        </TabsContent>

        <TabsContent value="allergies">
          <div className="space-y-4">
            <AllergiesList memberId={selectedChild.id} allergies={allergies} />
            {allergies.length > 0 && (
              <AllergenCrossAlerts allergies={allergies} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="ordonnances">
          <PrescriptionsList
            member={selectedChild}
            prescriptions={prescriptions}
          />
        </TabsContent>
      </Tabs>

      <PediatricianQuestions childName={selectedChild.firstName} />
    </div>
  );
}
