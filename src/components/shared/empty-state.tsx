import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref = "#",
  secondaryLabel,
  secondaryHref = "#",
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        <div className="flex gap-3">
          {actionLabel && (
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          )}
          {secondaryLabel && (
            <Button variant="outline" asChild>
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
