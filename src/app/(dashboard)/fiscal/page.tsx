import type { Metadata } from "next";
import { Calculator, TrendingDown, Percent, Users, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { AlertCard } from "@/components/shared/alert-card";
import { FiscalTabs } from "@/components/fiscal/fiscal-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFamilyMembers } from "@/lib/actions/family";
import { getFiscalYears } from "@/lib/actions/fiscal";
import { simulateIR } from "@/lib/simulators/ir-simulator";
import { FISCAL_DEADLINES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Foyer fiscal",
  description: "Simulation IR, crédits d'impôt et échéancier fiscal",
};

function getNextFiscalDeadline(): { label: string; description: string; daysUntil: number; date: Date } | null {
  const now = new Date();
  const currentYear = now.getFullYear();

  for (const deadline of FISCAL_DEADLINES) {
    const deadlineDate = new Date(currentYear, deadline.month - 1, deadline.day);
    const diffMs = deadlineDate.getTime() - now.getTime();
    const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (daysUntil > 0) {
      return { label: deadline.label, description: deadline.description, daysUntil, date: deadlineDate };
    }
  }

  // Next year's first deadline
  const nextYear = currentYear + 1;
  const first = FISCAL_DEADLINES[0];
  const nextDate = new Date(nextYear, first.month - 1, first.day);
  const diffMs = nextDate.getTime() - now.getTime();
  return { label: first.label, description: first.description, daysUntil: Math.ceil(diffMs / (1000 * 60 * 60 * 24)), date: nextDate };
}

export default async function FiscalPage() {
  const [membersResult, fiscalResult] = await Promise.all([
    getFamilyMembers(),
    getFiscalYears(),
  ]);

  const members = membersResult.data ?? [];
  const adults = members.filter((m) => m.memberType === "adult");
  const children = members.filter((m) => m.memberType === "child");

  // Calculate default parts: 2 per couple (or 1 if single) + 0.5 per child (first 2), +1 per child after
  const adultParts = Math.min(adults.length, 2);
  const childParts = children.reduce((acc, _, index) => {
    return acc + (index < 2 ? 0.5 : 1);
  }, 0);
  const defaultNbParts = adultParts + childParts;

  const savedFiscalYears = fiscalResult.data ?? [];
  const latestYear = savedFiscalYears.length > 0
    ? savedFiscalYears.sort((a, b) => b.year - a.year)[0]
    : null;

  // Simulate IR with latest year data or reasonable defaults
  const simulationResult = latestYear?.revenuNetImposable
    ? simulateIR({
        revenuNetImposable: latestYear.revenuNetImposable,
        nbParts: latestYear.nbParts,
        numChildren: children.length,
        gardeEnfantExpenses: 0,
        emploiDomicileExpenses: 0,
        donsOrganismes: 0,
        donsAidePersonnes: 0,
      })
    : null;

  // Calculate savings vs single person without children
  const savingsVsSingle = simulationResult && latestYear?.revenuNetImposable
    ? (() => {
        const singleResult = simulateIR({
          revenuNetImposable: latestYear.revenuNetImposable,
          nbParts: 1,
          numChildren: 0,
          gardeEnfantExpenses: 0,
          emploiDomicileExpenses: 0,
          donsOrganismes: 0,
          donsAidePersonnes: 0,
        });
        return Math.max(0, singleResult.impotNet - simulationResult.impotNet);
      })()
    : null;

  const nextDeadline = getNextFiscalDeadline();

  return (
    <div className="space-y-8 page-enter">
      <PageHeader
        title="Foyer fiscal"
        description="Tes impôts, on t'aide à payer moins"
        icon={<Calculator className="h-5 w-5" />}
        iconColor="bg-warm-gold/10 text-warm-gold"
      />

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Parts fiscales"
          value={String(latestYear?.nbParts ?? defaultNbParts)}
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-gold/10 text-warm-gold"
          gradientClass="card-gradient-gold"
        />
        <StatCard
          label="TMI"
          value={simulationResult ? `${simulationResult.tmi} %` : "—"}
          icon={<Percent className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-orange/10 text-warm-orange"
          gradientClass="card-gradient-orange"
        />
        <StatCard
          label="Impôt net"
          value={simulationResult ? formatCurrency(simulationResult.impotNet) : "—"}
          icon={<Calculator className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-blue/10 text-warm-blue"
          gradientClass="card-gradient-blue"
        />
        <StatCard
          label="Économie famille"
          value={savingsVsSingle !== null ? formatCurrency(savingsVsSingle) : "—"}
          icon={<TrendingDown className="h-5 w-5" aria-hidden="true" />}
          color="bg-warm-green/10 text-warm-green"
          gradientClass="card-gradient-green"
          trend={savingsVsSingle !== null ? "vs célibataire sans enfant" : undefined}
          trendUp={true}
        />
      </div>

      {/* Next fiscal deadline */}
      {nextDeadline && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-warm-gold" />
              Prochaine échéance fiscale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{nextDeadline.label}</p>
                <p className="text-sm text-muted-foreground">{nextDeadline.description}</p>
              </div>
              <Badge
                variant={nextDeadline.daysUntil <= 30 ? "destructive" : "outline"}
                className="text-sm px-3 py-1"
              >
                dans {nextDeadline.daysUntil} jour{nextDeadline.daysUntil > 1 ? "s" : ""}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert if no fiscal data */}
      {savedFiscalYears.length === 0 && (
        <AlertCard
          title="Aucune donnée fiscale"
          message="Lance ta première simulation pour voir combien tu peux économiser grâce à ta famille."
          priority="low"
          category="Fiscal"
          actionUrl="#simulation"
        />
      )}

      <FiscalTabs
        defaultNbParts={defaultNbParts || 1}
        defaultNumChildren={children.length}
        savedFiscalYears={savedFiscalYears}
      />
    </div>
  );
}
