import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/shared/skeleton-page";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="mt-2 h-4 w-80" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <SkeletonBlock className="h-5 w-12" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <SkeletonBlock className="h-9 w-32 rounded-md" />
        <SkeletonBlock className="h-9 w-32 rounded-md" />
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <SkeletonBlock className="h-4 w-48" />
                  <SkeletonBlock className="h-3 w-64" />
                </div>
              </div>
              <SkeletonBlock className="h-8 w-20 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
