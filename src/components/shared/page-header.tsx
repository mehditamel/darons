import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconColor?: string;
  /** Optional breadcrumb trail rendered above the title (desktop wayfinding). */
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHeader({
  title,
  description,
  children,
  className,
  icon,
  iconColor = "bg-primary/10 text-primary",
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className={cn("animate-fade-in-up", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 mt-0.5 shadow-elevation-1 transition-transform hover:scale-105",
                iconColor
              )}
            >
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight lg:text-3xl xl:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground lg:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-2 max-sm:w-full max-sm:[&>*]:flex-1">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
