"use client";

import { useState } from "react";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AiCoachResponse } from "@/types/ai";

interface AiCoachCardProps {
  hasAccess: boolean;
}

export function AiCoachCard({ hasAccess }: AiCoachCardProps) {
  const [response, setResponse] = useState<AiCoachResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/coach", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur inattendue");
        return;
      }

      setResponse(data as AiCoachResponse);
    } catch {
      setError("Le coach IA est momentanément indisponible.");
    } finally {
      setLoading(false);
    }
  }

  if (!hasAccess) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 p-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Coach budgétaire IA</p>
            <p className="text-xs text-muted-foreground">
              Passez au plan Premium pour bénéficier de conseils personnalisés par l&apos;IA.
            </p>
          </div>
          <Badge variant="outline">Premium</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-warm-gold" />
            Coach budgétaire IA
          </CardTitle>
          <Button onClick={handleAsk} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyse en cours…
              </>
            ) : response ? (
              "Relancer l'analyse"
            ) : (
              "Demander conseil"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {response && !error && (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{response.message}</p>

            {response.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggestions :</p>
                {response.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-muted/50 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{s.title}</p>
                      {s.estimatedSaving && (
                        <Badge variant="outline" className="text-warm-green">
                          {s.estimatedSaving}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!response && !error && !loading && (
          <p className="text-sm text-muted-foreground">
            Le coach IA analyse vos dépenses et vous propose des conseils personnalisés pour optimiser votre budget familial.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
