"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Stethoscope, ArrowRight, CalendarDays, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HEALTH_EXAMINATIONS } from "@/lib/constants";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getExamDate(birthDate: Date, exam: (typeof HEALTH_EXAMINATIONS)[number]): Date {
  if ("ageDays" in exam && exam.ageDays) {
    return addDays(birthDate, exam.ageDays);
  }
  if ("ageMonths" in exam && exam.ageMonths) {
    return addMonths(birthDate, exam.ageMonths);
  }
  return birthDate;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function getStoredCompleted(): Record<number, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("darons_examens_sante");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export default function ExamensSantePage() {
  const [birthDate, setBirthDate] = useState("");
  const [completed, setCompleted] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setCompleted(getStoredCompleted());
  }, []);

  function toggleCompleted(num: number) {
    const next = { ...completed, [num]: !completed[num] };
    setCompleted(next);
    localStorage.setItem("darons_examens_sante", JSON.stringify(next));
  }

  const exams = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();
    return HEALTH_EXAMINATIONS.map((exam) => {
      const date = getExamDate(birth, exam);
      const isPast = date < now;
      return { ...exam, date, isPast };
    });
  }, [birthDate]);

  const completedCount = Object.values(completed).filter(Boolean).length;

  const nextExam = exams?.find((e) => !e.isPast && !completed[e.number]) ??
    exams?.find((e) => !completed[e.number]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-teal/10 text-warm-teal flex items-center justify-center mx-auto">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Les 20 visites obligatoires de ton enfant
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          De 8 jours à 18 ans, ton enfant a 20 examens de santé obligatoires.
          On te dit quand, et ce qui est vérifié à chaque fois.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm mx-auto">
            <Label htmlFor="birthDate">Date de naissance de ton enfant</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {exams && (
        <>
          {nextExam && (
            <Card className="border-warm-teal/30 bg-warm-teal/5">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warm-teal/20">
                  <CalendarDays className="w-6 h-6 text-warm-teal" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prochain examen</p>
                  <p className="font-semibold">
                    Examen n°{nextExam.number} — {nextExam.ageLabel}
                  </p>
                  <p className="text-sm text-warm-teal">
                    {nextExam.isPast ? "En retard — " : ""}
                    {formatDate(nextExam.date)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {completedCount} / 20 examens effectués
            </p>
            <div className="w-48 bg-muted rounded-full h-2">
              <div
                className="bg-warm-teal h-2 rounded-full transition-all"
                style={{ width: `${(completedCount / 20) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {exams.map((exam) => {
              const isDone = completed[exam.number];
              const isOverdue = exam.isPast && !isDone;

              return (
                <Card
                  key={exam.number}
                  className={`card-playful transition-opacity ${isDone ? "opacity-60" : ""}`}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <button
                      onClick={() => toggleCompleted(exam.number)}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isDone
                          ? "bg-warm-green border-warm-green text-white"
                          : isOverdue
                            ? "border-warm-red"
                            : "border-border hover:border-warm-teal"
                      }`}
                    >
                      {isDone && <Check className="w-4 h-4" />}
                      {!isDone && <span className="text-xs font-bold">{exam.number}</span>}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${isDone ? "line-through" : ""}`}>
                          Examen n°{exam.number} — {exam.ageLabel}
                        </p>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">En retard</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(exam.date)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-warm-teal/5 border-warm-teal/20">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="font-medium">
                Reçois des rappels automatiques avant chaque examen
              </p>
              <Link href="/register">
                <Button>
                  Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
