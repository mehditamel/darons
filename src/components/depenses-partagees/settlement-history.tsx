import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ExpenseSettlement, ExpenseGroupMember } from "@/types/sharing";

interface SettlementHistoryProps {
  settlements: ExpenseSettlement[];
  members: ExpenseGroupMember[];
}

function getMemberName(memberId: string, members: ExpenseGroupMember[]): string {
  const member = members.find((m) => m.id === memberId);
  return member?.displayName ?? member?.externalName ?? "Inconnu";
}

export function SettlementHistory({ settlements, members }: SettlementHistoryProps) {
  if (settlements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Aucun remboursement effectue.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {settlements.map((settlement) => (
        <div
          key={settlement.id}
          className="flex items-center gap-3 rounded-lg bg-warm-green/5 border border-warm-green/20 p-3"
        >
          <CheckCircle2 className="h-4 w-4 text-warm-green shrink-0" />
          <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
            <span className="font-medium truncate">
              {getMemberName(settlement.fromMember, members)}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="font-medium truncate">
              {getMemberName(settlement.toMember, members)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-warm-green">
              {settlement.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatDate(settlement.settledAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
