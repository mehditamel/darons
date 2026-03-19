import { AlertCircle, AlertTriangle, Info, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Priority = "high" | "medium" | "low";

interface AlertCardProps {
  title: string;
  message: string;
  priority: Priority;
  category: string;
  dueDate?: string;
  className?: string;
}

const PRIORITY_CONFIG: Record<
  Priority,
  { icon: LucideIcon; variant: "destructive" | "warning" | "outline"; bg: string }
> = {
  high: { icon: AlertCircle, variant: "destructive", bg: "border-l-warm-red" },
  medium: { icon: AlertTriangle, variant: "warning", bg: "border-l-warm-orange" },
  low: { icon: Info, variant: "outline", bg: "border-l-warm-blue" },
};

export function AlertCard({
  title,
  message,
  priority,
  category,
  dueDate,
  className,
}: AlertCardProps) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;

  return (
    <Card className={cn("border-l-4", config.bg, className)}>
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{title}</p>
            <Badge variant={config.variant} className="text-[10px]">
              {category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{message}</p>
          {dueDate && (
            <p className="text-xs text-muted-foreground">
              Échéance : {dueDate}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
