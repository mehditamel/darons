"use client";

import { useState } from "react";
import { GraduationCap, Plus, Pencil, Trash2, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChildSelector } from "@/components/sante/child-selector";
import { EmptyState } from "@/components/shared/empty-state";
import { SchoolingForm } from "./schooling-form";
import { deleteSchooling } from "@/lib/actions/educational";
import type { FamilyMember } from "@/types/family";
import type { Schooling, SchoolingLevel } from "@/types/educational";
import {
  SCHOOLING_LEVEL_LABELS,
  SCHOOLING_LEVELS_ORDERED,
  SCHOOLING_LEVEL_START_AGE,
} from "@/types/educational";

interface SchoolingTimelineProps {
  children: FamilyMember[];
  schoolingByMember: Record<string, Schooling[]>;
}

function getExpectedSchoolYear(birthDate: string, level: SchoolingLevel): string {
  const birth = new Date(birthDate);
  const startAge = SCHOOLING_LEVEL_START_AGE[level];
  const startYear = birth.getFullYear() + startAge;
  // School year starts in September
  // If born after September, the child starts a year later
  const adjustedYear = birth.getMonth() >= 8 ? startYear + 1 : startYear;
  return `${adjustedYear}-${adjustedYear + 1}`;
}

function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${year + 1}`;
}

export function SchoolingTimeline({
  children,
  schoolingByMember,
}: SchoolingTimelineProps) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchooling, setEditingSchooling] = useState<Schooling | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const schoolingEntries = schoolingByMember[selectedChildId] ?? [];
  const currentSchoolYear = getCurrentSchoolYear();

  if (!selectedChild) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun enfant dans le foyer. Ajoutez un enfant dans les paramètres.
      </p>
    );
  }

  // Build timeline: existing entries + projected future levels
  const existingLevels = new Set(schoolingEntries.map((s) => s.level));
  const projectedLevels = SCHOOLING_LEVELS_ORDERED.filter(
    (level) => !existingLevels.has(level)
  ).map((level) => ({
    level,
    schoolYear: getExpectedSchoolYear(selectedChild.birthDate, level),
    projected: true,
  }));

  const handleEdit = (schooling: Schooling) => {
    setEditingSchooling(schooling);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingSchooling(undefined);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteSchooling(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ChildSelector
          selectedId={selectedChildId}
          onSelect={setSelectedChildId}
        >
          {children}
        </ChildSelector>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une année
        </Button>
      </div>

      {schoolingEntries.length === 0 && projectedLevels.length > 0 ? (
        <div className="space-y-6">
          <EmptyState
            icon={GraduationCap}
            title="Aucune année enregistrée"
            description={`Ajoutez les années scolaires de ${selectedChild.firstName} ou consultez la timeline prévisionnelle ci-dessous.`}
            actionLabel="Ajouter une année"
            onAction={handleAdd}
          />

          <div>
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Timeline prévisionnelle
            </h3>
            <div className="relative ml-4 border-l-2 border-dashed border-muted-foreground/30 pl-6">
              {projectedLevels.slice(0, 8).map(({ level, schoolYear }) => (
                <div key={level} className="mb-4 relative">
                  <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {SCHOOLING_LEVEL_LABELS[level]}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{schoolYear}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : schoolingEntries.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Aucune année enregistrée"
          description={`Commencez à suivre la scolarité de ${selectedChild.firstName}.`}
          actionLabel="Ajouter une année"
          onAction={handleAdd}
        />
      ) : (
        <div className="space-y-6">
          {/* Existing entries timeline */}
          <div className="relative ml-4 border-l-2 border-primary/30 pl-6">
            {schoolingEntries.map((entry) => {
              const isCurrent = entry.schoolYear === currentSchoolYear;
              return (
                <div key={entry.id} className="mb-6 relative">
                  <div
                    className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ${
                      isCurrent ? "bg-primary ring-4 ring-primary/20" : "bg-primary/50"
                    }`}
                  />
                  <Card className={isCurrent ? "border-primary/30" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {SCHOOLING_LEVEL_LABELS[entry.level as SchoolingLevel] ?? entry.level}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {entry.schoolYear}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {isCurrent && (
                            <Badge variant="default" className="mr-2">
                              En cours
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"

                        aria-label="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"

                        aria-label="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {entry.establishment && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {entry.establishment}
                          </span>
                        )}
                        {entry.teacher && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {entry.teacher}
                          </span>
                        )}
                        {entry.className && (
                          <Badge variant="outline">{entry.className}</Badge>
                        )}
                      </div>
                      {entry.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {entry.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Projected future levels */}
          {projectedLevels.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                Prochaines étapes
              </h3>
              <div className="relative ml-4 border-l-2 border-dashed border-muted-foreground/30 pl-6">
                {projectedLevels.slice(0, 5).map(({ level, schoolYear }) => (
                  <div key={level} className="mb-4 relative">
                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {SCHOOLING_LEVEL_LABELS[level]}
                    </p>
                    <p className="text-xs text-muted-foreground/70">{schoolYear}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <SchoolingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        memberId={selectedChildId}
        schooling={editingSchooling}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette année scolaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
