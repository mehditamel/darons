"use client";

import { useState } from "react";
import { Sparkles, Loader2, Lock, HeartPulse, GraduationCap, Wallet, FileCheck, ListTodo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MonthlySummary } from "@/types/ai";

interface MonthlySummaryCardProps {
  hasAccess: boolean;
}

export function MonthlySummaryCard({ hasAccess }: MonthlySummaryCardProps) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/summary", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erreur inattendue");
        return;
      }

      setSummary(data as MonthlySummary);
    } catch {
      setError("Le résumé IA est momentanément indisponible.");
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
            <p className="text-sm font-medium">Résumé mensuel IA</p>
            <p className="text-xs text-muted-foreground">
              Passez au plan Premium pour un résumé mensuel personnalisé de votre foyer.
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
            Résumé mensuel
          </CardTitle>
          <Button onClick={handleGenerate} disabled={loading} size="sm" variant="outline">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération…
              </>
            ) : summary ? (
              "Régénérer"
            ) : (
              "Générer le résumé"
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {summary && !error && (
          <div className="space-y-4">
            <SummarySection
              icon={HeartPulse}
              label="Santé"
              content={summary.health}
              color="text-warm-teal"
            />
            <SummarySection
              icon={GraduationCap}
              label="Développement"
              content={summary.development}
              color="text-warm-purple"
            />
            <SummarySection
              icon={Wallet}
              label="Budget"
              content={summary.budget}
              color="text-warm-gold"
            />
            <SummarySection
              icon={FileCheck}
              label="Administratif"
              content={summary.admin}
              color="text-warm-blue"
            />

            {summary.priorities.length > 0 && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ListTodo className="h-4 w-4 text-warm-orange" />
                  <p className="text-sm font-medium">Priorités du mois prochain</p>
                </div>
                <ul className="space-y-1">
                  {summary.priorities.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="font-medium text-foreground">{i + 1}.</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!summary && !error && !loading && (
          <p className="text-sm text-muted-foreground">
            L&apos;IA génère un résumé complet de votre foyer : santé, développement, budget et démarches administratives.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SummarySection({
  icon: Icon,
  label,
  content,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  content: string;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-6">{content}</p>
    </div>
  );
}
