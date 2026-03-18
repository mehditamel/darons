"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, Pill, Lock } from "lucide-react";
import { createPrescription } from "@/lib/actions/health-enriched";
import { useToast } from "@/hooks/use-toast";
import type { FamilyMember } from "@/types/family";
import type { Medication } from "@/types/health";

interface PrescriptionUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: FamilyMember;
}

export function PrescriptionUpload({
  open,
  onOpenChange,
  member,
}: PrescriptionUploadProps) {
  const { toast } = useToast();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [ocrText, setOcrText] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      practitioner: "",
      prescriptionDate: "",
      notes: "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Erreur OCR",
          description: error.error ?? "Impossible de traiter l'image",
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();
      setOcrText(result.text ?? "");
      setMedications(result.medications ?? []);

      toast({
        title: "OCR termin\u00e9",
        description: `${result.medications?.length ?? 0} m\u00e9dicament(s) d\u00e9tect\u00e9(s)`,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'image",
        variant: "destructive",
      });
    } finally {
      setOcrLoading(false);
    }
  };

  const onSubmit = async (data: {
    practitioner: string;
    prescriptionDate: string;
    notes: string;
  }) => {
    const result = await createPrescription({
      memberId: member.id,
      householdId: member.householdId,
      ocrText: ocrText || undefined,
      medications,
      practitioner: data.practitioner || undefined,
      prescriptionDate: data.prescriptionDate || undefined,
      notes: data.notes || undefined,
    });

    if (!result.success) {
      toast({
        title: "Erreur",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ordonnance enregistr\u00e9e",
    });
    reset();
    setMedications([]);
    setOcrText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une ordonnance</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Scanner / Photographier l'ordonnance (OCR)</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {ocrLoading ? "Analyse en cours..." : "Choisir une image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={ocrLoading}
                />
              </label>
              {ocrLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formats accept\u00e9s : JPG, PNG, PDF. L'OCR extraira automatiquement les m\u00e9dicaments.
            </p>
          </div>

          {medications.length > 0 && (
            <div>
              <Label>M\u00e9dicaments d\u00e9tect\u00e9s</Label>
              <div className="space-y-2 mt-1">
                {medications.map((med: Medication, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded border bg-muted/30"
                  >
                    <Pill className="h-4 w-4 text-blue-500" />
                    <div className="text-sm">
                      <span className="font-medium">{med.name}</span>
                      {med.dosage && (
                        <span className="text-muted-foreground"> — {med.dosage}</span>
                      )}
                      {med.frequency && (
                        <span className="text-muted-foreground">
                          {" "}
                          | {med.frequency}
                        </span>
                      )}
                      {med.duration && (
                        <span className="text-muted-foreground">
                          {" "}
                          | {med.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="practitioner">Praticien</Label>
              <Input
                id="practitioner"
                placeholder="Dr Martin"
                {...register("practitioner")}
              />
            </div>
            <div>
              <Label htmlFor="prescriptionDate">Date</Label>
              <Input
                id="prescriptionDate"
                type="date"
                {...register("prescriptionDate")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Instructions particuli\u00e8res..."
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || ocrLoading}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
