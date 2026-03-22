import type { Metadata } from "next";
import { Settings, Users, User, Sparkles, Shield } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemberList } from "@/components/famille/member-list";
import { NotificationPreferences } from "@/components/parametres/notification-preferences";
import { PushNotificationSettings } from "@/components/parametres/push-notification-settings";
import { CalendarSyncCard } from "@/components/parametres/calendar-sync-card";
import { MESConnectionCard } from "@/components/sante/mes-connection-card";
import { ExportPdfButton } from "@/components/parametres/export-pdf-button";
import { DataExportButton } from "@/components/parametres/data-export-button";
import { DeleteAccountDialog } from "@/components/parametres/delete-account-dialog";
import { ConsentManager } from "@/components/parametres/consent-manager";
import { PhoneNumberSettings } from "@/components/parametres/phone-number-settings";
import { EditProfileForm } from "@/components/parametres/edit-profile-form";
import { UpgradeButton } from "@/components/parametres/upgrade-button";
import { getFamilyMembers } from "@/lib/actions/family";
import { getUserConsents, getDeletionStatus } from "@/lib/actions/rgpd";
import { PLAN_LIMITS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Paramètres — Darons",
  description: "Configurez votre profil, gérez votre abonnement, vos consentements RGPD et les préférences de votre foyer",
};

export default async function ParametresPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("subscription_plan, email, first_name, last_name, calendar_tokens, phone_number").eq("id", user.id).single()
    : { data: null };
  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  const planLimits = PLAN_LIMITS[plan];

  const [membersResult, consentsResult, deletionStatus] = await Promise.all([
    getFamilyMembers(),
    getUserConsents(),
    getDeletionStatus(),
  ]);

  const members = membersResult.data ?? [];
  const consents = consentsResult.data ?? [];

  const channels = planLimits.alertChannels as readonly string[];
  const hasPush = channels.includes("push");
  const hasSms = channels.includes("sms");
  const hasCalendarSync = planLimits.hasCalendarSync;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Paramètres"
        description="Ton compte, ton foyer, tes préférences"
        icon={<Settings className="h-5 w-5" />}
      />

      <div className="grid gap-6">
        {/* Family members section */}
        <Card className="border-l-4 border-l-warm-teal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-warm-teal" />
              Mon foyer
            </CardTitle>
            <CardDescription>
              Les membres de ta famille
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemberList members={members} />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warm-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-warm-blue" />
              Mon compte
            </CardTitle>
            <CardDescription>
              Tes informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditProfileForm
              firstName={profile?.first_name ?? ""}
              lastName={profile?.last_name ?? ""}
              email={profile?.email ?? ""}
              role="Propriétaire"
            />
          </CardContent>
        </Card>

        {/* RGPD Consents */}
        <ConsentManager consents={consents} />

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

        {/* Mon Espace Santé */}
        <MESConnectionCard
          childMembers={members
            .filter((m) => m.memberType === "child")
            .map((c) => ({ id: c.id, firstName: c.firstName }))}
        />

        {/* Phone / SMS */}
        <PhoneNumberSettings
          currentPhoneNumber={profile?.phone_number ?? null}
          hasSms={hasSms}
        />

        {/* Calendar sync */}
        <CalendarSyncCard
          hasAccess={hasCalendarSync}
          isConnected={!!profile?.calendar_tokens}
        />

        <Card className="border-l-4 border-l-warm-gold">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-warm-gold" />
                  Abonnement
                </CardTitle>
                <CardDescription>Ton plan actuel et ses limites</CardDescription>
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
              <UpgradeButton plan="premium" label="Passer à Premium — 9,90 €/mois" />
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warm-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-warm-green" />
              Données & confidentialité
            </CardTitle>
            <CardDescription>
              RGPD : tes données, tes choix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <DataExportButton />
              <ExportPdfButton hasAccess={planLimits.hasPdfExport} />
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">
                Zone dangereuse
              </p>
              <DeleteAccountDialog
                userEmail={profile?.email ?? ""}
                isPending={deletionStatus.pending}
                scheduledAt={deletionStatus.scheduledAt}
              />
              {!deletionStatus.pending && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Toutes vos données seront supprimées sous 30 jours.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
