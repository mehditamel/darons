"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

const UPDATE_CHECK_INTERVAL_MS = 60_000;

export function ServiceWorkerRegister() {
  const { toast } = useToast();
  const promptedRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let updateInterval: ReturnType<typeof setInterval> | null = null;

    function promptUpdate(waiting: ServiceWorker) {
      if (promptedRef.current) return;
      promptedRef.current = true;
      toast({
        title: "Mise à jour disponible",
        description: "Une nouvelle version de Darons est prête. Recharge pour en profiter.",
        duration: 1000 * 60 * 60,
        action: (
          <ToastAction
            altText="Recharger l'application"
            onClick={() => {
              waiting.postMessage({ type: "SKIP_WAITING" });
            }}
          >
            Recharger
          </ToastAction>
        ),
      });
    }

    function watchInstalling(reg: ServiceWorkerRegistration) {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          promptUpdate(installing);
        }
      });
    }

    async function register() {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Already a worker waiting from a previous load
        if (registration.waiting && navigator.serviceWorker.controller) {
          promptUpdate(registration.waiting);
        }

        // Watch for new updates as they install
        registration.addEventListener("updatefound", () => {
          if (registration) watchInstalling(registration);
        });

        // Poll for updates periodically while the tab is open
        updateInterval = setInterval(() => {
          registration?.update().catch(() => undefined);
        }, UPDATE_CHECK_INTERVAL_MS);

        // Check on tab visibility regain
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration?.update().catch(() => undefined);
          }
        });
      } catch {
        // Registration failed — silent fallback, app still works
      }
    }

    register();

    // Reload once the new SW takes control
    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      if (updateInterval) clearInterval(updateInterval);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, [toast]);

  return null;
}
