import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateShellProps {
  /** Icon ring or illustration shown at the top. */
  visual: React.ReactNode;
  title: string;
  description: string;
  /** Action buttons rendered as a centered, wrapping group. */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Canonical empty-state presentation shared by `EmptyState` and
 * `EnhancedEmptyState`. Restyle here once to update every empty list.
 */
export function EmptyStateShell({
  visual,
  title,
  description,
  actions,
  className,
}: EmptyStateShellProps) {
  return (
    <Card className={cn("overflow-hidden border-dashed", className)}>
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="mb-6">{visual}</div>
        <h3
          className="text-lg font-semibold animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {title}
        </h3>
        <p
          className="mt-2 max-w-sm text-sm text-muted-foreground animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {description}
        </p>
        {actions && (
          <div
            className="mt-6 flex flex-wrap justify-center gap-2 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
