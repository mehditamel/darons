import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

interface SkeletonPageProps {
  /** Number of stat cards to show in the top grid */
  statCards?: number;
  /** Number of content cards below */
  contentCards?: number;
  /** Show tabs skeleton */
  showTabs?: boolean;
}

export function SkeletonPage({
  statCards = 0,
  contentCards = 2,
  showTabs = false,
}: SkeletonPageProps) {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div>
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {/* Stat cards */}
      {statCards > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: statCards }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <SkeletonBlock className="h-4 w-24 mb-2" />
                <SkeletonBlock className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs skeleton */}
      {showTabs && (
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-9 w-28 rounded-md" />
          ))}
        </div>
      )}

      {/* Content cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: contentCards }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <SkeletonBlock className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
