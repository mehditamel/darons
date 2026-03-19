"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface MESConsentDialogProps {
  childName: string;
  memberId: string;
  onConfirm: (memberId: string) => void;
  trigger?: React.ReactNode;
}

export function MESConsentDialog({
  childName,
  memberId,
  onConfirm,
  trigger,
}: MESConsentDialogProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="default" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Connecter Mon Espace Santé
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Connexion à Mon Espace Santé
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Vous êtes sur le point de connecter le profil santé de{" "}
                <strong className="text-foreground">{childName}</strong> à Mon Espace Santé
                pour synchroniser les données de santé.
              </p>

              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <p className="font-medium text-foreground">
                  Données synchronisées :
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vaccinations administrées</li>
                  <li>Mesures de croissance (poids, taille, périmètre crânien)</li>
                  <li>Allergies et intolérances</li>
                  <li>Documents médicaux (ordonnances, comptes-rendus)</li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Protection des données
                </p>
                <p className="mt-1 text-amber-800 dark:text-amber-200">
                  Vos données de santé sont chiffrées et hébergées conformément aux
                  exigences HDS. Vous pouvez révoquer cet accès à tout moment
                  depuis les paramètres.
                </p>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300"
                />
                <span>
                  J&apos;accepte la synchronisation des données de santé de {childName} avec
                  Mon Espace Santé et je confirme être le représentant légal.
                </span>
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setAccepted(false)}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!accepted}
            onClick={() => onConfirm(memberId)}
          >
            Accepter et connecter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
