"use client";

import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, Loader2, CloudUpload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOfflineQueueCount, replayOfflineQueue } from "@/lib/offline-queue";

export function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  const syncQueue = useCallback(async () => {
    const count = getOfflineQueueCount();
    if (count === 0) return;

    setSyncing(true);
    try {
      const replayed = await replayOfflineQueue();
      setQueueCount(getOfflineQueueCount());
      if (replayed > 0) {
        setJustReconnected(true);
        setTimeout(() => setJustReconnected(false), 3000);
      }
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setQueueCount(getOfflineQueueCount());

    function handleOnline() {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
      syncQueue();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "SYNC_OFFLINE_QUEUE") {
        syncQueue();
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    // Periodically check queue
    const interval = setInterval(() => {
      setQueueCount(getOfflineQueueCount());
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
      clearInterval(interval);
    };
  }, [syncQueue]);

  // Don't show anything when online with no queue
  if (isOnline && queueCount === 0 && !syncing && !justReconnected) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline && (
        <Badge
          variant="destructive"
          className="flex items-center gap-1.5 text-[11px] animate-fade-in-up"
        >
          <WifiOff className="h-3 w-3" />
          Hors ligne
        </Badge>
      )}

      {justReconnected && isOnline && (
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 text-[11px] text-warm-green border-warm-green/30 animate-fade-in-up"
        >
          <Wifi className="h-3 w-3" />
          Reconnecte
        </Badge>
      )}

      {syncing && (
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 text-[11px] text-warm-blue border-warm-blue/30"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Synchronisation...
        </Badge>
      )}

      {queueCount > 0 && !syncing && (
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 text-[11px] text-warm-orange border-warm-orange/30"
        >
          <CloudUpload className="h-3 w-3" />
          {queueCount} en attente
        </Badge>
      )}
    </div>
  );
}
