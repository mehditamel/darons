"use client";

import { useState } from "react";
import {
  Palette,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  MapPin,
  Euro,
  Clock,
} from "lucide-react";
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
import { ActivityForm } from "./activity-form";
import { deleteActivity } from "@/lib/actions/educational";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FamilyMember } from "@/types/family";
import type { Activity, ActivityCategory } from "@/types/educational";
import { ACTIVITY_CATEGORY_LABELS } from "@/types/educational";

interface ActivityListProps {
  children: FamilyMember[];
  activitiesByMember: Record<string, Activity[]>;
}

export function ActivityList({
  children,
  activitiesByMember,
}: ActivityListProps) {
  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id ?? "");
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const activities = activitiesByMember[selectedChildId] ?? [];
  const activeActivities = activities.filter((a) => a.active);
  const inactiveActivities = activities.filter((a) => !a.active);

  // Calculate total monthly cost
  const totalMonthlyCost = activeActivities.reduce(
    (sum, a) => sum + (a.costMonthly ?? 0),
    0
  );

  if (!selectedChild) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun enfant dans le foyer. Ajoutez un enfant dans les paramètres.
      </p>
    );
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingActivity(undefined);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteActivity(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ChildSelector
          selectedId={selectedChildId}
          onSelect={setSelectedChildId}
        >
          {children}
        </ChildSelector>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une activité
        </Button>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="Aucune activité enregistrée"
          description={`Ajoutez les activités de ${selectedChild.firstName} : sport, musique, éveil... et suivez le planning familial.`}
          actionLabel="Ajouter une activité"
          onAction={handleAdd}
        />
      ) : (
        <>
          {/* Summary */}
          {activeActivities.length > 0 && (
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {activeActivities.length} activité{activeActivities.length > 1 ? "s" : ""} en cours
              </Badge>
              {totalMonthlyCost > 0 && (
                <Badge variant="outline" className="text-sm px-3 py-1">
                  <Euro className="mr-1 h-3.5 w-3.5" />
                  {formatCurrency(totalMonthlyCost)}/mois
                </Badge>
              )}
            </div>
          )}

          {/* Active activities */}
          {activeActivities.length > 0 && (
            <div className="space-y-3">
              {activeActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))}
            </div>
          )}

          {/* Inactive activities */}
          {inactiveActivities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Activités terminées
              </h3>
              {inactiveActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ActivityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        memberId={selectedChildId}
        activity={editingActivity}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette activité ?</AlertDialogTitle>
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

function ActivityCard({
  activity,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
}) {
  const categoryLabel = activity.category
    ? ACTIVITY_CATEGORY_LABELS[activity.category as ActivityCategory] ?? activity.category
    : null;

  return (
    <Card className={!activity.active ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{activity.name}</CardTitle>
            {categoryLabel && (
              <Badge variant="outline">{categoryLabel}</Badge>
            )}
            {!activity.active && (
              <Badge variant="secondary">Terminée</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
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
          {activity.provider && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {activity.provider}
            </span>
          )}
          {activity.schedule && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {activity.schedule}
            </span>
          )}
          {activity.costMonthly !== null && activity.costMonthly > 0 && (
            <span className="flex items-center gap-1">
              <Euro className="h-3.5 w-3.5" />
              {formatCurrency(activity.costMonthly)}/mois
            </span>
          )}
          {activity.startDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Depuis {formatDate(activity.startDate)}
              {activity.endDate && ` — jusqu'au ${formatDate(activity.endDate)}`}
            </span>
          )}
        </div>
        {activity.notes && (
          <p className="mt-2 text-sm text-muted-foreground">{activity.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
