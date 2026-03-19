"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FHIRSyncButtonProps {
  memberId: string;
  disabled?: boolean;
  onSyncComplete?: () => void;
}

export function FHIRSyncButton({ memberId, disabled, onSyncComplete }: FHIRSyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSync() {
    setLoading(true);
    try {
      const response = await fetch("/api/health/fhir/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erreur de synchronisation",
          description: data.error ?? "Une erreur est survenue.",
          variant: "destructive",
        });
        return;
      }

      const totalSynced = data.totalSynced ?? 0;
      const details = (data.results ?? [])
        .filter((r: { created: number; updated: number }) => r.created > 0 || r.updated > 0)
        .map((r: { resourceType: string; created: number; updated: number }) => {
          const typeLabels: Record<string, string> = {
            Immunization: "vaccins",
            Observation: "mesures",
            AllergyIntolerance: "allergies",
            DocumentReference: "documents",
          };
          return `${r.created + r.updated} ${typeLabels[r.resourceType] ?? r.resourceType}`;
        })
        .join(", ");

      toast({
        title: "Synchronisation terminée",
        description:
          totalSynced > 0
            ? `${totalSynced} élément(s) synchronisé(s) : ${details}`
            : "Tout est à jour, aucune nouvelle donnée.",
      });

      onSyncComplete?.();
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={disabled || loading}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Synchronisation..." : "Synchroniser"}
    </Button>
  );
}
