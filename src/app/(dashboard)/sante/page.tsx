import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SanteTabs } from "@/components/sante/sante-tabs";
import { getFamilyMembers } from "@/lib/actions/family";
import { getVaccinations, getMedicalAppointments, getGrowthMeasurements } from "@/lib/actions/health";
import type { Vaccination, MedicalAppointment, GrowthMeasurement } from "@/types/health";

export const metadata: Metadata = {
  title: "Santé & vaccinations",
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
    <div className="space-y-6">
      <PageHeader
        title="Santé & vaccinations"
        description="Suivez les vaccins, rendez-vous médicaux et courbes de croissance"
      />

      <SanteTabs
        vaccinationsByMember={vaccinationsByMember}
        appointmentsByMember={appointmentsByMember}
        measurementsByMember={measurementsByMember}
      >
        {children}
      </SanteTabs>
    </div>
  );
}
