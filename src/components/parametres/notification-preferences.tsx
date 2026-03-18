"use client";

import { useState } from "react";
import { Bell, Mail, Smartphone, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface NotificationPreferencesProps {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  hasPush: boolean;
  hasSms: boolean;
}

export function NotificationPreferences({
  emailEnabled: initialEmail,
  pushEnabled: initialPush,
  smsEnabled: initialSms,
  hasPush,
  hasSms,
}: NotificationPreferencesProps) {
  const [email, setEmail] = useState(initialEmail);
  const [push, setPush] = useState(initialPush);
  const [sms, setSms] = useState(initialSms);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Choisissez comment recevoir vos alertes et rappels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="email-notif">Notifications par email</Label>
          </div>
          <Switch
            id="email-notif"
            checked={email}
            onCheckedChange={setEmail}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="push-notif">Notifications push</Label>
            {!hasPush && (
              <Badge variant="outline" className="text-[10px]">
                <Lock className="mr-1 h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>
          <Switch
            id="push-notif"
            checked={push}
            onCheckedChange={setPush}
            disabled={!hasPush}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="sms-notif">Alertes SMS (urgentes)</Label>
            {!hasSms && (
              <Badge variant="outline" className="text-[10px]">
                <Lock className="mr-1 h-3 w-3" />
                Family Pro
              </Badge>
            )}
          </div>
          <Switch
            id="sms-notif"
            checked={sms}
            onCheckedChange={setSms}
            disabled={!hasSms}
          />
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Les alertes critiques (vaccin en retard, document expiré) sont toujours envoyées par email.
        </p>
      </CardContent>
    </Card>
  );
}
