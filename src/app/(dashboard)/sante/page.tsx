import type { Metadata } from "next";
import { HeartPulse } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SanteTabs } from "@/components/sante/sante-tabs";
import { PractitionerSearch } from "@/components/sante/practitioner-search";
import { MESConnectionCard } from "@/components/sante/mes-connection-card";
import { getFamilyMembers } from "@/lib/actions/family";
import { getVaccinations, getMedicalAppointments, getGrowthMeasurements } from "@/lib/actions/health";
import type { Vaccination, MedicalAppointment, GrowthMeasurement } from "@/types/health";

export const metadata: Metadata = {
  title: "Santé & vaccinations",
  description: "Calendrier vaccinal, courbes de croissance et rendez-vous médicaux de vos enfants",
};

export default async function SantePage() {
  const membersResult = await getFamilyMembers();
  const allMembers = membersResult.data ?? [];
  const children = allMembers.filter((m) => m.memberType === "child");

  const vaccinationsByMember: Record<string, Vaccination[]> = {};
  const appointmentsByMember: Record<string, MedicalAppointment[]> = {};
  const measurementsByMember: Record<string, GrowthMeasurement[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const [vacc, appt, growth] = await Promise.all([
        getVaccinations(child.id),
        getMedicalAppointments(child.id),
        getGrowthMeasurements(child.id),
      ]);
      vaccinationsByMember[child.id] = vacc.data ?? [];
      appointmentsByMember[child.id] = appt.data ?? [];
      measurementsByMember[child.id] = growth.data ?? [];
    })
  );

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Santé & vaccinations"
        description="Les vaccins, la croissance, les RDV — tout est là"
        icon={<HeartPulse className="h-5 w-5" />}
      />

      <MESConnectionCard
        childMembers={children.map((c) => ({ id: c.id, firstName: c.firstName }))}
      />

      <SanteTabs
        vaccinationsByMember={vaccinationsByMember}
        appointmentsByMember={appointmentsByMember}
        measurementsByMember={measurementsByMember}
      >
        {children}
      </SanteTabs>

      <PractitionerSearch />
    </div>
  );
}
