import { Card, CardContent } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, BarChart3, Gift, Percent } from "lucide-react";

interface AdminStatsGridProps {
  summary: {
    totalUsers: number;
    premiumUsers: number;
    familyProUsers: number;
    mrr: number;
    conversionRate: number;
    referralCount: number;
  };
}

export function AdminStatsGrid({ summary }: AdminStatsGridProps) {
  const stats = [
    {
      label: "Utilisateurs totaux",
      value: summary.totalUsers.toLocaleString("fr-FR"),
      icon: Users,
      color: "text-warm-blue",
      bg: "bg-warm-blue/10",
    },
    {
      label: "MRR",
      value: `${summary.mrr.toLocaleString("fr-FR")} €`,
      icon: CreditCard,
      color: "text-warm-teal",
      bg: "bg-warm-teal/10",
    },
    {
      label: "Premium",
      value: summary.premiumUsers.toLocaleString("fr-FR"),
      icon: TrendingUp,
      color: "text-warm-orange",
      bg: "bg-warm-orange/10",
    },
    {
      label: "Family Pro",
      value: summary.familyProUsers.toLocaleString("fr-FR"),
      icon: BarChart3,
      color: "text-warm-gold",
      bg: "bg-warm-gold/10",
    },
    {
      label: "Taux de conversion",
      value: `${summary.conversionRate}%`,
      icon: Percent,
      color: "text-warm-purple",
      bg: "bg-warm-purple/10",
    },
    {
      label: "Parrainages",
      value: summary.referralCount.toLocaleString("fr-FR"),
      icon: Gift,
      color: "text-warm-teal",
      bg: "bg-warm-teal/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
