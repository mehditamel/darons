import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowRight, Palette } from "lucide-react";
import type { Activity } from "@/types/educational";
import { ACTIVITY_CATEGORY_LABELS, type ActivityCategory } from "@/types/educational";

interface WeeklyActivitiesCardProps {
  activities: Activity[];
  childName: string;
}

export function WeeklyActivitiesCard({ activities, childName }: WeeklyActivitiesCardProps) {
  const activeActivities = activities.filter((a) => a.active);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-warm-purple" />
          Activités
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeActivities.length > 0 ? (
          activeActivities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5 transition-colors hover:bg-muted">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{activity.name}</p>
                {activity.schedule && (
                  <p className="text-xs text-muted-foreground truncate">{activity.schedule}</p>
                )}
              </div>
              {activity.category && (
                <Badge variant="outline" className="text-[10px] ml-2 shrink-0">
                  {ACTIVITY_CATEGORY_LABELS[activity.category as ActivityCategory] ?? activity.category}
                </Badge>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-purple/10 mb-3">
              <Palette className="h-5 w-5 text-warm-purple" />
            </div>
            <p className="text-sm font-medium">Pas encore d&apos;activité</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Sport, musique, éveil — ajoute les activités de {childName}
            </p>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full mt-1" asChild>
          <Link href="/activites">
            Voir les activités
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
