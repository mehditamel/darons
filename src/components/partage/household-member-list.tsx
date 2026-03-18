"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { removeHouseholdMember } from "@/lib/actions/sharing";
import type { HouseholdMember } from "@/types/sharing";
import { Crown, UserMinus } from "lucide-react";

interface HouseholdMemberListProps {
  members: HouseholdMember[];
  isOwner: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  partner: "Partenaire",
  viewer: "Lecteur",
  nanny: "Nounou",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-warm-gold/10 text-warm-gold border-warm-gold/20",
  partner: "bg-warm-teal/10 text-warm-teal border-warm-teal/20",
  viewer: "bg-warm-blue/10 text-warm-blue border-warm-blue/20",
  nanny: "bg-warm-purple/10 text-warm-purple border-warm-purple/20",
};

export function HouseholdMemberList({ members, isOwner }: HouseholdMemberListProps) {
  const [removing, setRemoving] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRemove = async (memberId: string) => {
    setRemoving(memberId);
    const result = await removeHouseholdMember(memberId);
    setRemoving(null);

    if (result.success) {
      toast({ title: "Membre retiré" });
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Aucun membre connecté à ce foyer.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const initials = member.profile
          ? `${member.profile.firstName[0]}${member.profile.lastName[0]}`
          : "?";

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {member.profile
                    ? `${member.profile.firstName} ${member.profile.lastName}`
                    : "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.profile?.email ?? ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={ROLE_COLORS[member.role]}>
                {member.role === "owner" && <Crown className="h-3 w-3 mr-1" />}
                {ROLE_LABELS[member.role]}
              </Badge>
              {isOwner && member.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(member.id)}
                  disabled={removing === member.id}
                >
                  <UserMinus className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
