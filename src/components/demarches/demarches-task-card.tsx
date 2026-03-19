"use client";

import { ExternalLink, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdministrativeTask } from "@/types/demarches";
import {
  TASK_CATEGORY_LABELS,
  TASK_CATEGORY_COLORS,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
} from "@/types/demarches";
import { format, isPast, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface DemarchesTaskCardProps {
  task: AdministrativeTask;
  onToggle: (id: string) => void;
}

export function DemarchesTaskCard({ task, onToggle }: DemarchesTaskCardProps) {
  const isOverdue =
    !task.completed && task.dueDate && isPast(parseISO(task.dueDate));

  return (
    <Card
      className={`transition-opacity ${task.completed ? "opacity-60" : ""} ${
        isOverdue ? "border-red-300" : ""
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="mt-1 h-4 w-4 rounded border-gray-300"
            aria-label={`Marquer "${task.title}" comme ${task.completed ? "à faire" : "complété"}`}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h4
                className={`text-sm font-medium ${
                  task.completed ? "line-through" : ""
                }`}
              >
                {task.title}
              </h4>
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{
                  borderColor: TASK_CATEGORY_COLORS[task.category],
                  color: TASK_CATEGORY_COLORS[task.category],
                }}
              >
                {TASK_CATEGORY_LABELS[task.category]}
              </Badge>
              {task.priority !== "normal" && (
                <Badge
                  variant="outline"
                  className="text-[10px]"
                  style={{
                    borderColor: TASK_PRIORITY_COLORS[task.priority],
                    color: TASK_PRIORITY_COLORS[task.priority],
                  }}
                >
                  {TASK_PRIORITY_LABELS[task.priority]}
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive" className="text-[10px]">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  En retard
                </Badge>
              )}
            </div>

            {task.description && (
              <p className="mb-1 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.dueDate && (
                <span>
                  {task.completed ? "Fait le" : "Échéance"} :{" "}
                  {format(parseISO(task.dueDate), "d MMM yyyy", {
                    locale: fr,
                  })}
                </span>
              )}
              {task.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  asChild
                >
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Accéder au service
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
