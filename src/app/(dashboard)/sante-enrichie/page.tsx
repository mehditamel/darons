import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SanteEnrichieTabs } from "@/components/sante-enrichie/sante-enrichie-tabs";
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
  title: "Sant\u00e9 enrichie",
  description:
    "Examens obligatoires, rep\u00e9rage TND, journal quotidien, allergies et ordonnances",
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
        title="Sant\u00e9 enrichie"
        description="Examens obligatoires, rep\u00e9rage TND, exposition \u00e9crans, journal quotidien, allergies et ordonnances"
      />

      <SanteEnrichieTabs
        members={children}
        examinationsByMember={examinationsByMember}
        journalByMember={journalByMember}
        allergiesByMember={allergiesByMember}
        prescriptionsByMember={prescriptionsByMember}
      />
    </div>
  );
}
