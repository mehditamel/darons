import { Badge } from "@/components/ui/badge";
import type { SharedExpense } from "@/types/sharing";
import { formatDate } from "@/lib/utils";

interface ExpenseListProps {
  expenses: SharedExpense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Aucune dépense pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between p-3 rounded-lg border"
        >
          <div>
            <p className="text-sm font-medium">{expense.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Payé par {expense.paidByName ?? "Inconnu"}
              </span>
              <span className="text-xs text-muted-foreground">
                le {formatDate(expense.expenseDate)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{expense.amount.toLocaleString("fr-FR")} €</p>
            {expense.category && (
              <Badge variant="secondary" className="text-xs">
                {expense.category}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
