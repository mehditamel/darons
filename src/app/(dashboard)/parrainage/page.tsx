import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReferralCodeCard } from "@/components/parrainage/referral-code-card";
import { ReferralInviteForm } from "@/components/parrainage/referral-invite-form";
import { ReferralList } from "@/components/parrainage/referral-list";
import { getMyReferralCode, getMyReferrals, getReferralStats } from "@/lib/actions/referral";
import { Gift, Users, Star, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Parrainage",
  description: "Parrainez vos proches et gagnez des récompenses",
};

export default async function ParrainagePage() {
  const [codeResult, referralsResult, statsResult] = await Promise.all([
    getMyReferralCode(),
    getMyReferrals(),
    getReferralStats(),
  ]);

  const referralCode = codeResult.data ?? "";
  const referrals = referralsResult.data ?? [];
  const stats = statsResult.data ?? {
    totalInvites: 0,
    signedUp: 0,
    subscribed: 0,
    rewardsEarned: 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programme de parrainage"
        description="Invite tes proches à rejoindre Darons et gagne des récompenses"
      />

      {/* Reward explanation */}
      <Card className="bg-gradient-to-r from-warm-orange/10 to-warm-gold/10 border-warm-orange/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Gift className="h-8 w-8 text-warm-orange shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Comment ça marche ?</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Badge variant="outline" className="shrink-0">1</Badge>
                  <span>Partagez votre code de parrainage avec vos proches</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="shrink-0">2</Badge>
                  <span>Ils s&apos;inscrivent gratuitement avec votre code</span>
                </li>
                <li className="flex gap-2">
                  <Badge variant="outline" className="shrink-0">3</Badge>
                  <span>Quand ils souscrivent un abonnement, vous recevez <strong>1 mois gratuit</strong></span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-warm-blue mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalInvites}</p>
            <p className="text-xs text-muted-foreground">Invitations envoyées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-5 w-5 text-warm-teal mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.signedUp}</p>
            <p className="text-xs text-muted-foreground">Inscrits</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-5 w-5 text-warm-gold mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.subscribed}</p>
            <p className="text-xs text-muted-foreground">Abonnés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-5 w-5 text-warm-orange mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.rewardsEarned}</p>
            <p className="text-xs text-muted-foreground">Récompenses gagnées</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Referral code */}
        <ReferralCodeCard code={referralCode} />

        {/* Invite form */}
        <Card>
          <CardHeader>
            <CardTitle>Inviter par email</CardTitle>
            <CardDescription>
              Envoyez directement une invitation à un proche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralInviteForm />
          </CardContent>
        </Card>
      </div>

      {/* Referral history */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des parrainages</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferralList referrals={referrals} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
