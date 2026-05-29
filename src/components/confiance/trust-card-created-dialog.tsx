"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, ExternalLink } from "lucide-react";

interface Props {
  pin: string;
  shareUrl: string;
  label: string | null;
  onClose: () => void;
}

export function TrustCardCreatedDialog({ pin, shareUrl, label, onClose }: Props) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const { toast } = useToast();

  async function copy(value: string, type: "url" | "pin") {
    try {
      await navigator.clipboard.writeText(value);
      if (type === "url") {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
      }
    } catch {
      toast({
        title: "Copie impossible",
        description: "Sélectionne le texte à la main",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Carnet créé{label ? ` — ${label}` : ""} 🎉</DialogTitle>
          <DialogDescription>
            Envoie le lien à la personne et donne-lui le PIN <strong>par un autre moyen</strong> (SMS, oral).
            Ne mets jamais le lien et le PIN dans le même message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Lien à partager</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded truncate">{shareUrl}</code>
              <Button size="icon" variant="outline" onClick={() => copy(shareUrl, "url")} aria-label="Copier le lien">
                {copiedUrl ? <Check className="h-4 w-4 text-warm-green" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Code PIN (4 chiffres)</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 text-2xl font-mono tracking-[0.5em] text-center bg-warm-teal/10 text-warm-teal px-3 py-3 rounded font-semibold">
                {pin}
              </code>
              <Button size="icon" variant="outline" onClick={() => copy(pin, "pin")} aria-label="Copier le PIN">
                {copiedPin ? <Check className="h-4 w-4 text-warm-green" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Ce PIN ne sera plus jamais affiché. Note-le ou copie-le maintenant.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button asChild>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Tester le lien
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
