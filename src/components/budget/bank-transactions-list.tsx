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
import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Search, Sparkles, CreditCard, Wallet } from "lucide-react";
import type { BankTransaction } from "@/lib/actions/banking";
import { updateTransactionCategory, aiCategorizeUncategorized, assignTransactionToMember } from "@/lib/actions/banking";
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

  async function handleMemberChange(txId: string, memberId: string) {
    await assignTransactionToMember(txId, memberId === "none" ? null : memberId);
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
          <div className="rounded-2xl border border-dashed border-warm-blue/30 bg-warm-blue/5 p-8 text-center">
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-warm-blue/10 animate-bounce-gentle"
              aria-hidden="true"
            >
              <CreditCard className="h-7 w-7 text-warm-blue" />
            </div>
            <h3 className="text-base font-semibold">Aucune transaction synchronisée</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Connecte ta banque pour voir où passe la thune, ou note tes dépenses à la main. Zéro jugement, juste plus de clarté.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button asChild size="sm" className="animate-pulse-glow">
                <Link href="/budget#banking">Connecter ma banque</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/budget#manual">
                  <Wallet className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Saisie manuelle
                </Link>
              </Button>
            </div>
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
                  {members.length > 0 && (
                    <Select
                      value={tx.memberId ?? "none"}
                      onValueChange={(val) => handleMemberChange(tx.id, val)}
                    >
                      <SelectTrigger className="h-7 w-24 text-xs">
                        <SelectValue placeholder="Membre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs">
                          Foyer
                        </SelectItem>
                        {members.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.firstName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select
                    value={category ?? ""}
                    onValueChange={(val) => handleCategoryChange(tx.id, val)}
                  >
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue placeholder="Categorie" />
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
