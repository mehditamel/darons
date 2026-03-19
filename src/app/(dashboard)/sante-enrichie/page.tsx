import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SanteEnrichieTabs } from "@/components/sante-enrichie/sante-enrichie-tabs";
import { MESConnectionCard } from "@/components/sante/mes-connection-card";
import { getFamilyMembers } from "@/lib/actions/family";
import {
  getHealthExaminations,
  getDailyJournalEntries,
  getAllergies,
  getPrescriptions,
} from "@/lib/actions/health-enriched";
import type {
  HealthExamination,
  DailyHealthJournal,
  Allergy,
  Prescription,
} from "@/types/health";

export const metadata: Metadata = {
  title: "Santé enrichie",
  description:
    "Examens obligatoires, repérage TND, journal quotidien, allergies et ordonnances",
};

export default async function SanteEnrichiePage() {
  const membersResult = await getFamilyMembers();
  const allMembers = membersResult.data ?? [];
  const children = allMembers.filter((m) => m.memberType === "child");

  const examinationsByMember: Record<string, HealthExamination[]> = {};
  const journalByMember: Record<string, DailyHealthJournal[]> = {};
  const allergiesByMember: Record<string, Allergy[]> = {};
  const prescriptionsByMember: Record<string, Prescription[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const [exams, journal, allergies, prescriptions] = await Promise.all([
        getHealthExaminations(child.id),
        getDailyJournalEntries(child.id),
        getAllergies(child.id),
        getPrescriptions(child.id),
      ]);
      examinationsByMember[child.id] = exams.data ?? [];
      journalByMember[child.id] = journal.data ?? [];
      allergiesByMember[child.id] = allergies.data ?? [];
      prescriptionsByMember[child.id] = prescriptions.data ?? [];
    })
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Santé enrichie"
        description="Examens obligatoires, repérage TND, exposition écrans, journal quotidien, allergies et ordonnances"
      />

      <MESConnectionCard
        childMembers={children.map((c) => ({ id: c.id, firstName: c.firstName }))}
      />

      <SanteEnrichieTabs
        childMembers={children}
        examinationsByMember={examinationsByMember}
        journalByMember={journalByMember}
        allergiesByMember={allergiesByMember}
        prescriptionsByMember={prescriptionsByMember}
      />
    </div>
  );
}
