import { AlertCircle, AlertTriangle, Info, ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

type Priority = "high" | "medium" | "low";

interface AlertCardProps {
  title: string;
  message: string;
  priority: Priority;
  category: string;
  dueDate?: string;
  actionUrl?: string | null;
  className?: string;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { icon: LucideIcon; variant: "destructive" | "warning" | "outline"; bg: string; glow: string }
> = {
  high: { icon: AlertCircle, variant: "destructive", bg: "border-l-warm-red", glow: "bg-warm-red/5" },
  medium: { icon: AlertTriangle, variant: "warning", bg: "border-l-warm-orange", glow: "bg-warm-orange/5" },
  low: { icon: Info, variant: "outline", bg: "border-l-warm-blue", glow: "bg-warm-blue/5" },
};

export function AlertCard({
  title,
  message,
  priority,
  category,
  dueDate,
  actionUrl,
  className,
}: AlertCardProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  const content = (
    <Card className={cn("border-l-4 transition-all duration-200 hover:shadow-sm", config.bg, config.glow, actionUrl && "cursor-pointer hover:-translate-y-0.5", className)}>
      <CardContent className="flex items-start gap-3 p-3.5">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
          priority === "high" ? "bg-warm-red/10 text-warm-red" :
          priority === "medium" ? "bg-warm-orange/10 text-warm-orange" :
          "bg-warm-blue/10 text-warm-blue"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{title}</p>
            <Badge variant={config.variant} className="text-[10px] shrink-0">
              {category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
          {dueDate && (
            <p className="text-[11px] text-muted-foreground font-medium">
              Échéance : {dueDate}
            </p>
          )}
        </div>
        {actionUrl && (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground mt-2" />
        )}
      </CardContent>
    </Card>
  );

  if (actionUrl) {
    return (
      <Link
        href={actionUrl}
        onClick={() => trackEvent("alert_clicked", { alertType: category })}
      >
        {content}
      </Link>
    );
  }

  return content;
}
