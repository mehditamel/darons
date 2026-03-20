"use client";

import { useState } from "react";
import { Calendar, Lock, ExternalLink, Loader2, Unlink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CalendarSyncCardProps {
  hasAccess: boolean;
  isConnected: boolean;
}

export function CalendarSyncCard({ hasAccess, isConnected }: CalendarSyncCardProps) {
  const [connected, setConnected] = useState(isConnected);
  const [disconnecting, setDisconnecting] = useState(false);

  function handleConnect() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const redirectUri = `${appUrl}/api/calendar/google/callback`;
    const scope = "https://www.googleapis.com/auth/calendar.events";

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId ?? "");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scope);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");

    window.location.href = url.toString();
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const response = await fetch("/api/calendar/google/disconnect", {
        method: "POST",
      });
      if (response.ok) {
        setConnected(false);
      }
    } catch {
      // Silent failure
    } finally {
      setDisconnecting(false);
    }
  }

  if (!hasAccess) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Synchronisation calendrier</p>
            <p className="text-xs text-muted-foreground">
              Passez au plan Premium pour synchroniser vos RDV médicaux et échéances avec Google Calendar.
            </p>
          </div>
          <Badge variant="outline">Premium</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Synchronisation calendrier
        </CardTitle>
        <CardDescription>
          Synchronisez vos RDV médicaux, vaccins et échéances avec votre calendrier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Google Calendar</p>
              <p className="text-xs text-muted-foreground">
                {connected ? "Connecté" : "Non connecté"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {connected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
                <span className="ml-1">Déconnecter</span>
              </Button>
            )}
            <Button
              variant={connected ? "outline" : "default"}
              size="sm"
              onClick={handleConnect}
            >
              {connected ? (
                <>
                  Reconnecter
                  <ExternalLink className="ml-1 h-3 w-3" />
                </>
              ) : (
                "Connecter"
              )}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Les événements suivants seront synchronisés : RDV médicaux, rappels de vaccins, échéances fiscales, inscriptions scolaires.
        </p>
      </CardContent>
    </Card>
  );
}
