"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cancelInvitation } from "@/lib/actions/sharing";
import { INVITATION_ROLE_LABELS } from "@/types/sharing";
import type { HouseholdInvitation } from "@/types/sharing";
import { X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface InvitationListProps {
  invitations: HouseholdInvitation[];
}

export function InvitationList({ invitations }: InvitationListProps) {
  const [cancelling, setCancelling] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCancel = async (id: string) => {
    setCancelling(id);
    const result = await cancelInvitation(id);
    setCancelling(null);

    if (result.success) {
      toast({ title: "Invitation annulée" });
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{invitation.inviteeEmail}</p>
              <p className="text-xs text-muted-foreground">
                Envoyée {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {INVITATION_ROLE_LABELS[invitation.role]}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancel(invitation.id)}
              disabled={cancelling === invitation.id}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
