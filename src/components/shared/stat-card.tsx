import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = "bg-primary/10 text-primary",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("transition-shadow duration-200 hover:shadow-md animate-fade-in-up", className)} role="status" aria-label={`${label} : ${value}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold" aria-hidden="true">{value}</p>
            {trend && (
              <p
                className={cn(
                  "mt-1 text-xs",
                  trendUp ? "text-warm-green" : "text-warm-red"
                )}
              >
                {trend}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              color
            )}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
