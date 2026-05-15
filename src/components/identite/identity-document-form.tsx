"use client";

import { useState, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormError } from "@/components/shared/form-error";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import {
  identityDocumentSchema,
  type IdentityDocumentFormData,
} from "@/lib/validators/family";
import {
  createIdentityDocument,
  updateIdentityDocument,
} from "@/lib/actions/identity";
import type { IdentityDocumentWithMember } from "@/lib/actions/identity";
import type { FamilyMember } from "@/types/family";
import { DOCUMENT_TYPE_LABELS, type DocumentType } from "@/types/family";

interface IdentityDocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: FamilyMember[];
  document?: IdentityDocumentWithMember;
}

export function IdentityDocumentForm({
  open,
  onOpenChange,
  members,
  document,
}: IdentityDocumentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const lastSubmitData = useRef<IdentityDocumentFormData | null>(null);
  const feedback = useActionFeedback();
  const isEditing = !!document;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IdentityDocumentFormData>({
    resolver: zodResolver(identityDocumentSchema),
    defaultValues: document
      ? {
          memberId: document.memberId,
          documentType: document.documentType,
          documentNumber: document.documentNumber ?? "",
          issueDate: document.issueDate ?? "",
          expiryDate: document.expiryDate ?? "",
          issuingAuthority: document.issuingAuthority ?? "",
        }
      : {
          memberId: members[0]?.id ?? "",
          documentType: undefined,
          documentNumber: "",
          issueDate: "",
          expiryDate: "",
          issuingAuthority: "",
        },
  });

  const onSubmit = async (data: IdentityDocumentFormData) => {
    lastSubmitData.current = data;
    setError(null);

    startTransition(async () => {
      const result = isEditing
        ? await updateIdentityDocument(document.id, data)
        : await createIdentityDocument(data);

      if (result.success) {
        reset();
        onOpenChange(false);
        feedback.success({
          title: isEditing ? "Document mis à jour" : "Document ajouté",
          description: data.expiryDate
            ? "On te préviendra avant qu'il expire."
            : "Tu peux toujours ajouter une date d'expiration plus tard.",
        });
      } else {
        setError(result.error ?? "Une erreur est survenue");
        feedback.error({
          title: isEditing ? "Mise à jour impossible" : "Ajout impossible",
          description: result.error ?? "Réessaie dans quelques instants.",
        });
      }
    });
  };

  const handleRetry = () => {
    if (lastSubmitData.current) {
      onSubmit(lastSubmitData.current);
    }
  };

  const documentTypes = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-label={isEditing ? "Modifier le document" : "Ajouter un document d'identité"}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le document" : "Ajouter un document d'identité"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du document"
              : "Enregistrez un document d'identité pour un membre du foyer"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Membre</Label>
            <Select
              value={watch("memberId")}
              onValueChange={(v) => setValue("memberId", v, { shouldValidate: true })}
            >
              <SelectTrigger aria-describedby={errors.memberId ? "memberId-error" : undefined}>
                <SelectValue placeholder="Sélectionner un membre" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.firstName} {m.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.memberId && (
              <p id="memberId-error" className="text-xs text-destructive" role="alert">{errors.memberId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select
              value={watch("documentType")}
              onValueChange={(v) => setValue("documentType", v as DocumentType, { shouldValidate: true })}
            >
              <SelectTrigger aria-describedby={errors.documentType ? "documentType-error" : undefined}>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.documentType && (
              <p id="documentType-error" className="text-xs text-destructive" role="alert">{errors.documentType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Numéro (optionnel)</Label>
            <Input id="documentNumber" {...register("documentNumber")} placeholder="N° du document" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Date de délivrance</Label>
              <Input id="issueDate" type="date" {...register("issueDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Date d'expiration</Label>
              <Input id="expiryDate" type="date" {...register("expiryDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuingAuthority">Autorité de délivrance (optionnel)</Label>
            <Input id="issuingAuthority" {...register("issuingAuthority")} placeholder="Ex: Préfecture de..." />
          </div>

          <FormError message={error} onRetry={handleRetry} id="form-error" />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "En cours..." : isEditing ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
