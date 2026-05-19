"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Video } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { deleteMemory } from "@/lib/actions/capsule";
import { useToast } from "@/hooks/use-toast";
import type { MemoryWithUrl } from "@/types/capsule";

interface Props {
  memories: MemoryWithUrl[];
}

export function MemoryGallery({ memories }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<MemoryWithUrl | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce souvenir ?")) return;
    setDeleting(id);
    const result = await deleteMemory(id);
    setDeleting(null);
    if (result.success) {
      toast({ title: "Souvenir supprimé" });
      setSelected(null);
      router.refresh();
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  }

  if (memories.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
        <p className="text-sm font-medium">Aucun souvenir pour l'instant</p>
        <p className="text-xs mt-1">Upload tes premières photos pour nourrir la Capsule.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {memories.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="group relative aspect-square rounded-lg overflow-hidden border bg-muted hover:border-warm-purple transition-all"
          >
            {m.memoryType === "video" ? (
              <div className="w-full h-full flex items-center justify-center bg-warm-darkblue text-white">
                <Video className="h-8 w-8" />
              </div>
            ) : m.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.signedUrl}
                alt={m.caption ?? "Souvenir"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs truncate">
                {format(new Date(m.memoryDate), "d MMM yyyy", { locale: fr })}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {format(new Date(selected.memoryDate), "d MMMM yyyy", { locale: fr })}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {selected.memoryType === "video" && selected.signedUrl ? (
                  <video
                    src={selected.signedUrl}
                    controls
                    className="w-full max-h-[60vh] rounded"
                  />
                ) : selected.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.signedUrl}
                    alt={selected.caption ?? ""}
                    className="w-full max-h-[60vh] object-contain rounded"
                  />
                ) : null}
                {selected.caption && (
                  <p className="text-sm">{selected.caption}</p>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting === selected.id}
                  >
                    {deleting === selected.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Supprimer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
