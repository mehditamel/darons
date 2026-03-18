"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createSettlement } from "@/lib/actions/shared-expenses";
import type { MemberBalance, SettlementSuggestion } from "@/types/sharing";
import { ArrowRight, Check } from "lucide-react";

interface BalanceOverviewProps {
  balances: MemberBalance[];
  suggestions: SettlementSuggestion[];
  groupId: string;
}

export function BalanceOverview({ balances, suggestions, groupId }: BalanceOverviewProps) {
  const [settling, setSettling] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSettle = async (suggestion: SettlementSuggestion, index: number) => {
    setSettling(index);
    const result = await createSettlement(groupId, {
      fromMember: suggestion.from.id,
      toMember: suggestion.to.id,
      amount: suggestion.amount,
      notes: null,
    });
    setSettling(null);

    if (result.success) {
      toast({ title: "Remboursement enregistré" });
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Member balances */}
      <div className="space-y-2">
        {balances.map((balance) => (
          <div
            key={balance.memberId}
            className="flex items-center justify-between p-2 rounded-lg"
          >
            <span className="text-sm font-medium">{balance.memberName}</span>
            <span
              className={`text-sm font-semibold ${
                balance.balance > 0.01
                  ? "text-green-600"
                  : balance.balance < -0.01
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {balance.balance > 0 ? "+" : ""}
              {balance.balance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €
            </span>
          </div>
        ))}
      </div>

      {/* Settlement suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Remboursements suggérés</p>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-warm-teal/5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">
                    {suggestion.from.displayName}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">
                    {suggestion.to.displayName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{suggestion.amount.toLocaleString("fr-FR")} €</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSettle(suggestion, index)}
                    disabled={settling === index}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Fait
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {suggestions.length === 0 && balances.length > 0 && (
        <div className="text-center py-4">
          <Check className="h-8 w-8 text-warm-teal mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Tout est équilibré !</p>
        </div>
      )}
    </div>
  );
}
