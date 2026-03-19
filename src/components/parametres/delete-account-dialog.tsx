"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  requestAccountDeletion,
  cancelAccountDeletion,
} from "@/lib/actions/rgpd";

interface DeleteAccountDialogProps {
  userEmail: string;
  isPending: boolean;
  scheduledAt: string | null;
}

export function DeleteAccountDialog({
  userEmail,
  isPending,
  scheduledAt,
}: DeleteAccountDialogProps) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmEmail === userEmail;

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const result = await requestAccountDeletion(reason || undefined);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    } else {
      window.location.reload();
    }
  }

  async function handleCancel() {
    setLoading(true);
    await cancelAccountDeletion();
    setLoading(false);
    window.location.reload();
  }

  if (isPending) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Suppression programmée
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Votre compte sera supprimé le{" "}
            {scheduledAt
              ? new Date(scheduledAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "dans 30 jours"}
            . Toutes vos données seront définitivement effacées.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Annuler la suppression
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer mon compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">
              Cette action est irréversible. Toutes vos données seront
              supprimées sous 30 jours : profil, membres du foyer, documents,
              vaccinations, budget, données fiscales.
            </span>
            <span className="block font-medium text-destructive">
              Vous avez 30 jours pour annuler cette demande.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="confirm-email">
              Saisissez votre email pour confirmer : <strong>{userEmail}</strong>
            </Label>
            <Input
              id="confirm-email"
              type="email"
              placeholder={userEmail}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Raison (optionnel)</Label>
            <Input
              id="reason"
              placeholder="Dites-nous pourquoi vous partez..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer la suppression
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
