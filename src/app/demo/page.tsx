import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Syringe,
  IdCard,
  FolderLock,
  ArrowRight,
  Sparkles,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { HouseholdWeather } from "@/components/dashboard/household-weather";
import { FamilyOverviewCard } from "@/components/dashboard/family-overview-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_MEMBERS, DEMO_WEATHER, DEMO_STATS, DEMO_ALERTS } from "@/lib/demo/fixtures";

export const metadata: Metadata = {
  title: "Démo — un aperçu de Darons sans inscription",
  description:
    "Découvre le tableau de bord Darons avec un foyer fictif : santé, budget, papiers et alertes. Données d'exemple, aucune inscription requise.",
};

const STAT_STYLE: Record<
  string,
  { icon: React.ReactNode; color: string; gradientClass: string }
> = {
  teal: {
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
    color: "bg-warm-teal/10 text-warm-teal",
    gradientClass: "card-gradient-teal",
  },
  orange: {
    icon: <Syringe className="h-5 w-5" aria-hidden="true" />,
    color: "bg-warm-orange/10 text-warm-orange",
    gradientClass: "card-gradient-orange",
  },
  blue: {
    icon: <IdCard className="h-5 w-5" aria-hidden="true" />,
    color: "bg-warm-blue/10 text-warm-blue",
    gradientClass: "card-gradient-blue",
  },
  purple: {
    icon: <FolderLock className="h-5 w-5" aria-hidden="true" />,
    color: "bg-warm-purple/10 text-warm-purple",
    gradientClass: "card-gradient-purple",
  },
};

const ALERT_COLORS: Record<string, string> = {
  identite: "bg-warm-orange/10 text-warm-orange",
  sante: "bg-warm-teal/10 text-warm-teal",
  fiscal: "bg-warm-gold/10 text-warm-gold",
};

const ALERT_LABELS: Record<string, string> = {
  identite: "Identité",
  sante: "Santé",
  fiscal: "Fiscal",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Bandeau démo */}
      <div className="sticky top-0 z-50 bg-warm-orange text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-2.5 text-sm sm:flex-row">
          <span className="font-medium">
            🎭 Mode démo — données fictives. Ton vrai foyer, c&apos;est en 2 minutes.
          </span>
          <Button asChild size="sm" variant="secondary" className="shrink-0">
            <Link href="/register">
              C&apos;est gratuit, je m&apos;inscris
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <PageHeader
          title="Le foyer Démo, en un coup d'œil"
          description="Voici à quoi ressemble ton tableau de bord Darons une fois ta tribu ajoutée."
        />

        <HouseholdWeather
          health={DEMO_WEATHER.health}
          budget={DEMO_WEATHER.budget}
          admin={DEMO_WEATHER.admin}
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {DEMO_STATS.map((stat) => {
            const style = STAT_STYLE[stat.tone];
            return (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={style.icon}
                color={style.color}
                gradientClass={style.gradientClass}
                trend={"trend" in stat ? stat.trend : undefined}
              />
            );
          })}
        </div>

        <FamilyOverviewCard members={DEMO_MEMBERS} />

        {/* Alertes (statique en démo) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-warm-orange" />
              Ce que Darons anticipe pour toi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DEMO_ALERTS.map((alert) => (
              <div
                key={alert.title}
                className="flex items-start gap-3 rounded-xl bg-muted/50 p-3"
              >
                <Badge className={ALERT_COLORS[alert.category]}>
                  {ALERT_LABELS[alert.category]}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* CTA final */}
        <Card className="card-gradient-teal text-center">
          <CardContent className="space-y-4 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">
              Prêt·e à gérer ton vrai foyer ?
            </h2>
            <p className="text-sm text-muted-foreground">
              Santé, budget, impôts, papiers — c&apos;est gratuit et sans engagement.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Créer mon foyer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/outils">
                  <Wrench className="mr-2 h-4 w-4" />
                  Essayer les outils gratuits
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
