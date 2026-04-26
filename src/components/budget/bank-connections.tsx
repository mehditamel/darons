"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, RefreshCw, Link2, AlertTriangle, Loader2 } from "lucide-react";
import type { BankConnection } from "@/lib/actions/banking";
import { syncBankAccounts } from "@/lib/actions/banking";
import { UpgradeButton } from "@/components/parametres/upgrade-button";

interface BankConnectionsProps {
  connections: BankConnection[];
  hasOpenBanking: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Connecté", variant: "default" },
  needs_refresh: { label: "Ré-authentification requise", variant: "destructive" },
  error: { label: "Erreur", variant: "destructive" },
  disconnected: { label: "Déconnecté", variant: "secondary" },
};

export function BankConnections({ connections, hasOpenBanking }: BankConnectionsProps) {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    try {
      const response = await fetch("/api/banking/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.connectUrl) {
        window.location.href = data.connectUrl;
      } else {
        setConnecting(false);
      }
    } catch {
      setConnecting(false);
    }
  }

  if (!hasOpenBanking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-warm-blue" />
            Connexions bancaires
          </CardTitle>
          <CardDescription>
            Connectez vos comptes pour un suivi automatique de vos dépenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              La connexion bancaire est disponible avec le plan Premium ou Family Pro.
            </p>
            <div className="mt-3 inline-flex">
              <UpgradeButton plan="premium" label="Passer à Premium" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  async function handleSync(connectionId: string) {
    setSyncing(connectionId);
    await syncBankAccounts(connectionId);
    setSyncing(null);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-warm-blue" />
              Connexions bancaires
            </CardTitle>
            <CardDescription>
              {connections.length > 0
                ? `${connections.length} banque${connections.length > 1 ? "s" : ""} connectée${connections.length > 1 ? "s" : ""}`
                : "Aucune banque connectée"}
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={handleConnect} disabled={connecting}>
            {connecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="mr-2 h-4 w-4" />
            )}
            Connecter une banque
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {connections.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Connectez votre banque pour synchroniser automatiquement vos transactions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => {
              const statusConfig = STATUS_CONFIG[conn.status] ?? STATUS_CONFIG.disconnected;
              return (
                <div
                  key={conn.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{conn.bankName}</p>
                      <p className="text-xs text-muted-foreground">
                        {conn.lastSyncAt
                          ? `Dernière sync : ${new Date(conn.lastSyncAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
                          : "Jamais synchronisé"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    {conn.status === "needs_refresh" && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSync(conn.id)}
                      disabled={syncing === conn.id}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${syncing === conn.id ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
