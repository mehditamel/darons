import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemberList } from "@/components/famille/member-list";
import { NotificationPreferences } from "@/components/parametres/notification-preferences";
import { PushNotificationSettings } from "@/components/parametres/push-notification-settings";
import { CalendarSyncCard } from "@/components/parametres/calendar-sync-card";
import { ExportPdfButton } from "@/components/parametres/export-pdf-button";
import { getFamilyMembers } from "@/lib/actions/family";
import { PLAN_LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Paramètres",
  description: "Configurez votre profil, gérez votre abonnement et les préférences de votre foyer",
};

export default async function ParametresPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("subscription_plan, email, first_name, last_name").eq("id", user.id).single()
    : { data: null };
  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  const planLimits = PLAN_LIMITS[plan];

  const membersResult = await getFamilyMembers();
  const members = membersResult.data ?? [];

  const channels = planLimits.alertChannels as readonly string[];
  const hasPush = channels.includes("push");
  const hasSms = channels.includes("sms");
  const hasCalendarSync = planLimits.hasCalendarSync;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Gérez votre compte, votre foyer et votre abonnement"
      />

      <div className="grid gap-6">
        {/* Family members section */}
        <Card>
          <CardHeader>
            <CardTitle>Mon foyer</CardTitle>
            <CardDescription>
              Gérez les membres de votre famille
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemberList members={members} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon compte</CardTitle>
            <CardDescription>
              Informations de votre compte utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Prénom</p>
                <p className="font-medium">{profile?.first_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{profile?.last_name ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rôle</p>
                <p className="font-medium">Propriétaire</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Modifier mes informations
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <NotificationPreferences
          emailEnabled={true}
          pushEnabled={false}
          smsEnabled={false}
          hasPush={hasPush}
          hasSms={hasSms}
        />

        {/* Push notifications */}
        <PushNotificationSettings hasPush={hasPush} />

        {/* Calendar sync */}
        <CalendarSyncCard
          hasAccess={hasCalendarSync}
          isConnected={false}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Abonnement</CardTitle>
                <CardDescription>Votre plan actuel et ses limites</CardDescription>
              </div>
              <Badge>{plan === "free" ? "Gratuit" : plan === "premium" ? "Premium" : "Family Pro"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Membres du foyer</span>
                <span>{planLimits.maxAdults === Infinity ? "Illimité" : "1 adulte + 1 enfant max"}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Documents</span>
                <span>{planLimits.maxDocuments === Infinity ? "Illimité" : `${planLimits.maxDocuments} max`}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Stockage</span>
                <span>{planLimits.storageBytes >= 1024 * 1024 * 1024 ? `${planLimits.storageBytes / (1024 * 1024 * 1024)} Go` : "500 Mo"}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Open Banking</span>
                <span className={planLimits.hasOpenBanking ? "" : "text-muted-foreground"}>
                  {planLimits.hasOpenBanking ? "Activé" : "Non inclus"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Coach IA</span>
                <span className={planLimits.hasAiCoach ? "" : "text-muted-foreground"}>
                  {planLimits.hasAiCoach ? "Activé" : "Non inclus"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Sync calendrier</span>
                <span className={planLimits.hasCalendarSync ? "" : "text-muted-foreground"}>
                  {planLimits.hasCalendarSync ? "Activé" : "Non inclus"}
                </span>
              </li>
            </ul>
            {plan === "free" && (
              <Button>Passer à Premium — 9,90 €/mois</Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données & confidentialité</CardTitle>
            <CardDescription>
              RGPD : gérez vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Exporter mes données (JSON)
              </Button>
              <ExportPdfButton hasAccess={planLimits.hasPdfExport} />
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">
                Zone dangereuse
              </p>
              <Button variant="destructive" size="sm">
                Supprimer mon compte
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                Toutes vos données seront supprimées sous 30 jours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
