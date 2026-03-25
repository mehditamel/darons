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
  Baby,
  FolderLock,
  BookOpen,
  TrendingUp,
  Stethoscope,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertsWidget } from "@/components/dashboard/alerts-widget";
import { UpcomingTimeline } from "@/components/dashboard/upcoming-timeline";
import { HouseholdWeather } from "@/components/dashboard/household-weather";
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
import { getAlerts, generateProactiveAlerts, dispatchAlertNotifications } from "@/lib/actions/alerts";
import { getActivities, getMilestones } from "@/lib/actions/educational";
import { getBudgetEntries, getBudgetSummary, getCafAllocations } from "@/lib/actions/budget";
import { getFiscalYears } from "@/lib/actions/fiscal";
import { VACCINATION_SCHEDULE, PLAN_LIMITS } from "@/lib/constants";
import { DOCUMENT_TYPE_LABELS } from "@/types/family";
import { createClient } from "@/lib/supabase/server";
import { differenceInMonths, differenceInDays, addMonths, format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Vue d'ensemble de votre foyer : alertes, vaccins, documents et actions rapides",
};

// ISR: revalidate dashboard every 60 seconds
export const revalidate = 60;

const GREETING_MESSAGES = [
  "On gere ta tribu comme des pros",
  "Voici ce qui se passe chez toi",
  "Ton foyer en un coup d'oeil",
  "La famille, c'est du boulot. On t'aide",
];

