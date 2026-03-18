"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import Image from "next/image";
import { getDocumentSignedUrl } from "@/lib/actions/documents";
import type { DocumentWithMember } from "@/lib/actions/documents";

interface DocumentPreviewProps {
  document: DocumentWithMember | null;
  onClose: () => void;
}

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!document) {
      setSignedUrl(null);
      return;
    }

    setLoading(true);
    getDocumentSignedUrl(document.filePath).then((result) => {
      setSignedUrl(result.data ?? null);
      setLoading(false);
    });
  }, [document]);

  const isImage = document?.mimeType?.startsWith("image/");
  const isPdf = document?.mimeType === "application/pdf";

  return (
    <Dialog open={!!document} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{document?.title}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        )}

        {!loading && signedUrl && (
          <div className="space-y-4">
            {isImage && (
              <div className="relative flex justify-center" style={{ minHeight: "300px" }}>
                <Image
                  src={signedUrl}
                  alt={document?.title ?? "Document"}
                  fill
                  className="rounded-lg object-contain"
                  unoptimized
                />
              </div>
            )}

            {isPdf && (
              <iframe
                src={signedUrl}
                className="w-full h-[60vh] rounded-lg border"
                title={document?.title ?? "Document PDF"}
              />
            )}

            {!isImage && !isPdf && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  La prévisualisation n&apos;est pas disponible pour ce type de fichier.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir
                </a>
              </Button>
              <Button asChild>
                <a href={signedUrl} download={document?.title}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </a>
              </Button>
            </div>
          </div>
        )}

        {!loading && !signedUrl && document && (
          <p className="text-sm text-destructive py-8 text-center">
            Impossible de charger le document. Réessayez plus tard.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
