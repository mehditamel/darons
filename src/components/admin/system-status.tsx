"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";

export interface ServiceHealth {
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  latencyMs: number | null;
  lastChecked: string;
}

export interface SystemHealthData {
  services: ServiceHealth[];
  lastErrors: Array<{
    service: string;
    message: string;
    timestamp: string;
  }>;
}

interface SystemStatusProps {
  health: SystemHealthData;
}

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, label: "Opérationnel", color: "text-green-500", badge: "default" as const },
  degraded: { icon: AlertTriangle, label: "Dégradé", color: "text-amber-500", badge: "secondary" as const },
  down: { icon: XCircle, label: "Indisponible", color: "text-red-500", badge: "destructive" as const },
  unknown: { icon: Clock, label: "Inconnu", color: "text-muted-foreground", badge: "outline" as const },
};

export function SystemStatus({ health }: SystemStatusProps) {
  const healthyCount = health.services.filter((s) => s.status === "healthy").length;
  const totalCount = health.services.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-warm-teal" />
                État des services
              </CardTitle>
              <CardDescription>
                {healthyCount}/{totalCount} services opérationnels
              </CardDescription>
            </div>
            <Badge variant={healthyCount === totalCount ? "default" : "destructive"}>
              {healthyCount === totalCount ? "Tout opérationnel" : "Incidents"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {health.services.map((service) => {
              const config = STATUS_CONFIG[service.status];
              const Icon = config.icon;
              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Vérifié : {new Date(service.lastChecked).toLocaleTimeString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.latencyMs !== null && (
                      <span className="text-xs text-muted-foreground">
                        {service.latencyMs}ms
                      </span>
                    )}
                    <Badge variant={config.badge}>{config.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {health.lastErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dernières erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.lastErrors.map((error, i) => (
                <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-red-700 dark:text-red-300">
                      {error.service}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(error.timestamp).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
