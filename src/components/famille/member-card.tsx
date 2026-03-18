import { User, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { calculateAge, formatDate } from "@/lib/utils";
import type { FamilyMember } from "@/types/family";
import { MEMBER_TYPE_LABELS } from "@/types/family";

interface MemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

export function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  const age = calculateAge(member.birthDate);
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className={member.memberType === "child" ? "bg-warm-teal/10 text-warm-teal" : "bg-warm-blue/10 text-warm-blue"}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">
              {member.firstName} {member.lastName}
            </p>
            <Badge variant={member.memberType === "child" ? "default" : "secondary"} className="shrink-0">
              {MEMBER_TYPE_LABELS[member.memberType]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {age.label} — Né{member.gender === "F" ? "e" : ""} le {formatDate(member.birthDate)}
          </p>
          {member.notes && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{member.notes}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(member)} aria-label={`Modifier ${member.firstName}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(member)} aria-label={`Supprimer ${member.firstName}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
