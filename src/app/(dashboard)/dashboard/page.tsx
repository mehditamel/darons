import type { Metadata } from "next";
import {
  HeartPulse,
  Wallet,
  Calculator,
  Syringe,
  FileText,
  ArrowRight,
  IdCard,
  Users,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getGreeting, formatDate } from "@/lib/utils";
import { getFamilyMembers } from "@/lib/actions/family";
import { getIdentityDocuments, getExpiringDocuments } from "@/lib/actions/identity";
import { getVaccinations } from "@/lib/actions/health";
import { getDocuments } from "@/lib/actions/documents";
import { VACCINATION_SCHEDULE } from "@/lib/constants";
import { DOCUMENT_TYPE_LABELS } from "@/types/family";
import { differenceInMonths } from "date-fns";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function DashboardPage() {
  const greeting = getGreeting();

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

  // Get vaccination stats for all children
  let totalDoses = 0;
  let doneDoses = 0;
  for (const child of children) {
    const vaccResult = await getVaccinations(child.id);
    const vaccinations = vaccResult.data ?? [];
    const childAgeMonths = differenceInMonths(new Date(), new Date(child.birthDate));

    for (const vaccine of VACCINATION_SCHEDULE) {
      for (const dose of vaccine.doses) {
        if (dose.ageMonths <= childAgeMonths + 3) {
          totalDoses++;
          const existing = vaccinations.find(
            (v) => v.vaccineCode === vaccine.code && v.doseNumber === dose.doseNumber && v.status === "done"
          );
          if (existing) doneDoses++;
        }
      }
    }
  }

  // Profile completion
  const completionChecks = [
    members.length > 0,
    children.length > 0,
    identityDocs.length > 0,
    doneDoses > 0,
    vaultDocs.length > 0,
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
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
            <Progress value={completionPercent} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {completionPercent < 40
                ? "Ajoutez des membres, documents et vaccins pour compléter votre profil."
                : completionPercent < 80
                ? "Vous avez bien avancé ! Continuez à enrichir votre cockpit."
                : "Presque terminé ! Plus que quelques étapes."}
            </p>
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
            {expiring.length > 0 ? (
              expiring.slice(0, 3).map((doc) => (
                <AlertCard
                  key={doc.id}
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
    </div>
  );
}
