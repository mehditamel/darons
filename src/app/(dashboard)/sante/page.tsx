import type { Metadata } from "next";
import {
  HeartPulse,
  Syringe,
  Calendar,
  Ruler,
  CheckCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { SanteTabs } from "@/components/sante/sante-tabs";
import { PractitionerSearch } from "@/components/sante/practitioner-search";
import { MESConnectionCard } from "@/components/sante/mes-connection-card";
import { getFamilyMembers } from "@/lib/actions/family";
import { getVaccinations, getMedicalAppointments, getGrowthMeasurements } from "@/lib/actions/health";
import { VACCINATION_SCHEDULE } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils";
import type { Vaccination, MedicalAppointment, GrowthMeasurement } from "@/types/health";

export const metadata: Metadata = {
  title: "Santé & vaccinations",
  description: "Calendrier vaccinal, courbes de croissance et rendez-vous médicaux de vos enfants",
};

function countExpectedDoses(childAgeMonths: number): number {
  let count = 0;
  for (const vaccine of VACCINATION_SCHEDULE) {
    for (const dose of vaccine.doses) {
      if (dose.ageMonths <= childAgeMonths + 1) {
        count++;
      }
    }
  }
  return count;
}

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

  // Aggregate stats across all children
  const allVaccinations = Object.values(vaccinationsByMember).flat();
  const allAppointments = Object.values(appointmentsByMember).flat();
  const allMeasurements = Object.values(measurementsByMember).flat();

  const vaccinsDone = allVaccinations.filter((v) => v.status === "done").length;
  const vaccinsOverdue = allVaccinations.filter((v) => v.status === "overdue");

  // Total expected doses across all children
  const now = new Date();
  let totalExpectedDoses = 0;
  for (const child of children) {
    const ageMonths = Math.floor(
      (now.getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
    );
    totalExpectedDoses += countExpectedDoses(ageMonths);
  }

  // Upcoming appointments (future, not completed)
  const upcomingAppointments = allAppointments.filter(
    (a) => !a.completed && new Date(a.appointmentDate) > now,
  );

  // Appointments in the next 48h
  const soonAppointments = upcomingAppointments.filter((a) => {
    const diff = new Date(a.appointmentDate).getTime() - now.getTime();
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  });

  const completedAppointments = allAppointments.filter((a) => a.completed).length;

  // Latest measurement
  const latestMeasurement = allMeasurements.length > 0
    ? allMeasurements.sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime())[0]
    : null;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Santé & vaccinations"
        description="Les vaccins, la croissance, les RDV — tout est là"
        icon={<HeartPulse className="h-5 w-5" />}
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Vaccins faits"
          value={totalExpectedDoses > 0 ? `${vaccinsDone}/${totalExpectedDoses}` : String(vaccinsDone)}
          icon={Syringe}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
          trend={totalExpectedDoses > 0 ? `${Math.round((vaccinsDone / totalExpectedDoses) * 100)}%` : undefined}
          trendUp={vaccinsDone > 0}
        />
        <StatCard
          label="RDV à venir"
          value={String(upcomingAppointments.length)}
          icon={Calendar}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="RDV complétés"
          value={String(completedAppointments)}
          icon={CheckCircle}
          color="bg-warm-green/10 text-warm-green"
          gradientClass="card-gradient-green"
        />
        <StatCard
          label="Dernière mesure"
          value={latestMeasurement ? formatRelativeDate(latestMeasurement.measurementDate) : "—"}
          icon={Ruler}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
        />
      </div>

      {/* Overdue vaccine alerts */}
      {vaccinsOverdue.length > 0 && (
        <AlertCard
          title={`${vaccinsOverdue.length} vaccin${vaccinsOverdue.length > 1 ? "s" : ""} en retard`}
          message={`Les vaccins suivants sont en retard : ${vaccinsOverdue.slice(0, 3).map((v) => v.vaccineName).join(", ")}${vaccinsOverdue.length > 3 ? "…" : ""}. Prends RDV avec ton pédiatre.`}
          priority="high"
          category="Santé"
          actionUrl="/sante"
        />
      )}

      {/* Appointment soon alerts */}
      {soonAppointments.map((appt) => {
        const apptDate = new Date(appt.appointmentDate);
        const isToday = apptDate.toDateString() === now.toDateString();
        const memberName = children.find((c) => c.id === appt.memberId)?.firstName ?? "";
        return (
          <AlertCard
            key={appt.id}
            title={`RDV ${isToday ? "aujourd'hui" : "demain"} — ${memberName}`}
            message={`${appt.appointmentType}${appt.practitioner ? ` avec ${appt.practitioner}` : ""}${appt.location ? ` à ${appt.location}` : ""}`}
            priority="medium"
            category="Santé"
          />
        );
      })}

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
