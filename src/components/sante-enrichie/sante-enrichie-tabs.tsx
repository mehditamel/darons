"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildSelector } from "@/components/sante/child-selector";
import { ExaminationsList } from "@/components/sante-enrichie/examinations-list";
import { TndScreening } from "@/components/sante-enrichie/tnd-screening";
import { ScreenExposure } from "@/components/sante-enrichie/screen-exposure";
import { DailyJournalList } from "@/components/sante-enrichie/daily-journal-list";
import { AllergiesList } from "@/components/sante-enrichie/allergies-list";
import { PrescriptionsList } from "@/components/sante-enrichie/prescriptions-list";
import { EmergencyNumbers } from "@/components/sante-enrichie/emergency-numbers";
import type { FamilyMember } from "@/types/family";
import type {
  HealthExamination,
  DailyHealthJournal,
  Allergy,
  Prescription,
} from "@/types/health";

interface SanteEnrichieTabsProps {
  children: FamilyMember[];
  examinationsByMember: Record<string, HealthExamination[]>;
  journalByMember: Record<string, DailyHealthJournal[]>;
  allergiesByMember: Record<string, Allergy[]>;
  prescriptionsByMember: Record<string, Prescription[]>;
}

export function SanteEnrichieTabs({
  children,
  examinationsByMember,
  journalByMember,
  allergiesByMember,
  prescriptionsByMember,
}: SanteEnrichieTabsProps) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? "");

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const examinations = examinationsByMember[selectedChildId] ?? [];
  const journal = journalByMember[selectedChildId] ?? [];
  const allergies = allergiesByMember[selectedChildId] ?? [];
  const prescriptions = prescriptionsByMember[selectedChildId] ?? [];

  if (!selectedChild) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun enfant dans le foyer. Ajoutez un enfant dans les param\u00e8tres pour commencer le suivi sant\u00e9.
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
        {children}
      </ChildSelector>

      <Tabs defaultValue="examens" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="examens">Examens</TabsTrigger>
          <TabsTrigger value="tnd">Rep\u00e9rage TND</TabsTrigger>
          <TabsTrigger value="ecrans">\u00c9crans</TabsTrigger>
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
          <AllergiesList memberId={selectedChild.id} allergies={allergies} />
        </TabsContent>

        <TabsContent value="ordonnances">
          <PrescriptionsList
            member={selectedChild}
            prescriptions={prescriptions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
