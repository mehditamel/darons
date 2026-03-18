import type { Metadata } from "next";
import {
  HeartPulse,
  Wallet,
  Calculator,
  IdCard,
  Baby,
  Syringe,
  FileText,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getGreeting } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default function DashboardPage() {
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, Mehdi`}
        description="Voici un r\u00e9sum\u00e9 de votre foyer familial"
      />

      {/* Profile completion */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Compl\u00e9tude du profil</p>
            <span className="text-sm text-muted-foreground">30%</span>
          </div>
          <Progress value={30} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            Ajoutez des vaccins, des documents et des donn\u00e9es fiscales pour compl\u00e9ter votre profil.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Membres du foyer"
          value="3"
          icon={Baby}
          color="bg-warm-teal/10 text-warm-teal"
        />
        <StatCard
          label="Vaccins \u00e0 jour"
          value="4/24"
          icon={Syringe}
          color="bg-warm-orange/10 text-warm-orange"
        />
        <StatCard
          label="Budget mensuel"
          value="1 245 \u20ac"
          icon={Wallet}
          color="bg-warm-blue/10 text-warm-blue"
        />
        <StatCard
          label="\u00c9conomie fiscale"
          value="3 850 \u20ac"
          icon={Calculator}
          color="bg-warm-gold/10 text-warm-gold"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertCard
              title="Vaccin DTPCa - 2\u00e8me dose"
              message="La 2\u00e8me dose de Matis est pr\u00e9vue pour ses 4 mois (juillet 2025)"
              priority="medium"
              category="Sant\u00e9"
              dueDate="10/07/2025"
            />
            <AlertCard
              title="D\u00e9claration de revenus"
              message="N'oubliez pas la d\u00e9claration IR 2025 sur les revenus 2024"
              priority="high"
              category="Fiscal"
              dueDate="Mai 2025"
            />
            <AlertCard
              title="Renouvellement CMG"
              message="Pensez \u00e0 renouveler votre d\u00e9claration CMG aupr\u00e8s de la CAF"
              priority="low"
              category="CAF"
            />
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
                label: "Ajouter un document",
                href: "/documents",
                icon: FileText,
                color: "text-warm-blue",
              },
              {
                label: "Saisir une d\u00e9pense",
                href: "/budget",
                icon: Wallet,
                color: "text-warm-purple",
              },
              {
                label: "Ajouter une pi\u00e8ce d'identit\u00e9",
                href: "/identite",
                icon: IdCard,
                color: "text-warm-orange",
              },
            ].map((action) => (
              <Button
                key={action.href}
                variant="ghost"
                className="w-full justify-between h-auto py-3"
                asChild
              >
                <a href={action.href}>
                  <div className="flex items-center gap-3">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span>{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </a>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
