"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildSelector } from "@/components/sante/child-selector";
import { VaccinationCalendar } from "@/components/sante/vaccination-calendar";
import { AppointmentList } from "@/components/sante/appointment-list";
import { GrowthChart } from "@/components/sante/growth-chart";
import type { FamilyMember } from "@/types/family";
import type { Vaccination, MedicalAppointment, GrowthMeasurement } from "@/types/health";

interface SanteTabsProps {
  children: FamilyMember[];
  vaccinationsByMember: Record<string, Vaccination[]>;
  appointmentsByMember: Record<string, MedicalAppointment[]>;
  measurementsByMember: Record<string, GrowthMeasurement[]>;
}

export function SanteTabs({
  children,
  vaccinationsByMember,
  appointmentsByMember,
  measurementsByMember,
}: SanteTabsProps) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? "");

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const vaccinations = vaccinationsByMember[selectedChildId] ?? [];
  const appointments = appointmentsByMember[selectedChildId] ?? [];
  const measurements = measurementsByMember[selectedChildId] ?? [];

  if (!selectedChild) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun enfant dans le foyer. Ajoutez un enfant dans les paramètres pour commencer le suivi santé.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ChildSelector
        selectedId={selectedChildId}
        onSelect={setSelectedChildId}
      >
        {children}
      </ChildSelector>

      <Tabs defaultValue="vaccins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vaccins">Vaccins</TabsTrigger>
          <TabsTrigger value="rdv">Rendez-vous</TabsTrigger>
          <TabsTrigger value="croissance">Croissance</TabsTrigger>
        </TabsList>

        <TabsContent value="vaccins">
          <VaccinationCalendar member={selectedChild} vaccinations={vaccinations} />
        </TabsContent>

        <TabsContent value="rdv">
          <AppointmentList memberId={selectedChild.id} appointments={appointments} />
        </TabsContent>

        <TabsContent value="croissance">
          <GrowthChart member={selectedChild} measurements={measurements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
