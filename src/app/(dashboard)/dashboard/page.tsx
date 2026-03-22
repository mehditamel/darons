import type { Metadata } from "next";
import {
  HeartPulse,
  Syringe,
  FileText,
  ArrowRight,
  IdCard,
  Users,
  Wallet,
  Calculator,
  CalendarClock,
  Sparkles,
  TrendingUp,
  Baby,
  ClipboardList,
  FolderLock,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DismissibleAlertCard } from "@/components/shared/dismissible-alert-card";
import { MonthlySummaryCard } from "@/components/dashboard/monthly-summary-card";
import { FamilyOverviewCard } from "@/components/dashboard/family-overview-card";
import { WeeklyActivitiesCard } from "@/components/dashboard/weekly-activities-card";
import { MilestonesProgressCard } from "@/components/dashboard/milestones-progress-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getGreeting, formatDate, formatCurrency } from "@/lib/utils";
import { getFamilyMembers } from "@/lib/actions/family";
import { getIdentityDocuments, getExpiringDocuments } from "@/lib/actions/identity";
import { getVaccinationsByMembers, getGrowthMeasurements, getUpcomingAppointments } from "@/lib/actions/health";
import { getDocuments } from "@/lib/actions/documents";
import { getAlerts, generateProactiveAlerts } from "@/lib/actions/alerts";
import { getActivities, getMilestones } from "@/lib/actions/educational";
import { getBudgetEntries, getBudgetSummary, getCafAllocations } from "@/lib/actions/budget";
import { getFiscalYears } from "@/lib/actions/fiscal";
import { VACCINATION_SCHEDULE, PLAN_LIMITS } from "@/lib/constants";
import { DOCUMENT_TYPE_LABELS } from "@/types/family";
import { createClient } from "@/lib/supabase/server";
import { differenceInMonths, format } from "date-fns";
import { fr } from "date-fns/locale";

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

