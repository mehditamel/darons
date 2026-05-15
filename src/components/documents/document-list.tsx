"use client";

import { useState } from "react";
import { Plus, FolderLock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { DocumentCard } from "@/components/documents/document-card";
import { DocumentUploadForm } from "@/components/documents/document-upload-form";
import { DocumentPreview } from "@/components/documents/document-preview";
import { deleteDocument } from "@/lib/actions/documents";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { DocumentWithMember } from "@/lib/actions/documents";
import type { FamilyMember } from "@/types/family";
import { DOCUMENT_CATEGORY_LABELS, type DocumentCategory } from "@/types/budget";

interface DocumentListProps {
  documents: DocumentWithMember[];
  members: FamilyMember[];
}

export function DocumentList({ documents, members }: DocumentListProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentWithMember | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<DocumentWithMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterMember, setFilterMember] = useState<string>("all");
  const feedback = useActionFeedback();

  const filtered = documents.filter((doc) => {
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory !== "all" && doc.category !== filterCategory) return false;
    if (filterMember !== "all" && doc.memberId !== filterMember) return false;
    return true;
  });

  const handleDelete = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);
    const title = deletingDoc.title;
    const result = await deleteDocument(deletingDoc.id);
    setIsDeleting(false);
    setDeletingDoc(null);
    if (result.success) {
      feedback.success({
        title: "Document supprimé",
        description: `« ${title} » a quitté ton coffre-fort.`,
      });
    } else {
      feedback.error({
        title: "Suppression impossible",
        description: result.error ?? "Réessaie dans quelques instants.",
      });
    }
  };

  const categories = Object.entries(DOCUMENT_CATEGORY_LABELS) as [DocumentCategory, string][];

  if (documents.length === 0) {
    return (
      <>
        <EmptyState
          icon={FolderLock}
          title="Ton coffre-fort est vide"
          description="Ordonnances, certificats, factures — tout au même endroit, en sécurité. Plus jamais à chercher ce papier introuvable."
          actionLabel="Importer un premier document"
          onAction={() => setUploadOpen(true)}
        />
        <DocumentUploadForm open={uploadOpen} onOpenChange={setUploadOpen} members={members} />
      </>
    );
  }

  if (filtered.length === 0 && documents.length > 0) {
    return (
      <>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterMember} onValueChange={setFilterMember}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Membre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les membres</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.firstName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Importer
          </Button>
        </div>
        <div className="rounded-2xl border border-dashed border-muted-foreground/30 p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground/60" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">Aucun document ne correspond.</p>
          <p className="mt-1 text-xs text-muted-foreground">Essaie d'élargir tes filtres ou ta recherche.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setFilterCategory("all");
              setFilterMember("all");
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
        <DocumentUploadForm open={uploadOpen} onOpenChange={setUploadOpen} members={members} />
      </>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMember} onValueChange={setFilterMember}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Membre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les membres</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.firstName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Importer
        </Button>
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground mb-3">
        {filtered.length} document{filtered.length > 1 ? "s" : ""}
        {filtered.length !== documents.length && ` sur ${documents.length}`}
      </p>

      <div className="space-y-3">
        {filtered.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onPreview={setPreviewDoc}
            onDelete={setDeletingDoc}
          />
        ))}
      </div>

      <DocumentUploadForm open={uploadOpen} onOpenChange={setUploadOpen} members={members} />

      <DocumentPreview
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <AlertDialog open={!!deletingDoc} onOpenChange={(open) => { if (!open) setDeletingDoc(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le document « {deletingDoc?.title} » sera définitivement supprimé du coffre-fort.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
