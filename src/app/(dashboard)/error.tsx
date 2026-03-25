"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@/lib/monitoring").then(({ captureException }) => {
      captureException(error, { boundary: "dashboard", digest: error.digest });
    });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Oups, quelque chose s'est mal passé
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Une erreur inattendue est survenue. Veuillez réessayer ou
              contacter le support si le problème persiste.
            </p>
          </div>
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              Référence : {error.digest}
            </p>
          )}
          {process.env.NODE_ENV === "development" && error.message && (
            <pre className="mt-4 text-xs text-left bg-muted p-3 rounded overflow-auto max-h-40">
              {error.message}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
