import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
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
  "bg-warm-teal/20 text-warm-teal",
  "bg-warm-orange/20 text-warm-orange",
  "bg-warm-blue/20 text-warm-blue",
  "bg-warm-purple/20 text-warm-purple",
  "bg-warm-gold/20 text-warm-gold",
];

export function FamilyOverviewCard({ members }: FamilyOverviewCardProps) {
  if (members.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-warm-teal" />
          Ta tribu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
          {members.map((member, index) => (
            <Link
              key={member.id}
              href={member.memberType === "child" ? "/sante" : "/parametres"}
              className="flex flex-col items-center gap-2 min-w-[80px] group"
            >
              <Avatar className={`h-12 w-12 ${AVATAR_COLORS[index % AVATAR_COLORS.length]} transition-transform group-hover:scale-105`}>
                <AvatarFallback className="text-sm font-semibold bg-transparent">
                  {member.firstName[0]}{member.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-xs font-medium truncate max-w-[80px]">{member.firstName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {member.memberType === "child" ? formatAge(member.birthDate) : "Parent"}
                </p>
              </div>
              {member.memberType === "child" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {formatAge(member.birthDate)}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
