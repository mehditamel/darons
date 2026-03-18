"use client";

import { useState } from "react";
import { Sparkles, Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActivitySuggestion } from "@/types/ai";

interface AiSuggestionsCardProps {
  childId: string;
  childName: string;
  hasAccess: boolean;
}

export function AiSuggestionsCard({ childId, childName, hasAccess }: AiSuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur inattendue");
        return;
      }

      setSuggestions((data as { suggestions: ActivitySuggestion[] }).suggestions);
    } catch {
      setError("Les suggestions IA sont momentanément indisponibles.");
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
            <p className="text-sm font-medium">Suggestions d&apos;activités IA</p>
            <p className="text-xs text-muted-foreground">
              Passez au plan Premium pour des suggestions personnalisées.
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
            <Sparkles className="h-5 w-5 text-warm-purple" />
            Suggestions pour {childName}
          </CardTitle>
          <Button onClick={handleAsk} disabled={loading} size="sm" variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recherche…
              </>
            ) : suggestions.length > 0 ? (
              "Nouvelles suggestions"
            ) : (
              "Suggérer des activités"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {suggestions.length > 0 && !error && (
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="rounded-lg border p-3 space-y-1"
              >
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.benefits}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px]">{s.ageRange}</Badge>
                  <Badge variant="outline" className="text-[10px]">{s.frequency}</Badge>
                  <Badge variant="outline" className="text-[10px]">{s.estimatedCost}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !error && !loading && (
          <p className="text-sm text-muted-foreground">
            L&apos;IA vous suggère des activités adaptées à l&apos;âge et aux centres d&apos;intérêt de {childName}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
