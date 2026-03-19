import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvitationForm } from "@/components/partage/invitation-form";
import { InvitationList } from "@/components/partage/invitation-list";
import { HouseholdMemberList } from "@/components/partage/household-member-list";
import { getHouseholdInvitations, getHouseholdMembers } from "@/lib/actions/sharing";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";
import { Users, Mail, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Partage du foyer",
  description: "Gérez l'accès à votre foyer familial",
};

export default async function PartagePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("subscription_plan").eq("id", user.id).single()
    : { data: null };

  const plan = (profile?.subscription_plan ?? "free") as keyof typeof PLAN_LIMITS;
  const hasMultiHousehold = PLAN_LIMITS[plan].hasMultiHousehold;

  const [membersResult, invitationsResult] = await Promise.all([
    getHouseholdMembers(),
    getHouseholdInvitations(),
  ]);

  const members = membersResult.data ?? [];
  const invitations = invitationsResult.data ?? [];
  const pendingInvitations = invitations.filter((i) => i.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partage du foyer"
        description="Invite des proches à consulter ou collaborer sur ton espace familial"
      />

      {!hasMultiHousehold && (
        <Card className="border-warm-orange/30 bg-warm-orange/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-warm-orange shrink-0" />
            <div>
              <p className="text-sm font-medium">Fonctionnalité Family Pro</p>
              <p className="text-xs text-muted-foreground">
                Le partage multi-foyers est réservé au plan Family Pro (19,90 €/mois).
                Vous pouvez inviter grands-parents, nounou ou co-parent.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current members */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-warm-teal" />
              <div>
                <CardTitle>Membres du foyer</CardTitle>
                <CardDescription>
                  {members.length} membre{members.length > 1 ? "s" : ""} connecté{members.length > 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <HouseholdMemberList members={members} isOwner={hasMultiHousehold} />
          </CardContent>
        </Card>

        {/* Invite form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-warm-blue" />
              <div>
                <CardTitle>Inviter un proche</CardTitle>
                <CardDescription>
                  Envoyez une invitation par email
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <InvitationForm disabled={!hasMultiHousehold} />
          </CardContent>
        </Card>
      </div>

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Invitations en attente</CardTitle>
              <Badge variant="secondary">{pendingInvitations.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <InvitationList invitations={pendingInvitations} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
