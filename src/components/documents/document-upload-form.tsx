"use client";

import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { uploadDocument } from "@/lib/actions/documents";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import { ConfettiBurst, useConfetti } from "@/components/shared/confetti-burst";
import { trackEvent } from "@/lib/analytics";
import { DOCUMENT_CATEGORY_LABELS, type DocumentCategory } from "@/types/budget";
import type { FamilyMember } from "@/types/family";
import { MAX_FILE_SIZE, ALLOWED_EXTENSIONS } from "@/lib/validators/documents";

interface DocumentUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: FamilyMember[];
  existingCount?: number;
}

export function DocumentUploadForm({
  open,
  onOpenChange,
  members,
  existingCount = 0,
}: DocumentUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [memberId, setMemberId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedback = useActionFeedback();
  const confetti = useConfetti();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("Le fichier dépasse la taille maximale (10 Mo)");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
      setError("Format non supporté. Formats acceptés : PDF, JPG, PNG, WEBP");
      return;
    }

    setSelectedFile(file);
    setError(null);
    if (!title) {
      setTitle(file.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title || !category) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("category", category);
    if (memberId) formData.append("memberId", memberId);
    if (description) formData.append("description", description);

    const result = await uploadDocument(formData);
    setIsSubmitting(false);

    if (result.success) {
      const uploadedTitle = title;
      const wasFirst = existingCount === 0;
      const uploadedCategory = category || "autre";
      setTitle("");
      setCategory("");
      setMemberId("");
      setDescription("");
      setSelectedFile(null);
      trackEvent("document_added", { type: uploadedCategory });
      if (wasFirst) {
        confetti.trigger();
        trackEvent("first_document_uploaded", { category: uploadedCategory });
        feedback.success({
          title: "Premier document sécurisé !",
          description: "Bienvenue dans le coffre-fort. On le garde au chaud.",
        });
        setTimeout(() => onOpenChange(false), 800);
      } else {
        onOpenChange(false);
        feedback.success({
          title: "Document ajouté au coffre-fort",
          description: uploadedTitle || "Tu le retrouveras dans la catégorie correspondante.",
        });
      }
    } else {
      setError(result.error ?? "Une erreur est survenue");
      feedback.error({
        title: "Upload impossible",
        description: result.error ?? "Réessaie dans quelques instants.",
      });
    }
  };

  const categories = Object.entries(DOCUMENT_CATEGORY_LABELS) as [DocumentCategory, string][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <ConfettiBurst active={confetti.isActive} />
        <DialogHeader>
          <DialogTitle>Importer un document</DialogTitle>
          <DialogDescription>
            Ajoutez un document au coffre-fort numérique de votre famille
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Fichier</Label>
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              {selectedFile ? (
                <p className="text-sm font-medium">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner un fichier (PDF, JPG, PNG)
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">10 Mo maximum</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Sélectionner un fichier"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="docTitle">Titre</Label>
            <Input
              id="docTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom du document"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Membre (optionnel)</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Foyer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Document foyer</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docDescription">Description (optionnel)</Label>
            <Textarea
              id="docDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description..."
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedFile || !title || !category}>
              {isSubmitting ? "Import en cours..." : "Importer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
