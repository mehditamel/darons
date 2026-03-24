import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SkeletonBlock } from "@/components/shared/skeleton-page";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <SkeletonBlock className="h-8 w-20 rounded-md" />

      {/* Page header */}
      <div>
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="mt-2 h-4 w-72" />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-3">
              <SkeletonBlock className="h-5 w-5 rounded" />
              <div className="space-y-1.5">
                <SkeletonBlock className="h-6 w-16" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Members card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="h-8 w-32 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-8 w-8 rounded-full" />
                  <SkeletonBlock className="h-4 w-24" />
                </div>
                <SkeletonBlock className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Balance + Expenses grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonBlock className="mt-1 h-3 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-5 w-24" />
              <SkeletonBlock className="h-8 w-36 rounded-md" />
            </div>
            <SkeletonBlock className="mt-1 h-3 w-20" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-4 w-32" />
                  <SkeletonBlock className="h-3 w-40" />
                </div>
                <SkeletonBlock className="h-5 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
