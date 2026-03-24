"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@/lib/monitoring").then(({ captureException }) => {
      captureException(error, { boundary: "marketing", digest: error.digest });
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E8734A]/10">
          <AlertTriangle className="h-8 w-8 text-[#E8734A]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-['DM_Serif_Display']">
            Oups, petit bug !
          </h1>
          <p className="text-muted-foreground">
            Quelque chose n&apos;a pas fonctionné comme prévu. Pas de panique,
            ça arrive même aux meilleurs darons.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E8734A] px-6 py-3 text-sm font-medium text-white hover:bg-[#E8734A]/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
