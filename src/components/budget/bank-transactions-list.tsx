"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownLeft, ArrowUpRight, Search, Sparkles, CreditCard } from "lucide-react";
import type { BankTransaction } from "@/lib/actions/banking";
import { updateTransactionCategory, aiCategorizeUncategorized } from "@/lib/actions/banking";
import { BUDGET_CATEGORY_LABELS, type BudgetCategory } from "@/types/budget";
import type { FamilyMember } from "@/types/family";

interface BankTransactionsListProps {
  transactions: BankTransaction[];
  members: FamilyMember[];
}

export function BankTransactionsList({ transactions, members }: BankTransactionsListProps) {
  const [search, setSearch] = useState("");
  const [categorizing, setCategorizing] = useState(false);

  const filtered = transactions.filter((tx) => {
    if (!search) return true;
    return tx.description?.toLowerCase().includes(search.toLowerCase());
  });

  async function handleAiCategorize() {
    setCategorizing(true);
    await aiCategorizeUncategorized();
    setCategorizing(false);
  }

  async function handleCategoryChange(txId: string, category: string) {
    await updateTransactionCategory(txId, category);
  }

  function getEffectiveCategory(tx: BankTransaction): string | null {
    return tx.categoryUser ?? tx.aiCategory ?? tx.categoryAuto ?? null;
  }

  function getMemberName(memberId: string | null): string | null {
    if (!memberId) return null;
    const member = members.find((m) => m.id === memberId);
    return member ? member.firstName : null;
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-warm-blue" />
            Transactions bancaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Aucune transaction synchronisée. Connectez votre banque ou synchronisez vos comptes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const uncategorizedCount = transactions.filter(
    (tx) => !tx.categoryUser && !tx.aiCategory
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-warm-blue" />
              Transactions bancaires
            </CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length > 1 ? "s" : ""}
            </CardDescription>
          </div>
          {uncategorizedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAiCategorize}
              disabled={categorizing}
            >
              <Sparkles className={`mr-2 h-4 w-4 ${categorizing ? "animate-pulse" : ""}`} />
              Catégoriser par IA ({uncategorizedCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une transaction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-1">
          {filtered.slice(0, 50).map((tx) => {
            const category = getEffectiveCategory(tx);
            const memberName = getMemberName(tx.memberId);
            const isExpense = tx.amount < 0;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isExpense ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    }`}
                  >
                    {isExpense ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {tx.description || "Transaction"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(tx.transactionDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {memberName && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {memberName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Select
                    value={category ?? ""}
                    onValueChange={(val) => handleCategoryChange(tx.id, val)}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BUDGET_CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      isExpense ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isExpense ? "" : "+"}
                    {Math.abs(tx.amount).toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length > 50 && (
          <p className="text-center text-xs text-muted-foreground">
            Affichage des 50 premières transactions sur {filtered.length}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
