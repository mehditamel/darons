"use client";

import { useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsSubmitting(true);
    setError(null);

    const result = isEditing
      ? await updateIdentityDocument(document.id, data)
      : await createIdentityDocument(data);

    setIsSubmitting(false);

    if (result.success) {
      reset();
      onOpenChange(false);
    } else {
      setError(result.error ?? "Une erreur est survenue");
    }
  };

  const documentTypes = Object.entries(DOCUMENT_TYPE_LABELS) as [DocumentType, string][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
              <SelectTrigger>
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
              <p className="text-xs text-destructive">{errors.memberId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select
              value={watch("documentType")}
              onValueChange={(v) => setValue("documentType", v as DocumentType, { shouldValidate: true })}
            >
              <SelectTrigger>
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
              <p className="text-xs text-destructive">{errors.documentType.message}</p>
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
              <Label htmlFor="expiryDate">Date d&apos;expiration</Label>
              <Input id="expiryDate" type="date" {...register("expiryDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuingAuthority">Autorité de délivrance (optionnel)</Label>
            <Input id="issuingAuthority" {...register("issuingAuthority")} placeholder="Ex: Préfecture de..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "En cours..." : isEditing ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
