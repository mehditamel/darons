import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyStateShell } from "@/components/shared/empty-state-shell";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <EmptyStateShell
      visual={
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      }
      title={title}
      description={description}
      actions={
        (actionLabel || secondaryLabel) && (
          <>
            {actionLabel && actionHref && (
              <Button asChild>
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            )}
            {actionLabel && !actionHref && (
              <Button onClick={onAction} disabled={!onAction}>
                {actionLabel}
              </Button>
            )}
            {secondaryLabel && secondaryHref && (
              <Button variant="outline" asChild>
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            )}
            {secondaryLabel && !secondaryHref && (
              <Button
                variant="outline"
                onClick={onSecondaryAction}
                disabled={!onSecondaryAction}
              >
                {secondaryLabel}
              </Button>
            )}
          </>
        )
      }
    />
  );
}
