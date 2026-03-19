"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Cloud, CloudOff, Loader2, AlertCircle, Check } from "lucide-react";
import type { MESConnectionStatus } from "@/types/fhir";

interface FHIRSyncStatusProps {
  status: MESConnectionStatus | null;
  lastSyncAt: string | null;
  errorMessage?: string | null;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  return `il y a ${diffD}j`;
}

export function FHIRSyncStatus({ status, lastSyncAt, errorMessage }: FHIRSyncStatusProps) {
  if (!status || status === "disconnected") {
    return null;
  }

  const config: Record<string, { icon: React.ReactNode; label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | null }> = {
    connected: {
      icon: <Check className="h-3 w-3" />,
      label: "Synchronisé",
      variant: "secondary",
    },
    syncing: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: "Synchronisation...",
      variant: "outline",
    },
    error: {
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Erreur sync",
      variant: "destructive",
    },
    token_expired: {
      icon: <CloudOff className="h-3 w-3" />,
      label: "Reconnexion requise",
      variant: "destructive",
    },
  };

  const { icon, label, variant } = config[status] ?? config.connected;

  const tooltipContent = [
    `Mon Espace Santé : ${label}`,
    lastSyncAt ? `Dernière sync : ${formatRelativeTime(lastSyncAt)}` : null,
    errorMessage ? `Erreur : ${errorMessage}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="gap-1 text-xs">
            <Cloud className="h-3 w-3" />
            {icon}
            <span className="hidden sm:inline">MES</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="whitespace-pre-line text-xs">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
