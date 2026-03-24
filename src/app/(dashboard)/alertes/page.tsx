import type { Metadata } from "next";
import { Bell, RefreshCw, CheckCircle2, History } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { AlertsPageClient } from "./alerts-page-client";
import { getAlerts, getAlertHistory } from "@/lib/actions/alerts";

export const metadata: Metadata = {
  title: "Alertes",
  description: "Toutes les alertes proactives de votre foyer",
};

export default async function AlertesPage() {
  const [alertsResult, historyResult] = await Promise.all([
    getAlerts(),
    getAlertHistory(),
  ]);

  const activeAlerts = alertsResult.data ?? [];
  const dismissedAlerts = historyResult.data ?? [];

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Alertes"
        description="L'IA surveille ton foyer et te previent quand il y a un truc a faire."
      />

      <AlertsPageClient
        activeAlerts={activeAlerts}
        dismissedAlerts={dismissedAlerts}
      />
    </div>
  );
}
