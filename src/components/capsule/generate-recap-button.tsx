"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateRecap } from "@/lib/actions/capsule";
import type { RecapPeriod } from "@/types/capsule";

interface Props {
  memberId: string;
  periodType: RecapPeriod;
  periodStart: string;
  periodEnd: string;
  label: string;
}

export function GenerateRecapButton({
  memberId,
  periodType,
  periodStart,
  periodEnd,
  label,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const result = await generateRecap({
      memberId,
      periodType,
      periodStart,
      periodEnd,
    });
    setLoading(false);

    if (result.success && result.data) {
      toast({ title: "Récap généré ✨", description: result.data.title ?? label });
      router.push(`/capsule/recap/${result.data.id}`);
    } else {
      toast({
        title: "Aïe",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          L'IA écrit le récap…
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Générer le récap {label}
        </>
      )}
    </Button>
  );
}
