"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";

interface ExportPdfButtonProps {
  hasAccess: boolean;
}

export function ExportPdfButton({ hasAccess }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/export/pdf");

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error ?? "Impossible de générer le bilan",
          variant: "destructive",
        });
        return;
      }

      const html = await response.text();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Open in new tab for printing
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }

      toast({
        title: "Bilan généré",
        description:
          "Le bilan annuel s'ouvre dans un nouvel onglet. Utilisez Ctrl+P pour l'imprimer en PDF.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de générer le bilan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading || !hasAccess}
    >
      <FileDown className="h-4 w-4 mr-2" />
      {loading ? "Génération..." : "Exporter le bilan annuel (PDF)"}
    </Button>
  );
}
