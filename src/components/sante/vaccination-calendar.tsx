"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react";
import { VACCINATION_SCHEDULE } from "@/lib/constants";
import { VaccinationForm } from "@/components/sante/vaccination-form";
import type { Vaccination } from "@/types/health";
import type { FamilyMember } from "@/types/family";
import { differenceInMonths } from "date-fns";

interface VaccinationCalendarProps {
  member: FamilyMember;
  vaccinations: Vaccination[];
}

type DoseStatus = "done" | "pending" | "overdue" | "upcoming";

function getDoseStatus(
  vaccination: Vaccination | undefined,
  doseAgeMonths: number,
  childAgeMonths: number
): DoseStatus {
  if (vaccination?.status === "done") return "done";
  if (childAgeMonths >= doseAgeMonths + 1) return "overdue";
  if (childAgeMonths >= doseAgeMonths) return "pending";
  return "upcoming";
}

const STATUS_STYLE: Record<DoseStatus, { bg: string; icon: typeof CheckCircle; label: string }> = {
  done: { bg: "bg-green-100 text-green-700", icon: CheckCircle, label: "Fait" },
  pending: { bg: "bg-yellow-100 text-yellow-700", icon: Clock, label: "À faire" },
  overdue: { bg: "bg-red-100 text-red-700", icon: AlertTriangle, label: "En retard" },
  upcoming: { bg: "bg-gray-100 text-gray-500", icon: Clock, label: "À venir" },
};

export function VaccinationCalendar({ member, vaccinations }: VaccinationCalendarProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ vaccineCode: string; vaccineName: string; doseNumber: number } | undefined>();

  const childAgeMonths = differenceInMonths(new Date(), new Date(member.birthDate));

  const handleAddDose = (vaccineCode: string, vaccineName: string, doseNumber: number) => {
    setPrefill({ vaccineCode, vaccineName, doseNumber });
    setFormOpen(true);
  };

  const totalDoses = VACCINATION_SCHEDULE.reduce((acc, v) => acc + v.doses.length, 0);
  const doneDoses = vaccinations.filter((v) => v.status === "done").length;
  const overdueDoses = VACCINATION_SCHEDULE.reduce((acc, vaccine) => {
    return acc + vaccine.doses.filter((dose) => {
      const existing = vaccinations.find(
        (v) => v.vaccineCode === vaccine.code && v.doseNumber === dose.doseNumber
      );
      return getDoseStatus(existing, dose.ageMonths, childAgeMonths) === "overdue";
    }).length;
  }, 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{doneDoses}/{totalDoses}</p>
            <p className="text-sm text-muted-foreground">Vaccins faits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{overdueDoses}</p>
            <p className="text-sm text-muted-foreground">En retard</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{childAgeMonths}</p>
            <p className="text-sm text-muted-foreground">Mois</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {VACCINATION_SCHEDULE.map((vaccine) => (
          <Card key={vaccine.code}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{vaccine.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {vaccine.doses.map((dose) => {
                  const existing = vaccinations.find(
                    (v) => v.vaccineCode === vaccine.code && v.doseNumber === dose.doseNumber
                  );
                  const status = getDoseStatus(existing, dose.ageMonths, childAgeMonths);
                  const style = STATUS_STYLE[status];
                  const Icon = style.icon;

                  return (
                    <div
                      key={`${vaccine.code}-${dose.doseNumber}`}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${style.bg}`}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-sm">
                        <span className="font-medium">Dose {dose.doseNumber}</span>
                        <span className="ml-1 opacity-75">({dose.label})</span>
                      </div>
                      {status !== "done" && status !== "upcoming" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-1"
                          onClick={() => handleAddDose(vaccine.code, vaccine.name, dose.doseNumber)}
                          aria-label={`Enregistrer dose ${dose.doseNumber}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <VaccinationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        memberId={member.id}
        prefill={prefill}
      />
    </>
  );
}
