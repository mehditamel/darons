"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { observeWorkerUpdates } from "@/lib/pwa/worker-updates";

export function ServiceWorkerRegister() {
  const { toast } = useToast();
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    return observeWorkerUpdates(navigator.serviceWorker, (activate) => {
      const notification = toast({
        title: "Mise à jour disponible",
        description: "Enregistre tes modifications, puis recharge pour profiter de la nouvelle version.",
        duration: 1000 * 60 * 60,
        action: <ToastAction altText="Recharger l'application" onClick={activate}>Recharger</ToastAction>,
      });
      return notification.dismiss;
    }, () => window.location.reload());
  }, [toast]);
  return null;
}
