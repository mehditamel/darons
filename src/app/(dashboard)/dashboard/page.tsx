import type { Metadata } from "next";
import {
  HeartPulse,
  Syringe,
  FileText,
  ArrowRight,
  IdCard,
  Users,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DismissibleAlertCard } from "@/components/shared/dismissible-alert-card";
import { MonthlySummaryCard } from "@/components/dashboard/monthly-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getGreeting, formatDate } from "@/lib/utils";
import { getFamilyMembers } from "@/lib/actions/family";
import { getIdentityDocuments, getExpiringDocuments } from "@/lib/actions/identity";
import { getVaccinationsByMembers, getGrowthMeasurements } from "@/lib/actions/health";
import { getDocuments } from "@/lib/actions/documents";
import { getAlerts, generateProactiveAlerts } from "@/lib/actions/alerts";
import { getActivities } from "@/lib/actions/educational";
import { getBudgetEntries } from "@/lib/actions/budget";
import { getFiscalYears } from "@/lib/actions/fiscal";
import { VACCINATION_SCHEDULE, PLAN_LIMITS } from "@/lib/constants";
import { DOCUMENT_TYPE_LABELS } from "@/types/family";
import { createClient } from "@/lib/supabase/server";
import { differenceInMonths } from "date-fns";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Vue d'ensemble de votre foyer : alertes, vaccins, documents et actions rapides",
};

const ALERT_CATEGORY_LABELS: Record<string, string> = {
  identite: "Identité",
  sante: "Santé",
  fiscal: "Fiscal",
  caf: "CAF",
  scolarite: "Scolarité",
  budget: "Budget",
};

