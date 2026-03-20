"use client";

import { useState } from "react";
import {
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { EmptyState } from "@/components/shared/empty-state";
import { MilestoneForm } from "./milestone-form";
import { deleteMilestone } from "@/lib/actions/educational";
import { formatDate } from "@/lib/utils";
import type { DevelopmentMilestone, MilestoneCategory } from "@/types/health";
import { MILESTONE_CATEGORY_LABELS } from "@/types/health";
import { DEVELOPMENT_MILESTONES_REFERENCE } from "@/lib/constants";

interface MilestoneProgressProps {
  memberId: string;
  milestones: DevelopmentMilestone[];
  childAgeMonths: number;
}

const CATEGORY_COLORS: Record<MilestoneCategory, string> = {
  motricite: "bg-blue-500",
  langage: "bg-purple-500",
  cognition: "bg-amber-500",
  social: "bg-teal-500",
  autonomie: "bg-orange-500",
};

const CATEGORY_BG_COLORS: Record<MilestoneCategory, string> = {
  motricite: "bg-blue-50 text-blue-700 border-blue-200",
  langage: "bg-purple-50 text-purple-700 border-purple-200",
  cognition: "bg-amber-50 text-amber-700 border-amber-200",
  social: "bg-teal-50 text-teal-700 border-teal-200",
  autonomie: "bg-orange-50 text-orange-700 border-orange-200",
};

export function MilestoneProgress({
  memberId,
  milestones,
  childAgeMonths,
}: MilestoneProgressProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<DevelopmentMilestone | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingMilestone(undefined);
    setFormOpen(true);
  };

  const handleEdit = (milestone: DevelopmentMilestone) => {
    setEditingMilestone(milestone);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteMilestone(deletingId);
    setDeletingId(null);
  };

  // Group milestones by category
  const categories: MilestoneCategory[] = ["motricite", "langage", "cognition", "social", "autonomie"];

  // Calculate progress per category
  const progressByCategory = categories.map((category) => {
    // Reference milestones for this category up to child's age
    const referenceForCategory = DEVELOPMENT_MILESTONES_REFERENCE.filter(
      (ref) => ref.category === category && ref.expectedAgeMonths <= childAgeMonths
    );
    const totalExpected = referenceForCategory.length;

    // User milestones for this category
    const userMilestones = milestones.filter((m) => m.category === category);
    const achieved = userMilestones.filter((m) => m.achievedDate !== null);

    const percentage = totalExpected > 0
      ? Math.min(100, Math.round((achieved.length / totalExpected) * 100))
      : 0;

    return {
      category,
      label: MILESTONE_CATEGORY_LABELS[category],
      total: totalExpected,
      achieved: achieved.length,
      percentage,
      milestones: userMilestones,
    };
  });

  if (milestones.length === 0) {
    return (
      <>
        <EmptyState
          icon={TrendingUp}
          title="Jalons de développement"
          description="Suivez les étapes clés du développement : motricité, langage, cognition, social et autonomie."
          actionLabel="Ajouter un jalon"
          onAction={handleAdd}
        />
        <MilestoneForm
          open={formOpen}
          onOpenChange={setFormOpen}
          memberId={memberId}
          milestone={editingMilestone}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un jalon
        </Button>
      </div>

      {/* Progress overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {progressByCategory.map(({ category, label, percentage, achieved, total }) => (
          <Card key={category}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{label}</span>
                <Badge variant="outline" className={CATEGORY_BG_COLORS[category]}>
                  {achieved}/{total}
                </Badge>
              </div>
              <Progress value={percentage} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {percentage}% acquis
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Milestones detail by category */}
      {progressByCategory.map(({ category, label, milestones: catMilestones }) => {
        if (catMilestones.length === 0) return null;
        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${CATEGORY_COLORS[category]}`} />
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {catMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {milestone.achievedDate ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{milestone.milestoneName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {milestone.expectedAgeMonths !== null && (
                            <span>Attendu : {milestone.expectedAgeMonths} mois</span>
                          )}
                          {milestone.achievedDate && (
                            <span>
                              <Sparkles className="inline h-3 w-3 mr-0.5" />
                              Acquis le {formatDate(milestone.achievedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(milestone)}
                        aria-label="Modifier ce jalon"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeletingId(milestone.id)}
                        aria-label="Supprimer ce jalon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <MilestoneForm
        open={formOpen}
        onOpenChange={setFormOpen}
        memberId={memberId}
        milestone={editingMilestone}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce jalon ?</AlertDialogTitle>
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
