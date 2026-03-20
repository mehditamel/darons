"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCafAllocation } from "@/lib/actions/budget";
import { CAF_ALLOCATION_TYPES, type CafAllocation } from "@/types/budget";
import { CafAllocationForm } from "./caf-allocation-form";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CafAllocationListProps {
  allocations: CafAllocation[];
}

export function CafAllocationList({ allocations }: CafAllocationListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editAllocation, setEditAllocation] = useState<CafAllocation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCafAllocation(deleteId);
    setDeleteId(null);
  };

  const totalMonthly = allocations
    .filter((a) => a.active)
    .reduce((sum, a) => sum + a.monthlyAmount, 0);

  const allocationLabel = (type: string): string => {
    return CAF_ALLOCATION_TYPES.find((t) => t.value === type)?.label ?? type;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Allocations CAF</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total mensuel : <span className="font-semibold text-warm-green">{formatCurrency(totalMonthly)}</span>
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          {allocations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune allocation enregistrée
            </p>
          ) : (
            <div className="space-y-2">
              {allocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {allocationLabel(allocation.allocationType)}
                      </p>
                      {allocation.active ? (
                        <Badge variant="default" className="text-xs bg-warm-green">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <XCircle className="mr-1 h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Depuis le {formatDate(allocation.startDate)}
                      {allocation.endDate && ` jusqu'au ${formatDate(allocation.endDate)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-warm-green whitespace-nowrap">
                      +{formatCurrency(allocation.monthlyAmount)}/mois
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditAllocation(allocation)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(allocation.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CafAllocationForm
        open={showForm}
        onOpenChange={setShowForm}
      />

      {editAllocation && (
        <CafAllocationForm
          open={!!editAllocation}
          onOpenChange={(open) => !open && setEditAllocation(null)}
          allocation={editAllocation}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette allocation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
