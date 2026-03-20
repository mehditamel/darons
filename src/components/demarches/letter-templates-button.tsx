"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LetterTemplateDialog } from "./letter-template-dialog";
import { LETTER_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/letter-templates";

export function LetterTemplatesButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-warm-blue" />
            Modèles de courriers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Des modèles de courriers pré-rédigés pour tes démarches administratives.
            Copie, personnalise et envoie.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {LETTER_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-2 rounded-lg border p-2.5"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{template.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {TEMPLATE_CATEGORIES[template.category] ?? template.category}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => setOpen(true)} className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Ouvrir les modèles
          </Button>
        </CardContent>
      </Card>

      <LetterTemplateDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
