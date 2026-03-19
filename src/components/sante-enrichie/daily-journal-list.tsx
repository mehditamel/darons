"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Moon, UtensilsCrossed, Baby, Monitor, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { DailyJournalForm } from "@/components/sante-enrichie/daily-journal-form";
import { deleteDailyJournalEntry } from "@/lib/actions/health-enriched";
import { useToast } from "@/hooks/use-toast";
import { differenceInMonths } from "date-fns";
import type { DailyHealthJournal } from "@/types/health";
import type { FamilyMember } from "@/types/family";
import {
  MOOD_ICONS,
  MOOD_LABELS,
  SLEEP_QUALITY_LABELS,
  APPETITE_LABELS,
  STOOL_LABELS,
} from "@/types/health";

interface DailyJournalListProps {
  member: FamilyMember;
  entries: DailyHealthJournal[];
}

export function DailyJournalList({ member, entries }: DailyJournalListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<DailyHealthJournal | undefined>();
  const { toast } = useToast();

  const childAgeMonths = differenceInMonths(new Date(), new Date(member.birthDate));
  const isInfant = childAgeMonths < 24;

  const handleEdit = (entry: DailyHealthJournal) => {
    setEditEntry(entry);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditEntry(undefined);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteDailyJournalEntry(id);
    if (!result.success) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (entries.length === 0) {
    return (
      <>
        <EmptyState
          icon={Baby}
          title="Journal quotidien vide"
          description={`Suivez l'humeur, le sommeil, l'appétit et les habitudes de ${member.firstName} au quotidien.`}
          actionLabel="Ajouter une entrée"
          onAction={handleNew}
        />
        <DailyJournalForm
          open={formOpen}
          onOpenChange={setFormOpen}
          memberId={member.id}
          existing={editEntry}
          isInfant={isInfant}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle entrée
        </Button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleEdit(entry)}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {entry.mood ? MOOD_ICONS[entry.mood] : "—"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(entry.entryDate).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {entry.sleepHours !== null && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Moon className="h-3 w-3" />
                          {entry.sleepHours}h
                          {entry.sleepQuality && ` (${SLEEP_QUALITY_LABELS[entry.sleepQuality]})`}
                        </Badge>
                      )}
                      {entry.appetite && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <UtensilsCrossed className="h-3 w-3" />
                          {APPETITE_LABELS[entry.appetite]}
                        </Badge>
                      )}
                      {entry.stools && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Baby className="h-3 w-3" />
                          {STOOL_LABELS[entry.stools]}
                        </Badge>
                      )}
                      {entry.screenTimeMinutes !== null && entry.screenTimeMinutes > 0 && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Monitor className="h-3 w-3" />
                          {entry.screenTimeMinutes} min
                        </Badge>
                      )}
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleDelete(entry.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <DailyJournalForm
        open={formOpen}
        onOpenChange={setFormOpen}
        memberId={member.id}
        existing={editEntry}
        isInfant={isInfant}
      />
    </>
  );
}
