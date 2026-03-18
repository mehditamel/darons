"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle, Trash2, Edit } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { AllergyForm } from "@/components/sante-enrichie/allergy-form";
import { deleteAllergy } from "@/lib/actions/health-enriched";
import { useToast } from "@/hooks/use-toast";
import type { Allergy, AllergySeverity } from "@/types/health";
import { ALLERGY_SEVERITY_LABELS } from "@/types/health";

interface AllergiesListProps {
  memberId: string;
  allergies: Allergy[];
}

const SEVERITY_COLORS: Record<AllergySeverity, string> = {
  mild: "bg-yellow-100 text-yellow-700 border-yellow-200",
  moderate: "bg-orange-100 text-orange-700 border-orange-200",
  severe: "bg-red-100 text-red-700 border-red-200",
};

export function AllergiesList({ memberId, allergies }: AllergiesListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editAllergy, setEditAllergy] = useState<Allergy | undefined>();
  const { toast } = useToast();

  const handleEdit = (allergy: Allergy) => {
    setEditAllergy(allergy);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditAllergy(undefined);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteAllergy(id);
    if (!result.success) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const activeAllergies = allergies.filter((a) => a.active);
  const inactiveAllergies = allergies.filter((a) => !a.active);

  if (allergies.length === 0) {
    return (
      <>
        <EmptyState
          icon={AlertTriangle}
          title="Aucune allergie enregistr\u00e9e"
          description="Enregistrez les allergies et intol\u00e9rances pour faciliter le suivi m\u00e9dical."
          actionLabel="Ajouter une allergie"
          onAction={handleNew}
        />
        <AllergyForm
          open={formOpen}
          onOpenChange={setFormOpen}
          memberId={memberId}
          existing={editAllergy}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une allergie
        </Button>
      </div>

      {activeAllergies.length > 0 && (
        <div className="space-y-2">
          {activeAllergies.map((allergy) => (
            <Card key={allergy.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">{allergy.allergen}</p>
                    {allergy.reaction && (
                      <p className="text-xs text-muted-foreground">
                        R\u00e9action : {allergy.reaction}
                      </p>
                    )}
                    {allergy.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {allergy.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={SEVERITY_COLORS[allergy.severity]}
                  >
                    {ALLERGY_SEVERITY_LABELS[allergy.severity]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(allergy)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(allergy.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {inactiveAllergies.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Allergies r\u00e9solues / inactives
          </p>
          <div className="space-y-2 opacity-60">
            {inactiveAllergies.map((allergy) => (
              <Card key={allergy.id}>
                <CardContent className="py-2 px-4 flex items-center justify-between">
                  <p className="text-sm line-through">{allergy.allergen}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(allergy.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <AllergyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        memberId={memberId}
        existing={editAllergy}
      />
    </>
  );
}