// Quick actions by child age range
function getQuickActions(youngestAgeMonths: number | null) {
  if (youngestAgeMonths !== null && youngestAgeMonths <= 6) {
    return [
      { label: "Vaccin", description: "Enregistrer une dose", href: "/sante", icon: Syringe, color: "bg-warm-teal/10 text-warm-teal hover:bg-warm-teal/20" },
      { label: "Croissance", description: "Poids & taille", href: "/sante", icon: TrendingUp, color: "bg-warm-green/10 text-warm-green hover:bg-warm-green/20" },
      { label: "RDV pediatre", description: "Planifier", href: "/sante", icon: Stethoscope, color: "bg-warm-blue/10 text-warm-blue hover:bg-warm-blue/20" },
      { label: "Journal", description: "Noter un moment", href: "/developpement", icon: BookOpen, color: "bg-warm-purple/10 text-warm-purple hover:bg-warm-purple/20" },
      { label: "Identite", description: "Ajouter un papier", href: "/identite", icon: IdCard, color: "bg-warm-orange/10 text-warm-orange hover:bg-warm-orange/20" },
      { label: "Budget", description: "Ajouter une depense", href: "/budget", icon: Wallet, color: "bg-warm-gold/10 text-warm-gold hover:bg-warm-gold/20" },
    ];
  }
  if (youngestAgeMonths !== null && youngestAgeMonths <= 18) {
    return [
      { label: "Vaccin", description: "Enregistrer une dose", href: "/sante", icon: Syringe, color: "bg-warm-teal/10 text-warm-teal hover:bg-warm-teal/20" },
      { label: "Activite", description: "Eveil / sport", href: "/activites", icon: Palette, color: "bg-warm-purple/10 text-warm-purple hover:bg-warm-purple/20" },
      { label: "Journal", description: "Noter un moment", href: "/developpement", icon: BookOpen, color: "bg-warm-green/10 text-warm-green hover:bg-warm-green/20" },
      { label: "Garde", description: "Chercher une creche", href: "/garde", icon: Baby, color: "bg-warm-blue/10 text-warm-blue hover:bg-warm-blue/20" },
      { label: "Identite", description: "Ajouter un papier", href: "/identite", icon: IdCard, color: "bg-warm-orange/10 text-warm-orange hover:bg-warm-orange/20" },
      { label: "Impots", description: "Simuler mon IR", href: "/fiscal", icon: Calculator, color: "bg-warm-gold/10 text-warm-gold hover:bg-warm-gold/20" },
    ];
  }
  if (youngestAgeMonths !== null && youngestAgeMonths <= 36) {
    return [
      { label: "Garde", description: "Creche / nounou", href: "/garde", icon: Baby, color: "bg-warm-teal/10 text-warm-teal hover:bg-warm-teal/20" },
      { label: "Activite", description: "Sport / eveil", href: "/activites", icon: Palette, color: "bg-warm-purple/10 text-warm-purple hover:bg-warm-purple/20" },
      { label: "Developpement", description: "Jalons moteurs", href: "/developpement", icon: TrendingUp, color: "bg-warm-green/10 text-warm-green hover:bg-warm-green/20" },
      { label: "Budget", description: "Ajouter une depense", href: "/budget", icon: Wallet, color: "bg-warm-blue/10 text-warm-blue hover:bg-warm-blue/20" },
      { label: "Impots", description: "Simuler mon IR", href: "/fiscal", icon: Calculator, color: "bg-warm-gold/10 text-warm-gold hover:bg-warm-gold/20" },
      { label: "Document", description: "Importer un fichier", href: "/documents", icon: FileText, color: "bg-warm-orange/10 text-warm-orange hover:bg-warm-orange/20" },
    ];
  }
  // Default / older children / no children
  return [
    { label: "Vaccin", description: "Enregistrer une dose", href: "/sante", icon: HeartPulse, color: "bg-warm-teal/10 text-warm-teal hover:bg-warm-teal/20" },
    { label: "Document", description: "Importer un fichier", href: "/documents", icon: FileText, color: "bg-warm-blue/10 text-warm-blue hover:bg-warm-blue/20" },
    { label: "Identite", description: "Ajouter un papier", href: "/identite", icon: IdCard, color: "bg-warm-orange/10 text-warm-orange hover:bg-warm-orange/20" },
    { label: "Impots", description: "Simuler mon IR", href: "/fiscal", icon: Calculator, color: "bg-warm-gold/10 text-warm-gold hover:bg-warm-gold/20" },
    { label: "Budget", description: "Ajouter une depense", href: "/budget", icon: Wallet, color: "bg-warm-purple/10 text-warm-purple hover:bg-warm-purple/20" },
    { label: "Garde", description: "Chercher une creche", href: "/garde", icon: Baby, color: "bg-warm-green/10 text-warm-green hover:bg-warm-green/20" },
  ];
}

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
  let overdueVaccines = 0;
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
          if (existing) {
            doneDoses++;
          } else if (dose.ageMonths <= childAgeMonths) {
            overdueVaccines++;
          }
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
    getUpcomingAppointments(5),
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

  // Generate alerts + dispatch notifications for high priority ones
  try { await generateProactiveAlerts(); } catch (e) {
    console.error("[dashboard] Alert generation failed:", e);
  }
  try { await dispatchAlertNotifications(); } catch (e) {
    console.error("[dashboard] Notification dispatch failed:", e);
  }

  const alertsResult = await getAlerts();
  const proactiveAlerts = alertsResult.data ?? [];

  // Profile completion
  const completionChecks = [
    { label: "Foyer cree", done: members.length > 0 },
    { label: "Enfant ajoute", done: children.length > 0 },
    { label: "Document d'identite", done: identityDocs.length > 0 },
    { label: "Vaccin enregistre", done: doneDoses > 0 },
    { label: "Document coffre-fort", done: vaultDocs.length > 0 },
    { label: "Mesure de croissance", done: hasGrowthData },
    { label: "Activite ajoutee", done: hasActivities },
    { label: "Donnees fiscales", done: hasFiscalData },
    { label: "Depense budget", done: hasBudgetData },
    { label: "Email verifie", done: !!user?.email_confirmed_at },
  ];
  const completionPercent = Math.round(
    (completionChecks.filter((c) => c.done).length / completionChecks.length) * 100
  );

  const firstAdult = members.find((m) => m.memberType === "adult");
  const displayName = firstAdult?.firstName ?? "Utilisateur";
  const greetingMessage = GREETING_MESSAGES[now.getDay() % GREETING_MESSAGES.length];
  const vaccPercent = totalDoses > 0 ? Math.round((doneDoses / totalDoses) * 100) : 0;

  // Compute household weather
  const healthStatus = overdueVaccines > 0 ? "alert" : vaccPercent < 80 ? "warning" : "good";
  const healthDetail = overdueVaccines > 0
    ? `${overdueVaccines} vaccin${overdueVaccines > 1 ? "s" : ""} en retard`
    : vaccPercent === 100
      ? "Vaccins a jour"
      : `${vaccPercent}% des vaccins faits`;

  const expiredDocs = expiring.filter((d) => d.status === "expired").length;
  const expiringSoonDocs = expiring.filter((d) => d.status === "expiring_soon").length;
  const adminStatus = expiredDocs > 0 ? "alert" : expiringSoonDocs > 0 ? "warning" : "good";
  const adminDetail = expiredDocs > 0
    ? `${expiredDocs} doc${expiredDocs > 1 ? "s" : ""} expire${expiredDocs > 1 ? "s" : ""}`
    : expiringSoonDocs > 0
      ? `${expiringSoonDocs} expire${expiringSoonDocs > 1 ? "nt" : ""} bientot`
      : "Tout est en regle";

  const budgetBalance = budgetSummary
    ? totalAllocations + (budgetSummary.totalIncome ?? 0) - budgetSummary.totalExpenses
    : 0;
  const budgetStatus = budgetBalance < 0 ? "alert" : budgetBalance < 200 ? "warning" : "good";
  const budgetDetail = budgetSummary && budgetSummary.entryCount > 0
    ? budgetBalance >= 0
      ? `+${formatCurrency(budgetBalance)} ce mois`
      : `${formatCurrency(budgetBalance)} ce mois`
    : "Aucune donnee budget";

  // Build upcoming timeline events (30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const timelineEvents: Array<{
    id: string;
    date: Date;
    title: string;
    description: string;
    category: "sante" | "identite" | "fiscal" | "scolarite" | "examen";
    memberName?: string;
  }> = [];

  // Upcoming appointments
  for (const appt of upcomingAppointments) {
    const apptDate = new Date(appt.appointmentDate);
    if (apptDate <= thirtyDaysFromNow) {
      const member = members.find((m) => m.id === appt.memberId);
      timelineEvents.push({
        id: `appt-${appt.id}`,
        date: apptDate,
        title: appt.appointmentType,
        description: appt.practitioner ?? "RDV medical",
        category: "sante",
        memberName: member?.firstName,
      });
    }
  }

  // Expiring documents
  for (const doc of expiring) {
    if (doc.expiryDate) {
      const expDate = new Date(doc.expiryDate);
      if (expDate <= thirtyDaysFromNow && expDate >= now) {
        timelineEvents.push({
          id: `doc-${doc.id}`,
          date: expDate,
          title: `${DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType} expire`,
          description: doc.memberFirstName ?? "Membre du foyer",
          category: "identite",
          memberName: doc.memberFirstName,
        });
      }
    }
  }

  // Overdue vaccines — show as "today" events
  for (const child of children) {
    const childVaccinations = allVaccinations.filter((v) => v.memberId === child.id);
    const childAgeMonths = differenceInMonths(now, new Date(child.birthDate));

    for (const vaccine of VACCINATION_SCHEDULE) {
      for (const dose of vaccine.doses) {
        if (dose.ageMonths <= childAgeMonths && dose.ageMonths > childAgeMonths - 6) {
          const existing = childVaccinations.find(
            (v) => v.vaccineCode === vaccine.code && v.doseNumber === dose.doseNumber && v.status === "done"
          );
          if (!existing) {
            timelineEvents.push({
              id: `vacc-${vaccine.code}-${dose.doseNumber}-${child.id}`,
              date: now,
              title: `${vaccine.name} (dose ${dose.doseNumber})`,
              description: `Prevu a ${dose.label}, en retard`,
              category: "sante",
              memberName: child.firstName,
            });
          }
        }
      }
    }
  }

  // Youngest child age for contextual quick actions
  const youngestAgeMonths = children.length > 0
    ? Math.min(...children.map((c) => differenceInMonths(now, new Date(c.birthDate))))
    : null;
  const quickActions = getQuickActions(youngestAgeMonths);

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

      {/* Empty state: no children */}
      {children.length === 0 && (
        <Card className="border-2 border-dashed border-warm-teal/30 bg-warm-teal/5">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warm-teal/10">
              <Baby className="h-7 w-7 text-warm-teal" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ajoute ton premier enfant</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pour profiter du suivi vaccinal, des courbes de croissance et des alertes personnalisées, commence par ajouter ton moutard.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button asChild>
                <Link href="/onboarding">
                  Commencer <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/parametres">Gérer le foyer</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Household weather */}
      <HouseholdWeather
        health={{ label: "Sante", status: healthStatus, detail: healthDetail }}
        budget={{ label: "Budget", status: budgetStatus, detail: budgetDetail }}
        admin={{ label: "Admin", status: adminStatus, detail: adminDetail }}
      />

      {/* Profile completion */}
      {completionPercent < 100 && (
        <Card className="border-dashed border-warm-orange/30 bg-warm-orange/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-warm-orange" />
                <p className="text-sm font-semibold">Ton profil est a {completionPercent}%</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {completionChecks.filter((c) => !c.done).length} etape{completionChecks.filter((c) => !c.done).length > 1 ? "s" : ""} restante{completionChecks.filter((c) => !c.done).length > 1 ? "s" : ""}
              </Badge>
            </div>
            <Progress value={completionPercent} className="h-2 mb-3" aria-label={`Profil complete a ${completionPercent}%`} />
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
                  {check.done ? "\u2713" : "\u25CB"} {check.label}
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
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-teal/10 text-warm-teal"
          gradientClass="card-gradient-teal"
        />
        <StatCard
          label="Vaccins"
          value={totalDoses > 0 ? `${vaccPercent}%` : "\u2014"}
          icon={<Syringe className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-orange/10 text-warm-orange"
          trend={totalDoses > 0 ? `${doneDoses}/${totalDoses} doses` : undefined}
          trendUp={vaccPercent >= 80}
          gradientClass="card-gradient-orange"
        />
        <StatCard
          label="Identite"
          value={String(identityDocs.length)}
          icon={<IdCard className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-blue/10 text-warm-blue"
          trend={expiring.length > 0 ? `${expiring.length} expire${expiring.length > 1 ? "nt" : ""} bientot` : undefined}
          trendUp={false}
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Coffre-fort"
          value={`${vaultDocs.length} doc${vaultDocs.length > 1 ? "s" : ""}`}
          icon={<FolderLock className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-purple/10 text-warm-purple"
          gradientClass="card-gradient-purple"
        />
      </div>

      {/* Family overview */}
      <FamilyOverviewCard members={members} />

      {/* Alerts + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts widget with category filters */}
        <AlertsWidget alerts={proactiveAlerts} />

        {/* Quick actions — contextual by child age */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href + action.label}
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

      {/* Timeline + Budget/Fiscal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming timeline */}
        <UpcomingTimeline events={timelineEvents} />

        {/* Budget / Fiscal stacked */}
        <div className="space-y-6">
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
                    <span className="text-muted-foreground">Depenses</span>
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
                    <span className={`font-bold text-lg ${budgetBalance >= 0 ? "text-warm-green" : "text-warm-red"}`}>
                      {formatCurrency(budgetBalance)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-3 text-center">
                  <p className="text-sm text-muted-foreground">Aucune depense ce mois-ci.</p>
                  <p className="text-xs text-muted-foreground mt-1">Connecte ta banque ou ajoute tes depenses</p>
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
                    <span className="text-muted-foreground">Annee</span>
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
                      <span className="text-muted-foreground">Impot net</span>
                      <span className="font-bold text-lg">{formatCurrency(latestFiscal.impotNet)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-3 text-center">
                  <p className="text-sm text-muted-foreground">Aucune donnee fiscale.</p>
                  <p className="text-xs text-muted-foreground mt-1">Lance ta premiere simulation</p>
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
        </div>
      </div>

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
            upcomingAppointments.slice(0, 3).map((appt) => {
              const member = members.find((m) => m.id === appt.memberId);
              return (
                <div key={appt.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-2.5 transition-colors hover:bg-muted">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warm-teal/10 text-warm-teal shrink-0">
                    <CalendarClock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{appt.appointmentType}</p>
                    <p className="text-xs text-muted-foreground">
                      {member?.firstName} \u2014 {format(new Date(appt.appointmentDate), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-3 text-center">
              <p className="text-sm text-muted-foreground">Aucun RDV a venir.</p>
            </div>
          )}
          <Button variant="ghost" size="sm" className="w-full mt-1" asChild>
            <Link href="/sante">
              Voir la sante
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

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
