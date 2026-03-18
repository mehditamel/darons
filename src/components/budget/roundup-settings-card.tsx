"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateRoundupSettings } from "@/lib/actions/roundup";
import type { RoundupSettings } from "@/types/sharing";
import type { SavingsGoal } from "@/types/budget";
import { Coins, PiggyBank } from "lucide-react";

interface RoundupSettingsCardProps {
  settings: RoundupSettings;
  goals: SavingsGoal[];
}

export function RoundupSettingsCard({ settings, goals }: RoundupSettingsCardProps) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(settings.enabled);
  const [roundupTo, setRoundupTo] = useState(settings.roundupTo);
  const [monthlyCap, setMonthlyCap] = useState(settings.monthlyCap);
  const [targetGoalId, setTargetGoalId] = useState<string | null>(settings.targetGoalId);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    const result = await updateRoundupSettings({
      enabled,
      roundupTo,
      monthlyCap,
      targetGoalId,
    });
    setLoading(false);

    if (result.success) {
      toast({ title: "Paramètres sauvegardés" });
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  };

  // Simulate a roundup
  const exampleAmount = 7.35;
  const roundedUp = Math.ceil(exampleAmount / roundupTo) * roundupTo;
  const exampleRoundup = Math.round((roundedUp - exampleAmount) * 100) / 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-warm-gold" />
          <div>
            <CardTitle>Arrondi épargne automatique</CardTitle>
            <CardDescription>
              Épargnez automatiquement la différence arrondie de chaque dépense
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Activer l&apos;arrondi automatique</Label>
            <p className="text-xs text-muted-foreground">
              Chaque dépense sera arrondie à l&apos;euro supérieur
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            {/* Roundup amount */}
            <div className="space-y-2">
              <Label>Arrondir à</Label>
              <Select
                value={String(roundupTo)}
                onValueChange={(v) => setRoundupTo(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0,50 €</SelectItem>
                  <SelectItem value="1">1,00 €</SelectItem>
                  <SelectItem value="2">2,00 €</SelectItem>
                  <SelectItem value="5">5,00 €</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Ex: une dépense de {exampleAmount.toLocaleString("fr-FR")} € → arrondi à{" "}
                {roundedUp.toLocaleString("fr-FR")} € → {exampleRoundup.toLocaleString("fr-FR")} € épargnés
              </p>
            </div>

            {/* Monthly cap */}
            <div className="space-y-2">
              <Label htmlFor="monthlyCap">Plafond mensuel (€)</Label>
              <Input
                id="monthlyCap"
                type="number"
                value={monthlyCap}
                onChange={(e) => setMonthlyCap(Number(e.target.value))}
                min={1}
                max={500}
              />
            </div>

            {/* Target goal */}
            {goals.length > 0 && (
              <div className="space-y-2">
                <Label>Objectif d&apos;épargne cible</Label>
                <Select
                  value={targetGoalId ?? "none"}
                  onValueChange={(v) => setTargetGoalId(v === "none" ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun objectif lié</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name} ({Number(goal.currentAmount).toLocaleString("fr-FR")} / {Number(goal.targetAmount).toLocaleString("fr-FR")} €)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Current stats */}
            <div className="rounded-lg bg-warm-gold/5 p-4 flex items-center gap-3">
              <PiggyBank className="h-8 w-8 text-warm-gold" />
              <div>
                <p className="font-semibold">
                  {settings.totalRounded.toLocaleString("fr-FR")} € épargnés
                </p>
                <p className="text-xs text-muted-foreground">
                  Total depuis l&apos;activation
                </p>
              </div>
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
        </Button>
      </CardContent>
    </Card>
  );
}
