"use client";

import { useState } from "react";
import { Sparkles, Bell, Filter } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DismissibleAlertCard } from "@/components/shared/dismissible-alert-card";
import type { ProactiveAlert, AlertCategory } from "@/types/ai";

const CATEGORY_LABELS: Record<string, string> = {
  identite: "Identite",
  sante: "Sante",
  fiscal: "Fiscal",
  caf: "CAF",
  scolarite: "Scolarite",
  budget: "Budget",
};

const CATEGORY_COLORS: Record<string, string> = {
  identite: "bg-warm-orange/10 text-warm-orange hover:bg-warm-orange/20",
  sante: "bg-warm-teal/10 text-warm-teal hover:bg-warm-teal/20",
  fiscal: "bg-warm-gold/10 text-warm-gold hover:bg-warm-gold/20",
  caf: "bg-warm-blue/10 text-warm-blue hover:bg-warm-blue/20",
  scolarite: "bg-warm-purple/10 text-warm-purple hover:bg-warm-purple/20",
  budget: "bg-warm-green/10 text-warm-green hover:bg-warm-green/20",
};

interface AlertsWidgetProps {
  alerts: ProactiveAlert[];
}

export function AlertsWidget({ alerts }: AlertsWidgetProps) {
  const [activeFilter, setActiveFilter] = useState<AlertCategory | "all">("all");

  const filteredAlerts =
    activeFilter === "all"
      ? alerts
      : alerts.filter((a) => a.category === activeFilter);

  const categories = Array.from(new Set(alerts.map((a) => a.category)));
  const highCount = alerts.filter((a) => a.priority === "high").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-warm-orange" />
            Alertes IA
          </CardTitle>
          <div className="flex items-center gap-2">
            {highCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 animate-pulse-glow">
                {highCount} urgente{highCount > 1 ? "s" : ""}
              </Badge>
            )}
            {alerts.length > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5">
                {alerts.length}
              </Badge>
            )}
          </div>
        </div>

        {/* Category filter chips */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Filter className="h-3 w-3" />
              Tout ({alerts.length})
            </button>
            {categories.map((cat) => {
              const count = alerts.filter((a) => a.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    activeFilter === cat
                      ? "bg-foreground text-background"
                      : CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {filteredAlerts.length > 0 ? (
          <>
            {filteredAlerts.slice(0, 5).map((alert) => (
              <DismissibleAlertCard
                key={alert.id}
                id={alert.id}
                title={alert.title}
                message={alert.message}
                priority={alert.priority}
                category={CATEGORY_LABELS[alert.category] ?? alert.category}
                dueDate={alert.dueDate ?? undefined}
                actionUrl={alert.actionUrl}
              />
            ))}
            {alerts.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-warm-orange hover:text-warm-orange"
                asChild
              >
                <Link href="/alertes">
                  <Bell className="mr-1 h-3 w-3" />
                  Voir les {alerts.length} alertes
                </Link>
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-green/10 mb-3">
              <Sparkles className="h-5 w-5 text-warm-green" />
            </div>
            <p className="text-sm font-medium">Tout roule !</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aucune alerte en cours. On veille au grain.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
