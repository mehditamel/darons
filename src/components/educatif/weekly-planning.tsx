"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/types/educational";
import type { FamilyMember } from "@/types/family";
import { ACTIVITY_CATEGORY_LABELS, type ActivityCategory } from "@/types/educational";

interface WeeklyPlanningProps {
  activitiesByMember: Record<string, Activity[]>;
  childMembers: FamilyMember[];
}

const DAYS_OF_WEEK = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

const DAY_ALIASES: Record<string, string> = {
  lun: "lundi",
  mar: "mardi",
  mer: "mercredi",
  jeu: "jeudi",
  ven: "vendredi",
  sam: "samedi",
  dim: "dimanche",
};

const CATEGORY_COLORS: Record<string, string> = {
  sport: "bg-warm-orange/10 text-warm-orange border-warm-orange/20",
  musique: "bg-warm-purple/10 text-warm-purple border-warm-purple/20",
  art: "bg-warm-blue/10 text-warm-blue border-warm-blue/20",
  langue: "bg-warm-gold/10 text-warm-gold border-warm-gold/20",
  eveil: "bg-warm-teal/10 text-warm-teal border-warm-teal/20",
  nature: "bg-warm-green/10 text-warm-green border-warm-green/20",
  autre: "bg-muted text-muted-foreground",
};

interface ParsedSlot {
  day: string;
  time: string | null;
  activity: Activity;
  childName: string;
}

function parseSchedule(
  schedule: string,
  activity: Activity,
  childName: string
): ParsedSlot[] {
  const slots: ParsedSlot[] = [];
  const normalized = schedule.toLowerCase().trim();

  for (const day of DAYS_OF_WEEK) {
    if (normalized.includes(day)) {
      const timeMatch = normalized.match(
        new RegExp(`${day}[\\s:]*([0-9]{1,2}[h:][0-9]{0,2}(?:\\s*[-–à]\\s*[0-9]{1,2}[h:][0-9]{0,2})?)`, "i")
      );
      slots.push({
        day,
        time: timeMatch ? timeMatch[1].trim() : null,
        activity,
        childName,
      });
    }
  }

  // Check aliases (lun, mar, etc.)
  for (const [alias, day] of Object.entries(DAY_ALIASES)) {
    const aliasRegex = new RegExp(`\\b${alias}\\b`, "i");
    if (aliasRegex.test(normalized) && !slots.some((s) => s.day === day)) {
      slots.push({
        day,
        time: null,
        activity,
        childName,
      });
    }
  }

  // If no specific day found, try to detect from common patterns
  if (slots.length === 0) {
    // Just show it without a day assignment
    return [];
  }

  return slots;
}

export function WeeklyPlanning({ activitiesByMember, childMembers }: WeeklyPlanningProps) {
  const allSlots: ParsedSlot[] = [];
  const unscheduled: { activity: Activity; childName: string }[] = [];

  for (const child of childMembers) {
    const activities = activitiesByMember[child.id] ?? [];
    for (const activity of activities) {
      if (!activity.active) continue;
      if (activity.schedule) {
        const parsed = parseSchedule(activity.schedule, activity, child.firstName);
        if (parsed.length > 0) {
          allSlots.push(...parsed);
        } else {
          unscheduled.push({ activity, childName: child.firstName });
        }
      }
    }
  }

  if (allSlots.length === 0 && unscheduled.length === 0) {
    return null;
  }

  const slotsByDay: Record<string, ParsedSlot[]> = {};
  for (const day of DAYS_OF_WEEK) {
    slotsByDay[day] = allSlots.filter((s) => s.day === day);
  }

  const daysWithSlots = DAYS_OF_WEEK.filter(
    (day) => slotsByDay[day].length > 0
  );

  if (daysWithSlots.length === 0 && unscheduled.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Planning hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {daysWithSlots.map((day) => (
            <div
              key={day}
              className="rounded-lg border p-3 space-y-2"
            >
              <h4 className="text-sm font-semibold capitalize">{day}</h4>
              {slotsByDay[day].map((slot, index) => (
                <div
                  key={`${slot.activity.id}-${index}`}
                  className={`rounded-md border p-2 text-xs ${
                    CATEGORY_COLORS[slot.activity.category ?? "autre"]
                  }`}
                >
                  <p className="font-medium">{slot.activity.name}</p>
                  {slot.time && (
                    <p className="opacity-80">{slot.time}</p>
                  )}
                  {childMembers.length > 1 && (
                    <p className="opacity-70">{slot.childName}</p>
                  )}
                  {slot.activity.category && (
                    <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0">
                      {ACTIVITY_CATEGORY_LABELS[slot.activity.category as ActivityCategory] ?? slot.activity.category}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {unscheduled.length > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Sans horaire fixe :
            </p>
            <div className="flex flex-wrap gap-2">
              {unscheduled.map(({ activity, childName }) => (
                <span
                  key={activity.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
                >
                  {activity.name}
                  {childMembers.length > 1 && (
                    <span className="text-muted-foreground">({childName})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
