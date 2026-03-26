import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconColor?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  icon,
  iconColor = "bg-primary/10 text-primary",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shrink-0 mt-0.5 transition-transform hover:scale-105",
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
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
