"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ClipboardCheck, ArrowRight, ExternalLink, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DEMARCHES_CHECKLIST_TEMPLATES } from "@/lib/constants";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  grossesse: { label: "Grossesse", color: "bg-warm-purple/10 text-warm-purple" },
  naissance: { label: "Naissance", color: "bg-warm-orange/10 text-warm-orange" },
  sante: { label: "Santé", color: "bg-warm-teal/10 text-warm-teal" },
  caf: { label: "CAF / Aides", color: "bg-warm-green/10 text-warm-green" },
  fiscal: { label: "Impôts", color: "bg-warm-gold/10 text-warm-gold" },
  garde: { label: "Garde", color: "bg-warm-blue/10 text-warm-blue" },
  scolarite: { label: "Scolarité", color: "bg-warm-blue/10 text-warm-blue" },
  identite: { label: "Identité", color: "bg-muted text-muted-foreground" },
};

const PRIORITY_BADGES: Record<string, { label: string; variant: "default" | "destructive" | "outline" }> = {
  urgent: { label: "Urgent", variant: "destructive" },
  high: { label: "Important", variant: "default" },
  normal: { label: "Normal", variant: "outline" },
  low: { label: "Optionnel", variant: "outline" },
};

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function getStoredChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("darons_checklist_naissance");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export default function ChecklistNaissancePage() {
  const [birthDate, setBirthDate] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setChecked(getStoredChecked());
  }, []);

  function toggleChecked(id: string) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem("darons_checklist_naissance", JSON.stringify(next));
  }

  const items = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    return DEMARCHES_CHECKLIST_TEMPLATES.map((tpl) => {
      const url = "url" in tpl ? (tpl as { url: string }).url : undefined;
      return {
        ...tpl,
        url,
        targetDate: addMonths(birth, tpl.triggerAgeMonths),
      };
    }).sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
  }, [birthDate]);

  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-orange/10 text-warm-orange flex items-center justify-center mx-auto">
          <ClipboardCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          T&apos;as pensé à tout ? On vérifie.
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          De la grossesse aux 3 ans : toutes les démarches, dans l&apos;ordre,
          avec les liens officiels. Coche au fur et à mesure.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm mx-auto">
            <Label htmlFor="birthDate">Date de naissance (ou date prévue)</Label>
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

      {items && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {checkedCount} / {items.length} démarches cochées
            </p>
            <div className="w-48 bg-muted rounded-full h-2">
              <div
                className="bg-warm-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${(checkedCount / items.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isPast = item.targetDate < new Date();
              const cat = CATEGORY_LABELS[item.category] ?? { label: item.category, color: "bg-muted text-muted-foreground" };
              const priority = PRIORITY_BADGES[item.priority] ?? PRIORITY_BADGES.normal;

              return (
                <Card
                  key={item.id}
                  className={`card-playful transition-opacity ${checked[item.id] ? "opacity-60" : ""}`}
                >
                  <CardContent className="flex items-start gap-4 py-4">
                    <input
                      type="checkbox"
                      checked={checked[item.id] ?? false}
                      onChange={() => toggleChecked(item.id)}
                      className="mt-1 h-5 w-5 rounded border-2 border-border accent-warm-green cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold text-sm ${checked[item.id] ? "line-through" : ""}`}>
                          {item.title}
                        </p>
                        <Badge variant={priority.variant} className="text-xs">
                          {priority.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${isPast && !checked[item.id] ? "text-warm-red font-medium" : "text-muted-foreground"}`}>
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(item.targetDate)}
                          {isPast && !checked[item.id] && " — en retard"}
                        </span>
                      </div>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-warm-blue hover:text-warm-blue/80"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-warm-teal/5 border-warm-teal/20">
            <CardContent className="pt-6 text-center space-y-3">
              <p className="font-medium">
                Crée ton compte pour recevoir des rappels automatiques avant chaque échéance
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
