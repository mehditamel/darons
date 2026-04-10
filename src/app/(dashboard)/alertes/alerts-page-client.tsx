"use client";

import { useState } from "react";
import {
  Bell,
  RefreshCw,
  History,
  Filter,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DismissibleAlertCard } from "@/components/shared/dismissible-alert-card";
import { AlertCard } from "@/components/shared/alert-card";
import type { ProactiveAlert, AlertCategory } from "@/types/ai";

const CATEGORY_LABELS: Record<string, string> = {
  identite: "Identité",
  sante: "Santé",
  fiscal: "Fiscal",
  caf: "CAF",
  scolarite: "Scolarité",
  budget: "Budget",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "Urgent",
  medium: "Attention",
  low: "Info",
};

interface AlertsPageClientProps {
  activeAlerts: ProactiveAlert[];
  dismissedAlerts: ProactiveAlert[];
}

export function AlertsPageClient({
  activeAlerts,
  dismissedAlerts,
}: AlertsPageClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | "all">("all");
  const [showHistory, setShowHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredActive =
    categoryFilter === "all"
      ? activeAlerts
      : activeAlerts.filter((a) => a.category === categoryFilter);

  const filteredHistory =
    categoryFilter === "all"
      ? dismissedAlerts
      : dismissedAlerts.filter((a) => a.category === categoryFilter);

  const categories = Array.from(
    new Set([...activeAlerts, ...dismissedAlerts].map((a) => a.category))
  );

  const highCount = activeAlerts.filter((a) => a.priority === "high").length;
  const mediumCount = activeAlerts.filter((a) => a.priority === "medium").length;
  const lowCount = activeAlerts.filter((a) => a.priority === "low").length;

  async function handleRefreshAi() {
    setRefreshing(true);
    try {
      await fetch("/api/ai/alerts", { method: "POST" });
      window.location.reload();
    } catch {
      // Silently fail — deterministic alerts are still generated on page load
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-warm-red">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warm-red" />
            <div>
              <p className="text-2xl font-bold">{highCount}</p>
              <p className="text-xs text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warm-orange">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warm-orange" />
            <div>
              <p className="text-2xl font-bold">{mediumCount}</p>
              <p className="text-xs text-muted-foreground">Attention</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warm-blue">
          <CardContent className="p-4 flex items-center gap-3">
            <Info className="h-5 w-5 text-warm-blue" />
            <div>
              <p className="text-2xl font-bold">{lowCount}</p>
              <p className="text-xs text-muted-foreground">Info</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category filters */}
        <button
          onClick={() => setCategoryFilter("all")}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            categoryFilter === "all"
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Filter className="h-3 w-3" />
          Tout
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}

        <div className="flex-1" />

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History className="mr-1.5 h-3.5 w-3.5" />
          {showHistory ? "Masquer l'historique" : "Historique"}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleRefreshAi}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Analyser avec l'IA
        </Button>
      </div>

      {/* Active alerts */}
      <div className="space-y-2">
        {filteredActive.length > 0 ? (
          filteredActive.map((alert) => (
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
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-green/10 mb-3">
                <CheckCircle2 className="h-6 w-6 text-warm-green" />
              </div>
              <p className="text-sm font-medium">Aucune alerte active</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tout est en ordre dans ton foyer. Continue comme ça !
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* History */}
      {showHistory && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <History className="h-4 w-4" />
            Alertes traitées ({filteredHistory.length})
          </h3>
          {filteredHistory.length > 0 ? (
            <div className="space-y-2 opacity-60">
              {filteredHistory.map((alert) => (
                <AlertCard
                  key={alert.id}
                  title={alert.title}
                  message={alert.message}
                  priority={alert.priority}
                  category={CATEGORY_LABELS[alert.category] ?? alert.category}
                  dueDate={alert.dueDate ?? undefined}
                  className="opacity-70"
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Aucune alerte traitée.</p>
          )}
        </div>
      )}
    </div>
  );
}
