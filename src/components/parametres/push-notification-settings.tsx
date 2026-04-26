"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff } from "lucide-react";
import { UpgradeButton } from "./upgrade-button";

interface PushNotificationSettingsProps {
  hasPush: boolean;
}

export function PushNotificationSettings({ hasPush }: PushNotificationSettingsProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  }

  async function handleToggle() {
    if (!hasPush) return;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await fetch("/api/notifications/push/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
          await subscription.unsubscribe();
          setIsSubscribed(false);
        }
      } else {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey,
        });

        const json = subscription.toJSON();
        await fetch("/api/notifications/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: json.keys,
          }),
        });
        setIsSubscribed(true);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-warm-orange" />
          Notifications push
        </CardTitle>
        <CardDescription>
          Recevez des alertes directement dans votre navigateur
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasPush ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <BellOff className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Les notifications push sont disponibles avec le plan Premium.
            </p>
            <div className="mt-2 inline-flex">
              <UpgradeButton plan="premium" label="Passer à Premium" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {isSubscribed ? "Notifications activées" : "Notifications désactivées"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSubscribed
                  ? "Vous recevez les alertes dans votre navigateur"
                  : "Activez pour recevoir les rappels de vaccins, expirations de documents, etc."}
              </p>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
