"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Share2 } from "lucide-react";

interface ReferralCodeCardProps {
  code: string;
}

export function ReferralCodeCard({ code }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ title: "Code copié !" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Rejoins Darons",
        text: `Utilise mon code de parrainage ${code} pour t'inscrire sur Darons !`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Lien copié !" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ton code de parrainage</CardTitle>
        <CardDescription>
          Partage ce code avec tes proches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={code}
            readOnly
            className="font-mono text-lg font-bold text-center tracking-widest"
          />
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <Check className="h-4 w-4 text-warm-teal" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button onClick={handleShare} variant="outline" className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          Partager le lien d&apos;inscription
        </Button>
      </CardContent>
    </Card>
  );
}
