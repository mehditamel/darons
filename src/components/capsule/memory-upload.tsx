"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, Upload } from "lucide-react";
import { uploadMemory } from "@/lib/actions/capsule";
import {
  ACCEPTED_MEMORY_MIMES,
  MAX_MEMORY_SIZE_BYTES,
} from "@/lib/validators/capsule";

interface Props {
  memberId: string;
}

export function MemoryUpload({ memberId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [memoryDate, setMemoryDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function pickFile(f: File | null) {
    if (!f) return;
    if (f.size > MAX_MEMORY_SIZE_BYTES) {
      toast({ title: "Fichier trop lourd", description: "Max 10 Mo", variant: "destructive" });
      return;
    }
    if (!ACCEPTED_MEMORY_MIMES.includes(f.type)) {
      toast({
        title: "Format non supporté",
        description: "JPEG, PNG, WebP, HEIC, MP4 ou MOV",
        variant: "destructive",
      });
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function submit() {
    if (!file) {
      toast({ title: "Choisis une photo ou vidéo", variant: "destructive" });
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("memberId", memberId);
    fd.append("memoryDate", memoryDate);
    if (caption) fd.append("caption", caption);

    const result = await uploadMemory(fd);
    setUploading(false);

    if (result.success) {
      toast({ title: "Souvenir ajouté ✨" });
      setFile(null);
      setCaption("");
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <div className="cursor-pointer rounded-lg border-2 border-dashed border-warm-purple/40 hover:border-warm-purple bg-warm-purple/5 hover:bg-warm-purple/10 transition-colors p-6 text-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Aperçu"
              className="max-h-48 mx-auto rounded mb-2"
            />
          ) : file ? (
            <div className="text-sm">
              <Upload className="h-8 w-8 mx-auto mb-2 text-warm-purple" />
              {file.name}
            </div>
          ) : (
            <>
              <Camera className="h-8 w-8 mx-auto mb-2 text-warm-purple" />
              <div className="text-sm font-medium">Ajouter une photo ou vidéo</div>
              <div className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, WebP, MP4 — max 10 Mo
              </div>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_MEMORY_MIMES.join(",")}
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="space-y-2">
        <Label htmlFor="caption">Légende (optionnelle)</Label>
        <Input
          id="caption"
          placeholder="Premier sourire, sortie au parc..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="memoryDate">Date du souvenir</Label>
        <Input
          id="memoryDate"
          type="date"
          value={memoryDate}
          onChange={(e) => setMemoryDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <Button onClick={submit} disabled={uploading || !file} className="w-full">
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Upload en cours…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" /> Sauvegarder le souvenir
          </>
        )}
      </Button>
    </div>
  );
}