export default async function DashboardPage() {
  const greeting = getGreeting();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("subscription_plan").eq("id", user.id).single()
    : { data: null };
  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  const hasAiSummary = PLAN_LIMITS[plan].hasAiCoach;

  const [membersResult, docsResult, expiringResult, vaultResult] = await Promise.all([
    getFamilyMembers(),
    getIdentityDocuments(),
    getExpiringDocuments(),
    getDocuments(),
  ]);

  const members = membersResult.data ?? [];
  const identityDocs = docsResult.data ?? [];
  const expiring = expiringResult.data ?? [];
  const vaultDocs = vaultResult.data ?? [];
  const children = members.filter((m) => m.memberType === "child");

  // Get vaccination stats for all children (single batch query)
  const childIds = children.map((c) => c.id);
  const vaccResult = await getVaccinationsByMembers(childIds);
  const allVaccinations = vaccResult.data ?? [];

  let totalDoses = 0;
  let doneDoses = 0;
  for (const child of children) {
    const childVaccinations = allVaccinations.filter((v) => v.memberId === child.id);
    const childAgeMonths = differenceInMonths(new Date(), new Date(child.birthDate));

    for (const vaccine of VACCINATION_SCHEDULE) {
      for (const dose of vaccine.doses) {
        if (dose.ageMonths <= childAgeMonths + 3) {
          totalDoses++;
          const existing = childVaccinations.find(
            (v) => v.vaccineCode === vaccine.code && v.doseNumber === dose.doseNumber && v.status === "done"
          );
          if (existing) doneDoses++;
        }
      }
    }
  }

  // Fetch additional data for profile completion checks
  const firstChild = children[0];
  const [growthResult, activitiesResult, budgetResult, fiscalResult] = await Promise.all([
    firstChild ? getGrowthMeasurements(firstChild.id) : Promise.resolve({ data: [] }),
    firstChild ? getActivities(firstChild.id) : Promise.resolve({ data: [] }),
    getBudgetEntries(),
    getFiscalYears(),
  ]);
  const hasGrowthData = (growthResult.data ?? []).length > 0;
  const hasActivities = (activitiesResult.data ?? []).length > 0;
  const hasBudgetData = (budgetResult.data ?? []).length > 0;
  const hasFiscalData = (fiscalResult.data ?? []).length > 0;

  // Generate proactive alerts (runs deterministic checks)
  await generateProactiveAlerts();

  // Get alerts (combines proactive + document expiration alerts)
  const alertsResult = await getAlerts();
  const proactiveAlerts = alertsResult.data ?? [];

  // Fallback to legacy expiring docs if no proactive alerts
  const hasProactiveAlerts = proactiveAlerts.length > 0;

  // Profile completion (10 criteria as per CLAUDE.md section 18)
  const completionChecks = [
    { label: "Foyer créé", done: members.length > 0 },
    { label: "Enfant ajouté", done: children.length > 0 },
    { label: "Document d'identité", done: identityDocs.length > 0 },
    { label: "Vaccin enregistré", done: doneDoses > 0 },
    { label: "Document coffre-fort", done: vaultDocs.length > 0 },
    { label: "Mesure de croissance", done: hasGrowthData },
    { label: "Activité ajoutée", done: hasActivities },
    { label: "Données fiscales", done: hasFiscalData },
    { label: "Dépense budget", done: hasBudgetData },
    { label: "Email vérifié", done: !!user?.email_confirmed_at },
  ];
  const completionPercent = Math.round(
    (completionChecks.filter((c) => c.done).length / completionChecks.length) * 100
  );

  const firstAdult = members.find((m) => m.memberType === "adult");
  const displayName = firstAdult?.firstName ?? "Utilisateur";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${displayName}`}
        description="Voici un résumé de votre foyer familial"
      />

      {/* Profile completion */}
      {completionPercent < 100 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Complétude du profil</p>
              <span className="text-sm text-muted-foreground">{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-2" aria-label={`Profil complété à ${completionPercent}%`} />
            <div className="mt-3 flex flex-wrap gap-2">
              {completionChecks.map((check) => (
                <span
                  key={check.label}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    check.done
                      ? "bg-warm-green/10 text-warm-green"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {check.done ? "✓" : "○"} {check.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Membres du foyer"
          value={String(members.length)}
          icon={Users}
          color="bg-warm-teal/10 text-warm-teal"
        />
        <StatCard
          label="Vaccins à jour"
          value={totalDoses > 0 ? `${doneDoses}/${totalDoses}` : "—"}
          icon={Syringe}
          color="bg-warm-orange/10 text-warm-orange"
        />
        <StatCard
          label="Documents identité"
          value={String(identityDocs.length)}
          icon={IdCard}
          color="bg-warm-blue/10 text-warm-blue"
        />
        <StatCard
          label="Coffre-fort"
          value={`${vaultDocs.length} doc${vaultDocs.length > 1 ? "s" : ""}`}
          icon={FileText}
          color="bg-warm-purple/10 text-warm-purple"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasProactiveAlerts ? (
              proactiveAlerts.slice(0, 5).map((alert) => (
                <DismissibleAlertCard
                  key={alert.id}
                  id={alert.id}
                  title={alert.title}
                  message={alert.message}
                  priority={alert.priority}
                  category={ALERT_CATEGORY_LABELS[alert.category] ?? alert.category}
                  dueDate={alert.dueDate ? formatDate(alert.dueDate) : undefined}
                  actionUrl={alert.actionUrl}
                />
              ))
            ) : expiring.length > 0 ? (
              expiring.slice(0, 3).map((doc) => (
                <DismissibleAlertCard
                  key={doc.id}
                  id={doc.id}
                  title={`${DOCUMENT_TYPE_LABELS[doc.documentType]} — ${doc.memberFirstName}`}
                  message={
                    doc.status === "expired"
                      ? `Expiré le ${formatDate(doc.expiryDate!)}`
                      : `Expire le ${formatDate(doc.expiryDate!)}`
                  }
                  priority={doc.status === "expired" ? "high" : "medium"}
                  category="Identité"
                  dueDate={formatDate(doc.expiryDate!)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Aucune alerte en cours. Tout est en ordre !
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                label: "Enregistrer un vaccin",
                href: "/sante",
                icon: HeartPulse,
                color: "text-warm-teal",
              },
              {
                label: "Importer un document",
                href: "/documents",
                icon: FileText,
                color: "text-warm-blue",
              },
              {
                label: "Ajouter une pièce d'identité",
                href: "/identite",
                icon: IdCard,
                color: "text-warm-orange",
              },
              {
                label: "Gérer les membres",
                href: "/parametres",
                icon: Users,
                color: "text-warm-purple",
              },
            ].map((action) => (
              <Button
                key={action.href}
                variant="ghost"
                className="w-full justify-between h-auto py-3"
                asChild
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-3">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span>{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly AI Summary */}
      <MonthlySummaryCard hasAccess={hasAiSummary} />
    </div>
  );
}
