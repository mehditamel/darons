"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudOff, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MESConsentDialog } from "./mes-consent-dialog";
import { FHIRSyncButton } from "./fhir-sync-button";
import type { MESConnectionStatus } from "@/types/fhir";

interface MemberConnection {
  memberId: string;
  memberName: string;
  status: MESConnectionStatus | null;
  lastSyncAt: string | null;
  errorMessage: string | null;
  syncedCounts: {
    vaccinations: number;
    growthMeasurements: number;
    allergies: number;
  };
}

interface MESConnectionCardProps {
  childMembers: Array<{ id: string; firstName: string }>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  connected: { label: "Connecté", variant: "secondary" },
  syncing: { label: "Synchronisation...", variant: "outline" },
  error: { label: "Erreur", variant: "destructive" },
  token_expired: { label: "Reconnexion requise", variant: "destructive" },
  disconnected: { label: "Déconnecté", variant: "outline" },
};

export function MESConnectionCard({ childMembers }: MESConnectionCardProps) {
  const [connections, setConnections] = useState<MemberConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const loadStatuses = useCallback(async () => {
    const results: MemberConnection[] = [];

    for (const child of childMembers) {
      try {
        const response = await fetch(`/api/health/fhir/status?memberId=${child.id}`);
        const data = await response.json();

        results.push({
          memberId: child.id,
          memberName: child.firstName,
          status: data.connected ? data.connection?.status ?? "connected" : null,
          lastSyncAt: data.connection?.lastSyncAt ?? null,
          errorMessage: data.connection?.errorMessage ?? null,
          syncedCounts: data.syncedCounts ?? { vaccinations: 0, growthMeasurements: 0, allergies: 0 },
        });
      } catch {
        results.push({
          memberId: child.id,
          memberName: child.firstName,
          status: null,
          lastSyncAt: null,
          errorMessage: null,
          syncedCounts: { vaccinations: 0, growthMeasurements: 0, allergies: 0 },
        });
      }
    }

    setConnections(results);
    setLoading(false);
  }, [childMembers]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  async function handleConnect(memberId: string) {
    setConnecting(true);
    try {
      const response = await fetch("/api/health/fhir/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erreur de connexion",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Redirect to OAuth
      window.location.href = data.authUrl;
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Impossible de démarrer la connexion.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect(memberId: string) {
    try {
      const response = await fetch("/api/health/fhir/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, deleteSyncedData: false }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Erreur",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Déconnexion réussie",
        description: "Les données synchronisées ont été conservées.",
      });

      loadStatuses();
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Impossible de déconnecter.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-accent-teal" />
          Mon Espace Santé
        </CardTitle>
        <CardDescription>
          Synchronisez les données de santé de vos enfants avec Mon Espace Santé (DMP)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {connections.map((conn) => {
          const isConnected = conn.status && conn.status !== "disconnected";
          const statusConf = STATUS_CONFIG[conn.status ?? "disconnected"] ?? STATUS_CONFIG.disconnected;
          const totalSynced = conn.syncedCounts.vaccinations + conn.syncedCounts.growthMeasurements + conn.syncedCounts.allergies;

          return (
            <div
              key={conn.memberId}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  {isConnected ? (
                    <Cloud className="h-4 w-4 text-accent-teal" />
                  ) : (
                    <CloudOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{conn.memberName}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConf.variant} className="text-xs">
                      {statusConf.label}
                    </Badge>
                    {isConnected && (
                      <span className="text-xs text-muted-foreground">
                        {totalSynced > 0
                          ? `${totalSynced} élément(s) synchronisé(s)`
                          : "Aucune donnée synchronisée"}
                      </span>
                    )}
                  </div>
                  {isConnected && conn.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Dernière sync : {formatDate(conn.lastSyncAt)}
                    </p>
                  )}
                  {conn.errorMessage && (
                    <p className="text-xs text-destructive">
                      {conn.errorMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <FHIRSyncButton
                      memberId={conn.memberId}
                      disabled={conn.status === "syncing"}
                      onSyncComplete={loadStatuses}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(conn.memberId)}
                      title="Déconnecter"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <MESConsentDialog
                    childName={conn.memberName}
                    memberId={conn.memberId}
                    onConfirm={handleConnect}
                    trigger={
                      <Button
                        variant="default"
                        size="sm"
                        disabled={connecting}
                      >
                        {connecting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ExternalLink className="mr-2 h-4 w-4" />
                        )}
                        Connecter
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          );
        })}

        <p className="text-xs text-muted-foreground">
          Les données de santé sont synchronisées via le protocole FHIR R4 et hébergées
          conformément aux exigences HDS. Vous pouvez révoquer l&apos;accès à tout moment.
        </p>
      </CardContent>
    </Card>
  );
}
