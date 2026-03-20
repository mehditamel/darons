"use client";

import { useState, useMemo } from "react";
import { Copy, Check, FileText, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LETTER_TEMPLATES, TEMPLATE_CATEGORIES, type LetterTemplate } from "@/lib/letter-templates";
import { useToast } from "@/hooks/use-toast";

interface LetterTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LetterTemplateDialog({ open, onOpenChange }: LetterTemplateDialogProps) {
  const [selected, setSelected] = useState<LetterTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const groups: Record<string, LetterTemplate[]> = {};
    for (const template of LETTER_TEMPLATES) {
      const cat = template.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(template);
    }
    return groups;
  }, []);

  async function handleCopy() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copié !",
        description: "Le modèle a été copié. Remplace les champs entre {{ }} par tes informations.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier.",
        variant: "destructive",
      });
    }
  }

  function handleDownload() {
    if (!selected) return;
    const blob = new Blob([selected.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {selected ? selected.title : "Modèles de courriers"}
          </DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choisis un modèle, copie-le et remplace les champs entre {"{{ }}"} par tes informations.
            </p>
            {Object.entries(grouped).map(([category, templates]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {TEMPLATE_CATEGORIES[category] ?? category}
                </h3>
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelected(template)}
                  >
                    <CardContent className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{template.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {TEMPLATE_CATEGORIES[template.category] ?? template.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(null)}
            >
              ← Retour aux modèles
            </Button>

            <p className="text-xs text-muted-foreground">
              {selected.description}
            </p>

            <div className="rounded-lg border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {selected.content}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} className="flex-1">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier le modèle
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger (.txt)
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Remplace les champs entre {"{{ }}"} par tes propres informations avant d&apos;envoyer.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
