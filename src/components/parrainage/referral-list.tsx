import { Badge } from "@/components/ui/badge";
import { REWARD_TYPE_LABELS } from "@/types/sharing";
import type { Referral } from "@/types/sharing";
import { formatDate } from "@/lib/utils";

interface ReferralListProps {
  referrals: Referral[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  signed_up: "Inscrit",
  subscribed: "Abonné",
  rewarded: "Récompensé",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  signed_up: "bg-warm-blue/10 text-warm-blue",
  subscribed: "bg-warm-teal/10 text-warm-teal",
  rewarded: "bg-warm-gold/10 text-warm-gold",
};

export function ReferralList({ referrals }: ReferralListProps) {
  return (
    <div className="space-y-2">
      {referrals.map((referral) => (
        <div
          key={referral.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div>
            <p className="text-sm font-medium">{referral.referreeEmail}</p>
            <p className="text-xs text-muted-foreground">
              Invité le {formatDate(referral.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {referral.rewardApplied && (
              <Badge variant="outline" className="bg-warm-gold/10 text-warm-gold border-warm-gold/20">
                {REWARD_TYPE_LABELS[referral.rewardType]}
              </Badge>
            )}
            <Badge className={STATUS_COLORS[referral.status]}>
              {STATUS_LABELS[referral.status]}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
