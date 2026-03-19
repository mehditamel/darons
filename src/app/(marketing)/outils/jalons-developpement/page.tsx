"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DEVELOPMENT_MILESTONES_REFERENCE } from "@/lib/constants";

const CATEGORY_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  motricite: { label: "Motricité", color: "bg-warm-orange/10 text-warm-orange", emoji: "🏃" },
  langage: { label: "Langage", color: "bg-warm-blue/10 text-warm-blue", emoji: "🗣️" },
  cognition: { label: "Cognition", color: "bg-warm-purple/10 text-warm-purple", emoji: "🧠" },
  social: { label: "Social", color: "bg-warm-teal/10 text-warm-teal", emoji: "🤝" },
  autonomie: { label: "Autonomie", color: "bg-warm-gold/10 text-warm-gold", emoji: "🌟" },
};

function getAgeMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

function getStoredAchieved(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("darons_milestones");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export default function JalonsDeveloppementPage() {
  const [birthDate, setBirthDate] = useState("");
  const [achieved, setAchieved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setAchieved(getStoredAchieved());
  }, []);

  function toggleAchieved(name: string) {
    const next = { ...achieved, [name]: !achieved[name] };
    setAchieved(next);
    localStorage.setItem("darons_milestones", JSON.stringify(next));
  }

  const ageMonths = birthDate ? getAgeMonths(birthDate) : null;

  const groupedMilestones = useMemo(() => {
    const categories = Object.keys(CATEGORY_LABELS);
    return categories.map((cat) => ({
      category: cat,
      ...CATEGORY_LABELS[cat],
      milestones: DEVELOPMENT_MILESTONES_REFERENCE.filter((m) => m.category === cat),
    }));
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-purple/10 text-warm-purple flex items-center justify-center mx-auto">
          <TrendingUp className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Premiers mots, premiers pas
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Suis les jalons de développement de ton enfant selon les référentiels OMS et HAS.
          Chaque enfant a son rythme — zéro stress.
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
            {ageMonths !== null && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Ton enfant a <span className="font-semibold">{ageMonths} mois</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {groupedMilestones.map((group) => {
        const total = group.milestones.length;
        const achievedCount = group.milestones.filter((m) => achieved[m.name]).length;
        const progress = total > 0 ? (achievedCount / total) * 100 : 0;

        return (
          <Card key={group.category} className="card-playful">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span>{group.emoji}</span>
                  {group.label}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {achievedCount}/{total}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-warm-green h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.milestones.map((milestone) => {
                const isRelevant = ageMonths !== null && ageMonths >= milestone.expectedAgeMonths - 3;
                const isOverdue = ageMonths !== null && ageMonths > milestone.expectedAgeMonths + 3 && !achieved[milestone.name];
                const isInWindow = ageMonths !== null && ageMonths >= milestone.expectedAgeMonths - 2 && ageMonths <= milestone.expectedAgeMonths + 3;

                return (
                  <div
                    key={milestone.name}
                    className={`flex items-center gap-3 py-2 border-b last:border-0 ${
                      !isRelevant && ageMonths !== null ? "opacity-40" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={achieved[milestone.name] ?? false}
                      onChange={() => toggleAchieved(milestone.name)}
                      className="h-4 w-4 rounded border-2 accent-warm-green cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${achieved[milestone.name] ? "line-through text-muted-foreground" : "font-medium"}`}>
                        {milestone.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        ~{milestone.expectedAgeMonths} mois
                      </span>
                      {achieved[milestone.name] && (
                        <span className="w-2 h-2 rounded-full bg-warm-green" />
                      )}
                      {isInWindow && !achieved[milestone.name] && (
                        <span className="w-2 h-2 rounded-full bg-warm-gold" />
                      )}
                      {isOverdue && (
                        <span className="w-2 h-2 rounded-full bg-warm-orange" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {ageMonths !== null && (
        <Card className="bg-warm-teal/5 border-warm-teal/20">
          <CardContent className="pt-6 text-center space-y-3">
            <Heart className="w-6 h-6 mx-auto text-warm-teal" />
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Chaque enfant a son rythme. Ces jalons sont des repères, pas des objectifs.
              Si tu as un doute, parles-en à ton pédiatre.
            </p>
            <Link href="/register">
              <Button variant="outline">
                Sauvegarder dans mon compte <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
