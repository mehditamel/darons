"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarRange, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DEMARCHES_CHECKLIST_TEMPLATES } from "@/lib/constants";

const PERIOD_FILTERS = [
  { label: "Tout", min: -12, max: 48 },
  { label: "Grossesse", min: -12, max: 0 },
  { label: "0-1 an", min: 0, max: 12 },
  { label: "1-3 ans", min: 12, max: 36 },
  { label: "3+ ans", min: 30, max: 48 },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  grossesse: "bg-warm-purple border-warm-purple",
  naissance: "bg-warm-orange border-warm-orange",
  sante: "bg-warm-teal border-warm-teal",
  caf: "bg-warm-green border-warm-green",
  fiscal: "bg-warm-gold border-warm-gold",
  garde: "bg-warm-blue border-warm-blue",
  scolarite: "bg-warm-blue border-warm-blue",
  identite: "bg-muted-foreground border-muted-foreground",
};

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

export default function TimelineAdministrativePage() {
  const [birthDate, setBirthDate] = useState("");
  const [activePeriod, setActivePeriod] = useState(0);

  const filter = PERIOD_FILTERS[activePeriod];

  const items = useMemo(() => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const now = new Date();

    return DEMARCHES_CHECKLIST_TEMPLATES
      .filter((tpl) => tpl.triggerAgeMonths >= filter.min && tpl.triggerAgeMonths <= filter.max)
      .map((tpl) => {
        const url = "url" in tpl ? (tpl as { url: string }).url : undefined;
        return {
          ...tpl,
          url,
          targetDate: addMonths(birth, tpl.triggerAgeMonths),
          isPast: addMonths(birth, tpl.triggerAgeMonths) < now,
        };
      })
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
  }, [birthDate, filter]);

  const nextItem = items?.find((item) => !item.isPast);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-orange/10 text-warm-orange flex items-center justify-center mx-auto">
          <CalendarRange className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          De la grossesse à l&apos;école
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tout ce que tu dois faire, quand tu dois le faire.
          La frise de la vie de parent, en un coup d&apos;oeil.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm mx-auto">
            <Label htmlFor="birthDate">Date de naissance (ou terme prévu)</Label>
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

      {birthDate && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PERIOD_FILTERS.map((period, i) => (
            <button
              key={period.label}
              onClick={() => setActivePeriod(i)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-all ${
                activePeriod === i
                  ? "bg-warm-orange text-white font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}

      {nextItem && (
        <Card className="border-warm-orange/30 bg-warm-orange/5">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warm-orange/20">
              <CalendarRange className="w-6 h-6 text-warm-orange" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prochaine étape</p>
              <p className="font-semibold">{nextItem.title}</p>
              <p className="text-sm text-warm-orange">{formatDate(nextItem.targetDate)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {items && items.length > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {items.map((item) => {
              const dotColor = CATEGORY_COLORS[item.category] ?? "bg-muted-foreground border-muted-foreground";

              return (
                <div key={item.id} className="relative pl-10">
                  <div className={`absolute left-2.5 top-5 w-3 h-3 rounded-full border-2 ${dotColor} ${item.isPast ? "opacity-50" : ""}`} />

                  <Card className={`card-playful ${item.isPast ? "opacity-60" : ""}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{item.title}</p>
                            <Badge
                              variant={item.priority === "urgent" ? "destructive" : "outline"}
                              className="text-xs"
                            >
                              {item.priority === "urgent" ? "Urgent" : item.priority === "high" ? "Important" : "Normal"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.targetDate)}
                          </p>
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
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items && items.length === 0 && (
        <Card className="flex items-center justify-center min-h-[200px]">
          <CardContent className="text-center text-muted-foreground">
            <p>Aucune démarche sur cette période</p>
          </CardContent>
        </Card>
      )}

      {birthDate && (
        <Card className="bg-warm-teal/5 border-warm-teal/20">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="font-medium">
              Reçois des rappels automatiques avant chaque échéance
            </p>
            <Link href="/register">
              <Button>
                Créer mon compte gratuit <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
