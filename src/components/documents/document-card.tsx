"use client";

import { FileText, Image, File, Trash2, Download, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { DocumentWithMember } from "@/lib/actions/documents";
import { DOCUMENT_CATEGORY_LABELS } from "@/types/budget";

interface DocumentCardProps {
  document: DocumentWithMember;
  onPreview: (doc: DocumentWithMember) => void;
  onDelete: (doc: DocumentWithMember) => void;
}

function getFileIcon(mimeType: string | null) {
  if (mimeType?.startsWith("image/")) return Image;
  if (mimeType === "application/pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentCard({ document, onPreview, onDelete }: DocumentCardProps) {
  const Icon = getFileIcon(document.mimeType);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{document.title}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {DOCUMENT_CATEGORY_LABELS[document.category]}
              </Badge>
              {document.memberFirstName && (
                <span className="text-xs text-muted-foreground">
                  {document.memberFirstName} {document.memberLastName}
                </span>
              )}
            </div>
            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>{formatDate(document.uploadedAt)}</span>
            </div>
            {document.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{document.description}</p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onPreview(document)} aria-label="Prévisualiser">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(document)} aria-label="Supprimer">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
