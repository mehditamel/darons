"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Card className="border-warm-orange/30 bg-warm-orange/5">
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff className="h-4 w-4 text-warm-orange shrink-0" />
          <p className="text-sm text-warm-orange">
            Vous êtes hors ligne. Certaines fonctionnalités sont indisponibles.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
}