const GREETING_MESSAGES = [
  "On gère ta tribu comme des pros",
  "Voici ce qui se passe chez toi",
  "Ton foyer en un coup d'oeil",
  "La famille, c'est du boulot. On t'aide",
];

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

  const firstChild = children[0];
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [growthResult, activitiesResult, milestonesResult, budgetResult, fiscalResult, summaryResult, allocResult, appointmentsResult] = await Promise.all([
    firstChild ? getGrowthMeasurements(firstChild.id) : Promise.resolve({ data: [] }),
    firstChild ? getActivities(firstChild.id) : Promise.resolve({ data: [] }),
    firstChild ? getMilestones(firstChild.id) : Promise.resolve({ data: [] }),
    getBudgetEntries(),
    getFiscalYears(),
    getBudgetSummary(currentMonth),
    getCafAllocations(),
    getUpcomingAppointments(3),
  ]);
  const hasGrowthData = (growthResult.data ?? []).length > 0;
  const hasActivities = (activitiesResult.data ?? []).length > 0;
  const allActivities = activitiesResult.data ?? [];
  const allMilestones = milestonesResult.data ?? [];
  const hasBudgetData = (budgetResult.data ?? []).length > 0;
  const hasFiscalData = (fiscalResult.data ?? []).length > 0;

  const budgetSummary = summaryResult.data;
  const allocations = (allocResult.data ?? []).filter((a) => a.active);
  const totalAllocations = allocations.reduce((s, a) => s + a.monthlyAmount, 0);
  const upcomingAppointments = appointmentsResult.data ?? [];
  const fiscalYears = fiscalResult.data ?? [];
  const latestFiscal = fiscalYears.length > 0 ? fiscalYears[0] : null;

  await generateProactiveAlerts();

  const alertsResult = await getAlerts();
  const proactiveAlerts = alertsResult.data ?? [];
  const hasProactiveAlerts = proactiveAlerts.length > 0;

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
  const greetingMessage = GREETING_MESSAGES[now.getDay() % GREETING_MESSAGES.length];

  const vaccPercent = totalDoses > 0 ? Math.round((doneDoses / totalDoses) * 100) : 0;

  return (
    <div className="space-y-6 page-enter">
      {/* Greeting */}
      <div className="flex flex-col gap-1">
        <PageHeader
          title={`${greeting}, ${displayName}`}
          description={greetingMessage}
        />
        <p className="text-xs text-muted-foreground">
          {format(now, "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Profile completion */}
      {completionPercent < 100 && (
        <Card className="border-dashed border-warm-orange/30 bg-warm-orange/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-warm-orange" />
                <p className="text-sm font-semibold">Ton profil est à {completionPercent}%</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {completionChecks.filter((c) => !c.done).length} étape{completionChecks.filter((c) => !c.done).length > 1 ? "s" : ""} restante{completionChecks.filter((c) => !c.done).length > 1 ? "s" : ""}
              </Badge>
            </div>
            <Progress value={completionPercent} className="h-2 mb-3" aria-label={`Profil complété à ${completionPercent}%`} />
            <div className="flex flex-wrap gap-1.5">
              {completionChecks.map((check) => (
                <span
                  key={check.label}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    check.done
                      ? "bg-warm-green/10 text-warm-green"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {check.done ? "✓" : "○"} {check.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Famille"
          value={`${members.length} membre${members.length > 1 ? "s" : ""}`}
          icon={Users}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
        />
        <StatCard
          label="Vaccins"
          value={totalDoses > 0 ? `${vaccPercent}%` : "—"}
          icon={Syringe}
          color="bg-warm-orange/10 text-warm-orange"
          trend={totalDoses > 0 ? `${doneDoses}/${totalDoses} doses` : undefined}
          trendUp={vaccPercent >= 80}
          gradientClass="card-gradient-orange"
        />
        <StatCard
          label="Identité"
          value={String(identityDocs.length)}
          icon={IdCard}
          color="bg-warm-blue/10 text-warm-blue"
          trend={expiring.length > 0 ? `${expiring.length} expire${expiring.length > 1 ? "nt" : ""} bientôt` : undefined}
          trendUp={false}
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Coffre-fort"
          value={`${vaultDocs.length} doc${vaultDocs.length > 1 ? "s" : ""}`}
          icon={FolderLock}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
        />
      </div>

      {/* Family overview */}
      <FamilyOverviewCard members={members} />

      {/* Alerts + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-warm-orange" />
                Alertes IA
              </CardTitle>
              {(hasProactiveAlerts || expiring.length > 0) && (
                <Badge variant="destructive" className="text-[10px] px-1.5">
                  {hasProactiveAlerts ? proactiveAlerts.length : expiring.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
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
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-green/10 mb-3">
                  <Sparkles className="h-5 w-5 text-warm-green" />
                </div>
                <p className="text-sm font-medium">Tout roule !</p>
                <p className="text-xs text-muted-foreground mt-1">Aucune alerte en cours. On veille au grain.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions - redesigned as grid */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Vaccin",
                  description: "Enregistrer une dose",
                  href: "/sante",
                  icon: HeartPulse,
                  color: "bg-warm-teal/10 text-warm-teal hover:bg-warm-teal/20",
                },
                {
                  label: "Document",
                  description: "Importer un fichier",
                  href: "/documents",
                  icon: FileText,
                  color: "bg-warm-blue/10 text-warm-blue hover:bg-warm-blue/20",
                },
                {
                  label: "Identité",
                  description: "Ajouter un papier",
                  href: "/identite",
                  icon: IdCard,
                  color: "bg-warm-orange/10 text-warm-orange hover:bg-warm-orange/20",
                },
                {
                  label: "Impôts",
                  description: "Simuler mon IR",
                  href: "/fiscal",
                  icon: Calculator,
                  color: "bg-warm-gold/10 text-warm-gold hover:bg-warm-gold/20",
                },
                {
                  label: "Budget",
                  description: "Ajouter une dépense",
                  href: "/budget",
                  icon: Wallet,
                  color: "bg-warm-purple/10 text-warm-purple hover:bg-warm-purple/20",
                },
                {
                  label: "Garde",
                  description: "Chercher une crèche",
                  href: "/garde",
                  icon: Baby,
                  color: "bg-warm-green/10 text-warm-green hover:bg-warm-green/20",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-200 ${action.color} group`}
                >
                  <action.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold">{action.label}</span>
                  <span className="text-[10px] opacity-70">{action.description}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget / Fiscal / Appointments widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget snapshot */}
        <Card className="card-gradient-blue">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-warm-blue" />
              Budget du mois
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {budgetSummary && budgetSummary.entryCount > 0 ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dépenses</span>
                  <span className="font-semibold">{formatCurrency(budgetSummary.totalExpenses)}</span>
                </div>
                {totalAllocations > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Allocations CAF</span>
                    <span className="font-semibold text-warm-green">+{formatCurrency(totalAllocations)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Solde</span>
                  <span className={`font-bold text-lg ${
                    (totalAllocations + (budgetSummary.totalIncome ?? 0) - budgetSummary.totalExpenses) >= 0
                      ? "text-warm-green"
                      : "text-warm-red"
                  }`}>
                    {formatCurrency(totalAllocations + (budgetSummary.totalIncome ?? 0) - budgetSummary.totalExpenses)}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-3 text-center">
                <p className="text-sm text-muted-foreground">Aucune dépense ce mois-ci.</p>
                <p className="text-xs text-muted-foreground mt-1">Connecte ta banque ou ajoute tes dépenses</p>
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-1 text-warm-blue hover:text-warm-blue" asChild>
              <Link href="/budget">
                Voir le budget
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Fiscal snapshot */}
        <Card className="card-gradient-gold">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-warm-gold" />
              Situation fiscale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestFiscal ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Année</span>
                  <span className="font-medium">{latestFiscal.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Parts</span>
                  <span className="font-medium">{latestFiscal.nbParts}</span>
                </div>
                {latestFiscal.tmi != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TMI</span>
                    <Badge variant="outline" className="font-semibold">{latestFiscal.tmi}%</Badge>
                  </div>
                )}
                {latestFiscal.impotNet != null && (
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-muted-foreground">Impôt net</span>
                    <span className="font-bold text-lg">{formatCurrency(latestFiscal.impotNet)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-3 text-center">
                <p className="text-sm text-muted-foreground">Aucune donnée fiscale.</p>
                <p className="text-xs text-muted-foreground mt-1">Lance ta première simulation</p>
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-1 text-warm-gold hover:text-warm-gold" asChild>
              <Link href="/fiscal">
                Voir le fiscal
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-warm-teal" />
              Prochains RDV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appt) => {
                const member = members.find((m) => m.id === appt.memberId);
                return (
                  <div key={appt.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-2.5 transition-colors hover:bg-muted">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-teal/10 text-warm-teal shrink-0">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{appt.appointmentType}</p>
                      <p className="text-xs text-muted-foreground">
                        {member?.firstName} — {format(new Date(appt.appointmentDate), "d MMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-3 text-center">
                <p className="text-sm text-muted-foreground">Aucun RDV à venir.</p>
              </div>
            )}
            <Button variant="ghost" size="sm" className="w-full mt-1" asChild>
              <Link href="/sante">
                Voir la santé
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activities + Milestones */}
      {firstChild && (
        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyActivitiesCard
            activities={allActivities}
            childName={firstChild.firstName}
          />
          <MilestonesProgressCard
            milestones={allMilestones}
            childName={firstChild.firstName}
            birthDate={firstChild.birthDate}
          />
        </div>
      )}

      {/* Monthly AI Summary */}
      <MonthlySummaryCard hasAccess={hasAiSummary} />
    </div>
  );
}
