import {
  CalendarClock,
  Syringe,
  IdCard,
  Calculator,
  GraduationCap,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  category: "sante" | "identite" | "fiscal" | "scolarite" | "examen";
  memberName?: string;
}

interface UpcomingTimelineProps {
  events: TimelineEvent[];
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  sante: { icon: Syringe, color: "text-warm-teal", bg: "bg-warm-teal/10" },
  identite: { icon: IdCard, color: "text-warm-orange", bg: "bg-warm-orange/10" },
  fiscal: { icon: Calculator, color: "text-warm-gold", bg: "bg-warm-gold/10" },
  scolarite: { icon: GraduationCap, color: "text-warm-purple", bg: "bg-warm-purple/10" },
  examen: { icon: Stethoscope, color: "text-warm-blue", bg: "bg-warm-blue/10" },
};

export function UpcomingTimeline({ events }: UpcomingTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const now = new Date();

  if (sortedEvents.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-warm-teal" />
            Prochains 30 jours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Rien de prevu pour le moment. Profite !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-warm-teal" />
            Prochains 30 jours
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {sortedEvents.length} evenement{sortedEvents.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-3">
            {sortedEvents.slice(0, 8).map((event) => {
              const config =
                CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.sante;
              const Icon = config.icon;
              const daysUntil = differenceInDays(event.date, now);
              const urgencyClass =
                daysUntil <= 3
                  ? "font-bold text-warm-red"
                  : daysUntil <= 7
                    ? "font-semibold text-warm-orange"
                    : "text-muted-foreground";

              return (
                <div key={event.id} className="relative flex gap-3 pl-0">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-lg ${config.bg} ${config.color} shrink-0`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      {event.memberName && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {event.memberName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.description}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${urgencyClass}`}>
                      {format(event.date, "EEEE d MMMM", { locale: fr })}
                      {daysUntil === 0
                        ? " — aujourd'hui"
                        : daysUntil === 1
                          ? " — demain"
                          : ` — dans ${daysUntil} jours`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
