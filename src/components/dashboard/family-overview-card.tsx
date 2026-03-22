import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FamilyMember } from "@/types/family";
import { differenceInMonths, differenceInYears } from "date-fns";

interface FamilyOverviewCardProps {
  members: FamilyMember[];
}

function formatAge(birthDate: string): string {
  const now = new Date();
  const birth = new Date(birthDate);
  const years = differenceInYears(now, birth);
  if (years >= 2) return `${years} ans`;
  const months = differenceInMonths(now, birth);
  return `${months} mois`;
}

const AVATAR_COLORS = [
  "from-warm-teal to-warm-teal/70",
  "from-warm-orange to-warm-orange/70",
  "from-warm-blue to-warm-blue/70",
  "from-warm-purple to-warm-purple/70",
  "from-warm-gold to-warm-gold/70",
];

export function FamilyOverviewCard({ members }: FamilyOverviewCardProps) {
  if (members.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-warm-teal" />
            Ta tribu
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
            <Link href="/parametres">
              Gérer
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-5 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {members.map((member, index) => (
            <Link
              key={member.id}
              href={member.memberType === "child" ? "/sante" : "/parametres"}
              className="flex flex-col items-center gap-2.5 min-w-[72px] group snap-start"
            >
              <div className="relative">
                <Avatar className={`h-14 w-14 ring-2 ring-background shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                  <AvatarFallback className={`text-sm font-bold text-white bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                    {member.firstName[0]}{member.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {member.memberType === "child" && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-background border px-1.5 py-0 text-[9px] font-semibold text-muted-foreground shadow-sm">
                    {formatAge(member.birthDate)}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold truncate max-w-[72px]">{member.firstName}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {member.memberType === "child" ? "Enfant" : "Parent"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
