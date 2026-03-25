import type { Metadata } from "next";
import {
  Stethoscope,
  ClipboardCheck,
  AlertTriangle as AllergyIcon,
  Pill,
  BookHeart,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { SanteEnrichieTabs } from "@/components/sante-enrichie/sante-enrichie-tabs";
import { MESConnectionCard } from "@/components/sante/mes-connection-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFamilyMembers } from "@/lib/actions/family";
import {
  getHealthExaminations,
  getDailyJournalEntries,
  getAllergies,
  getPrescriptions,
} from "@/lib/actions/health-enriched";
import { HEALTH_EXAMINATIONS } from "@/lib/constants";
import { calculateAge, formatRelativeDate } from "@/lib/utils";
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

function getNextExamDue(
  exams: HealthExamination[],
  childAgeMonths: number,
): { examNumber: number; ageLabel: string; isOverdue: boolean } | null {
  const completedNumbers = new Set(
    exams.filter((e) => e.status === "completed").map((e) => e.examNumber),
  );

  for (const ref of HEALTH_EXAMINATIONS) {
    if (!completedNumbers.has(ref.number)) {
      const expectedMonths = "ageMonths" in ref ? ref.ageMonths : 0;
      const isOverdue = expectedMonths !== undefined && childAgeMonths > expectedMonths + 1;
      return { examNumber: ref.number, ageLabel: ref.ageLabel, isOverdue };
    }
  }

  return null;
}

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

  // Aggregate stats across all children
  const allExams = Object.values(examinationsByMember).flat();
  const completedExams = allExams.filter((e) => e.status === "completed").length;
  const totalExpectedExams = children.length * 20; // 20 examens per child

  const allAllergies = Object.values(allergiesByMember).flat();
  const allPrescriptions = Object.values(prescriptionsByMember).flat();
  const allJournals = Object.values(journalByMember).flat();
  const latestJournal = allJournals.length > 0
    ? allJournals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  // Check for overdue exams
  const overdueExams: { childName: string; examNumber: number; ageLabel: string }[] = [];
  for (const child of children) {
    const ageMonths = Math.floor(
      (new Date().getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
    );
    const nextExam = getNextExamDue(examinationsByMember[child.id] ?? [], ageMonths);
    if (nextExam?.isOverdue) {
      overdueExams.push({ childName: child.firstName, examNumber: nextExam.examNumber, ageLabel: nextExam.ageLabel });
    }
  }

  // Next exam per child
  const nextExamsPerChild: { childName: string; examNumber: number; ageLabel: string }[] = [];
  for (const child of children) {
    const ageMonths = Math.floor(
      (new Date().getTime() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
    );
    const nextExam = getNextExamDue(examinationsByMember[child.id] ?? [], ageMonths);
    if (nextExam && !nextExam.isOverdue) {
      nextExamsPerChild.push({ childName: child.firstName, examNumber: nextExam.examNumber, ageLabel: nextExam.ageLabel });
    }
  }

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Santé enrichie"
        description="Examens obligatoires, repérage TND, exposition écrans, journal quotidien, allergies et ordonnances"
        icon={<Stethoscope className="h-5 w-5" />}
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Examens complétés"
          value={`${completedExams}/${totalExpectedExams}`}
          icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
          trend={totalExpectedExams > 0 ? `${Math.round((completedExams / totalExpectedExams) * 100)}%` : undefined}
          trendUp={completedExams > 0}
        />
        <StatCard
          label="Allergies connues"
          value={String(allAllergies.length)}
          icon={<AllergyIcon className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-orange/10 text-warm-orange"
          gradientClass="card-gradient-orange"
        />
        <StatCard
          label="Ordonnances"
          value={String(allPrescriptions.length)}
          icon={<Pill className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Dernier journal"
          value={latestJournal ? formatRelativeDate(latestJournal.createdAt) : "—"}
          icon={<BookHeart className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
        />
      </div>

      {/* Overdue exam alerts */}
      {overdueExams.map((exam) => (
        <AlertCard
          key={`${exam.childName}-${exam.examNumber}`}
          title={`Examen n°${exam.examNumber} en retard — ${exam.childName}`}
          message={`L'examen de santé obligatoire à ${exam.ageLabel} n'a pas été enregistré. Pense à prendre RDV avec le pédiatre.`}
          priority="high"
          category="Santé"
        />
      ))}

      {/* Upcoming exams */}
      {nextExamsPerChild.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-warm-teal" />
              Prochains examens à planifier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextExamsPerChild.map((exam) => (
              <div key={`${exam.childName}-${exam.examNumber}`} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">
                    Examen n°{exam.examNumber} — {exam.childName}
                  </p>
                  <p className="text-xs text-muted-foreground">Prévu à {exam.ageLabel}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  À planifier
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
