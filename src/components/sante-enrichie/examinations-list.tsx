"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { HEALTH_EXAMINATIONS } from "@/lib/constants";
import { ExaminationForm } from "@/components/sante-enrichie/examination-form";
import { differenceInMonths } from "date-fns";
import type { HealthExamination } from "@/types/health";
import type { FamilyMember } from "@/types/family";

interface ExaminationsListProps {
  member: FamilyMember;
  examinations: HealthExamination[];
}

export function ExaminationsList({ member, examinations }: ExaminationsListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<{
    number: number;
    ageLabel: string;
    existing?: HealthExamination;
  } | null>(null);

  const childAgeMonths = differenceInMonths(new Date(), new Date(member.birthDate));
  const completedCount = examinations.filter((e) => e.status === "completed").length;
  const progressPercent = (completedCount / 20) * 100;

  const handleOpenExam = (
    examNumber: number,
    ageLabel: string,
    existing?: HealthExamination
  ) => {
    setSelectedExam({ number: examNumber, ageLabel, existing });
    setFormOpen(true);
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Progression des examens obligatoires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={progressPercent} className="flex-1" />
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount}/20
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {HEALTH_EXAMINATIONS.map((ref) => {
          const exam = examinations.find((e) => e.examNumber === ref.number);
          const isCompleted = exam?.status === "completed";
          const ageMonths = "ageMonths" in ref ? ref.ageMonths : Math.round(("ageDays" in ref ? ref.ageDays : 0) / 30);
          const isDue = childAgeMonths >= ageMonths && !isCompleted;
          const isFuture = childAgeMonths < ageMonths;

          return (
            <Card
              key={ref.number}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                isCompleted
                  ? "border-green-200 bg-green-50/30"
                  : isDue
                    ? "border-orange-200 bg-orange-50/30"
                    : ""
              }`}
              onClick={() => handleOpenExam(ref.number, ref.ageLabel, exam)}
            >
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : isDue ? (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      Examen n\u00b0{ref.number} — {ref.ageLabel}
                    </p>
                    {exam?.completedDate && (
                      <p className="text-xs text-muted-foreground">
                        R\u00e9alis\u00e9 le{" "}
                        {new Date(exam.completedDate).toLocaleDateString("fr-FR")}
                        {exam.practitioner && ` — ${exam.practitioner}`}
                      </p>
                    )}
                    {exam && exam.weightKg && (
                      <p className="text-xs text-muted-foreground">
                        {exam.weightKg} kg
                        {exam.heightCm && ` | ${exam.heightCm} cm`}
                        {exam.headCircumferenceCm && ` | PC ${exam.headCircumferenceCm} cm`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      R\u00e9alis\u00e9
                    </Badge>
                  ) : isDue ? (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                      \u00c0 faire
                    </Badge>
                  ) : isFuture ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      \u00c0 venir
                    </Badge>
                  ) : null}
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedExam && (
        <ExaminationForm
          open={formOpen}
          onOpenChange={setFormOpen}
          memberId={member.id}
          examNumber={selectedExam.number}
          examAgeLabel={selectedExam.ageLabel}
          existing={selectedExam.existing}
        />
      )}
    </>
  );
}
