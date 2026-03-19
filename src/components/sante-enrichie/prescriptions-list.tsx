"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Trash2, Pill, Lock } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PrescriptionUpload } from "@/components/sante-enrichie/prescription-upload";
import { deletePrescription } from "@/lib/actions/health-enriched";
import { useToast } from "@/hooks/use-toast";
import type { Prescription } from "@/types/health";
import type { FamilyMember } from "@/types/family";

interface PrescriptionsListProps {
  member: FamilyMember;
  prescriptions: Prescription[];
}

export function PrescriptionsList({
  member,
  prescriptions,
}: PrescriptionsListProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const result = await deletePrescription(id);
    if (!result.success) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  if (prescriptions.length === 0) {
    return (
      <>
        <EmptyState
          icon={FileText}
          title="Aucune ordonnance"
          description={`Scannez ou photographiez les ordonnances de ${member.firstName} pour les numériser.`}
          actionLabel="Ajouter une ordonnance"
          onAction={() => setUploadOpen(true)}
        />
        <PrescriptionUpload
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          member={member}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle ordonnance
        </Button>
      </div>

      <div className="space-y-3">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardContent className="py-3 px-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {prescription.practitioner ?? "Ordonnance"}
                      </p>
                      {prescription.prescriptionDate && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(prescription.prescriptionDate).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      )}
                    </div>
                    {prescription.medications.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prescription.medications.map((med, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs gap-1"
                          >
                            <Pill className="h-3 w-3" />
                            {med.name}
                            {med.dosage && ` — ${med.dosage}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {prescription.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {prescription.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(prescription.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PrescriptionUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        member={member}
      />
    </>
  );
}
