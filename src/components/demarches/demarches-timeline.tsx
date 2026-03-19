"use client";

import { useState, useMemo } from "react";
import { DemarchesTaskCard } from "@/components/demarches/demarches-task-card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdministrativeTask } from "@/types/demarches";
import { TASK_CATEGORY_LABELS } from "@/types/demarches";
import { toggleAdministrativeTask } from "@/lib/actions/demarches";
import type { FamilyMember } from "@/types/family";
import { isPast, parseISO } from "date-fns";

interface DemarchesTimelineProps {
  initialTasks: AdministrativeTask[];
  members: FamilyMember[];
}

type FilterStatus = "all" | "todo" | "done" | "overdue";

const PERIOD_ORDER = [
  "Grossesse",
  "Naissance",
  "0 - 6 mois",
  "6 - 12 mois",
  "1 - 2 ans",
  "2 - 3 ans",
  "Autre",
] as const;

function getPeriodLabel(triggerAgeMonths: number | null): string {
  if (triggerAgeMonths === null) return "Autre";
  if (triggerAgeMonths < 0) return "Grossesse";
  if (triggerAgeMonths === 0) return "Naissance";
  if (triggerAgeMonths <= 6) return "0 - 6 mois";
  if (triggerAgeMonths <= 12) return "6 - 12 mois";
  if (triggerAgeMonths <= 24) return "1 - 2 ans";
  if (triggerAgeMonths <= 36) return "2 - 3 ans";
  return "Autre";
}

export function DemarchesTimeline({
  initialTasks,
  members,
}: DemarchesTimelineProps) {
  const [tasks, setTasks] = useState<AdministrativeTask[]>(initialTasks);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMember, setFilterMember] = useState<string>("all");

  const childMembers = members.filter((m) => m.memberType === "child");

  const counts = useMemo(() => {
    const todo = tasks.filter((t) => !t.completed).length;
    const done = tasks.filter((t) => t.completed).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && isPast(parseISO(t.dueDate))
    ).length;
    return { todo, done, overdue };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus === "todo" && task.completed) return false;
      if (filterStatus === "done" && !task.completed) return false;
      if (
        filterStatus === "overdue" &&
        (task.completed || !task.dueDate || !isPast(parseISO(task.dueDate)))
      )
        return false;
      if (filterCategory !== "all" && task.category !== filterCategory)
        return false;
      if (filterMember !== "all" && task.memberId !== filterMember)
        return false;
      return true;
    });
  }, [tasks, filterStatus, filterCategory, filterMember]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, AdministrativeTask[]> = {};
    for (const task of filteredTasks) {
      const period = getPeriodLabel(task.triggerAgeMonths);
      if (!groups[period]) groups[period] = [];
      groups[period].push(task);
    }
    return groups;
  }, [filteredTasks]);

  const handleToggle = async (id: string) => {
    const result = await toggleAdministrativeTask(id);
    if (result.success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed
                  ? new Date().toISOString()
                  : null,
              }
            : t
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filterStatus === "todo" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() =>
            setFilterStatus(filterStatus === "todo" ? "all" : "todo")
          }
        >
          {counts.todo} à faire
        </Badge>
        <Badge
          variant={filterStatus === "done" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() =>
            setFilterStatus(filterStatus === "done" ? "all" : "done")
          }
        >
          {counts.done} complétées
        </Badge>
        {counts.overdue > 0 && (
          <Badge
            variant={filterStatus === "overdue" ? "destructive" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              setFilterStatus(filterStatus === "overdue" ? "all" : "overdue")
            }
          >
            {counts.overdue} en retard
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {childMembers.length > 0 && (
          <Select value={filterMember} onValueChange={setFilterMember}>
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="Enfant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les enfants</SelectItem>
              {childMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {PERIOD_ORDER.filter((period) => groupedTasks[period]).map(
          (period) => (
            <div key={period}>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <h3 className="text-sm font-semibold">{period}</h3>
                <span className="text-xs text-muted-foreground">
                  ({groupedTasks[period].length})
                </span>
              </div>
              <div className="ml-1.5 space-y-2 border-l-2 border-muted pl-5">
                {groupedTasks[period].map((task) => (
                  <DemarchesTaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {filteredTasks.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune démarche ne correspond aux filtres sélectionnés.
          </p>
        )}
      </div>
    </div>
  );
}
