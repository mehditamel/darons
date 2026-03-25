import type { Metadata } from "next";
import {
  GraduationCap,
  School,
  CalendarDays,
  Baby,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { SchoolingTimeline } from "@/components/educatif/schooling-timeline";
import { SchoolSearch } from "@/components/educatif/school-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFamilyMembers } from "@/lib/actions/family";
import { getSchooling } from "@/lib/actions/educational";
import { SCHOOL_LEVELS } from "@/lib/constants";
import { calculateAge } from "@/lib/utils";
import type { Schooling } from "@/types/educational";

export const metadata: Metadata = {
  title: "Scolarité",
  description: "Timeline scolaire, inscriptions et suivi des établissements de vos enfants",
};

function getSchoolLevel(ageYears: number) {
  return SCHOOL_LEVELS.find((l) => ageYears >= l.minAge && ageYears < l.maxAge) ?? null;
}

function getNextRentree(): { date: Date; daysUntil: number } {
  const now = new Date();
  const currentYear = now.getFullYear();
  // Rentrée = 1er septembre (approximately)
  let rentree = new Date(currentYear, 8, 1); // September 1
  if (rentree <= now) {
    rentree = new Date(currentYear + 1, 8, 1);
  }
  const diffMs = rentree.getTime() - now.getTime();
  return { date: rentree, daysUntil: Math.ceil(diffMs / (1000 * 60 * 60 * 24)) };
}

function getKeyDates(children: { firstName: string; birthDate: string }[]): { label: string; description: string; daysUntil: number }[] {
  const now = new Date();
  const dates: { label: string; description: string; daysUntil: number }[] = [];

  for (const child of children) {
    const age = calculateAge(child.birthDate);
    const birth = new Date(child.birthDate);

    // Inscription maternelle PS : quand l'enfant a environ 2 ans (pour septembre suivant ses 3 ans)
    // Inscriptions en mairie : janvier-mars de l'année de la rentrée
    if (age.years < 3) {
      const yearOfPS = birth.getFullYear() + 3;
      const inscriptionStart = new Date(yearOfPS, 0, 15); // Mi-janvier
      const diffMs = inscriptionStart.getTime() - now.getTime();
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil < 730) {
        dates.push({
          label: `Inscription maternelle — ${child.firstName}`,
          description: `Inscriptions en mairie entre janvier et mars ${yearOfPS}`,
          daysUntil,
        });
      }
    }

    // Passage au CP : l'année des 6 ans
    if (age.years >= 4 && age.years < 6) {
      const yearOfCP = birth.getFullYear() + 6;
      const inscriptionStart = new Date(yearOfCP, 2, 1); // Mars
      const diffMs = inscriptionStart.getTime() - now.getTime();
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysUntil > 0) {
        dates.push({
          label: `Inscription CP — ${child.firstName}`,
          description: `Inscription élémentaire pour septembre ${yearOfCP}`,
          daysUntil,
        });
      }
    }

    // Passage au collège : l'année des 11 ans
    if (age.years >= 9 && age.years < 11) {
      const yearOf6e = birth.getFullYear() + 11;
      const inscriptionStart = new Date(yearOf6e, 5, 1); // Juin (inscription automatique via école)
      const diffMs = inscriptionStart.getTime() - now.getTime();
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysUntil > 0) {
        dates.push({
          label: `Entrée en 6e — ${child.firstName}`,
          description: `Affectation collège pour septembre ${yearOf6e}`,
          daysUntil,
        });
      }
    }
  }

  return dates.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 3);
}

export default async function ScolaritePage() {
  const membersResult = await getFamilyMembers();
  const allMembers = membersResult.data ?? [];
  const children = allMembers.filter((m) => m.memberType === "child");

  const schoolingByMember: Record<string, Schooling[]> = {};

  await Promise.all(
    children.map(async (child) => {
      const result = await getSchooling(child.id);
      schoolingByMember[child.id] = result.data ?? [];
    })
  );

  const firstChild = children[0];
  const firstChildAge = firstChild ? calculateAge(firstChild.birthDate) : null;
  const currentLevel = firstChildAge ? getSchoolLevel(firstChildAge.years) : null;
  const nextRentree = getNextRentree();
  const keyDates = getKeyDates(children.map((c) => ({ firstName: c.firstName, birthDate: c.birthDate })));

  // Find current establishment from latest schooling record
  const latestSchooling = firstChild
    ? (schoolingByMember[firstChild.id] ?? []).sort((a, b) => b.schoolYear.localeCompare(a.schoolYear))[0]
    : null;

  // Check if child is too young for school
  const tooYoung = firstChildAge && firstChildAge.years < 2;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Scolarité"
        description={firstChild ? `Parcours scolaire de ${firstChild.firstName}` : "Timeline prévisionnelle et suivi de la scolarité de vos enfants"}
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Niveau actuel"
          value={currentLevel ? currentLevel.label : tooYoung ? "Pas encore" : "—"}
          icon={<GraduationCap className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
          trend={currentLevel ? currentLevel.type : undefined}
        />
        <StatCard
          label="Prochaine rentrée"
          value={`${nextRentree.daysUntil}j`}
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-orange/10 text-warm-orange"
          gradientClass="card-gradient-orange"
          trend={`septembre ${nextRentree.date.getFullYear()}`}
        />
        <StatCard
          label="Établissement"
          value={latestSchooling?.establishment ?? "Non renseigné"}
          icon={<School className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
          trend={latestSchooling?.schoolYear ?? undefined}
        />
      </div>

      {/* Too young message */}
      {tooYoung && (
        <AlertCard
          title="Pas encore l'heure de l'école !"
          message={`${firstChild?.firstName} a ${firstChildAge?.label}. On te préviendra quand il sera temps de penser aux inscriptions.`}
          priority="low"
          category="Scolarité"
        />
      )}

      {/* Key dates */}
      {keyDates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-warm-blue" />
              Dates clés à venir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {keyDates.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.description}</p>
                </div>
                <Badge
                  variant={d.daysUntil <= 90 ? "destructive" : d.daysUntil <= 365 ? "warning" : "outline"}
                  className="text-xs shrink-0 ml-2"
                >
                  {d.daysUntil > 365
                    ? `dans ${Math.round(d.daysUntil / 365)} an${Math.round(d.daysUntil / 365) > 1 ? "s" : ""}`
                    : `dans ${d.daysUntil}j`}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <SchoolingTimeline
        schoolingByMember={schoolingByMember}
      >
        {children}
      </SchoolingTimeline>

      <SchoolSearch />
    </div>
  );
}
