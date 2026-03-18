"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExpenseGroup } from "@/types/sharing";
import { Users, Receipt, ArrowRight } from "lucide-react";

interface ExpenseGroupListProps {
  groups: ExpenseGroup[];
}

export function ExpenseGroupList({ groups }: ExpenseGroupListProps) {
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <Link key={group.id} href={`/depenses-partagees/${group.id}`}>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-blue/10">
                <Receipt className="h-5 w-5 text-warm-blue" />
              </div>
              <div>
                <p className="font-medium">{group.name}</p>
                {group.description && (
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {group.memberCount} participant{(group.memberCount ?? 0) > 1 ? "s" : ""}
                  </span>
                  <span>
                    {(group.totalExpenses ?? 0).toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!group.isActive && (
                <Badge variant="secondary">Terminé</Badge>
              )}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
