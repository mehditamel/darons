"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Check,
  RefreshCw,
  ShieldOff,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { revokeTrustCard, regeneratePin } from "@/lib/actions/trust-card";
import { getTrustCardStatus, type TrustCardWithMember } from "@/types/trust-card";

interface Props {
  card: TrustCardWithMember;
  shareUrl: string;
  qrDataUrl: string;
}

export function TrustCardDetail({ card, shareUrl, qrDataUrl }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [newPin, setNewPin] = useState<string | null>(null);

  const status = getTrustCardStatus(card);
  const isActive = status === "active";

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copie impossible", variant: "destructive" });
    }
  }

  async function handleRevoke() {
    setRevoking(true);
    const result = await revokeTrustCard(card.id);
    setRevoking(false);
    if (result.success) {
      toast({ title: "Carnet révoqué", description: "Le lien ne fonctionne plus." });
      router.refresh();
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  }

  async function handleRegeneratePin() {
    setRegenerating(true);
    const result = await regeneratePin(card.id);
    setRegenerating(false);
    if (result.success && result.data) {
      setNewPin(result.data.pin);
      toast({ title: "Nouveau PIN généré", description: "Note-le bien." });
    } else {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">QR Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {isActive ? (
            <Image
              src={qrDataUrl}
              alt="QR code du carnet"
              width={240}
              height={240}
              className="rounded-lg bg-white p-3"
              unoptimized
            />
          ) : (
            <div className="aspect-square w-full max-w-[240px] bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
              {status === "revoked" ? "Carnet révoqué" : "Carnet expiré"}
            </div>
          )}
          <p className="text-xs text-center text-muted-foreground">
            Montre ce QR à la personne pour qu'elle scanne avec son téléphone.
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>{card.label ?? "Carnet sans nom"}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Pour {card.memberFirstName} {card.memberLastName}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                isActive
                  ? "bg-warm-green/15 text-warm-green border-warm-green/30"
                  : status === "revoked"
                  ? "bg-warm-red/15 text-warm-red border-warm-red/30"
                  : "bg-muted text-muted-foreground"
              }
            >
              {isActive
                ? "Actif"
                : status === "revoked"
                ? "Révoqué"
                : "Expiré"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="text-xs font-medium uppercase text-muted-foreground mb-1">
              Lien
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-3 py-2 rounded truncate">
                {shareUrl}
              </code>
              <Button size="icon" variant="outline" onClick={copyUrl} disabled={!isActive} aria-label="Copier le lien">
                {copied ? <Check className="h-4 w-4 text-warm-green" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {newPin && (
            <div>
              <div className="text-xs font-medium uppercase text-muted-foreground mb-1">
                Nouveau PIN
              </div>
              <code className="block text-2xl font-mono tracking-[0.5em] text-center bg-warm-teal/10 text-warm-teal px-3 py-3 rounded font-semibold">
                {newPin}
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Note-le maintenant, il ne sera plus affiché.
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> Expire
              </div>
              <div className="font-medium">
                {format(new Date(card.expiresAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                {isActive && (
                  <span className="text-muted-foreground ml-1 font-normal">
                    ({formatDistanceToNow(new Date(card.expiresAt), { locale: fr })})
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground inline-flex items-center gap-1">
                <Eye className="h-3 w-3" /> Consultations
              </div>
              <div className="font-medium">
                {card.accessCount}
                {card.lastAccessedAt && (
                  <span className="text-muted-foreground ml-1 font-normal">
                    · dernier {formatDistanceToNow(new Date(card.lastAccessedAt), { addSuffix: true, locale: fr })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium uppercase text-muted-foreground mb-2">
              Sections partagées
            </div>
            <div className="flex flex-wrap gap-1.5">
              {card.sections.map((s) => (
                <Badge key={s} variant="secondary" className="capitalize">
                  {s === "emergency" ? "urgences" : s === "practitioners" ? "médecins" : s}
                </Badge>
              ))}
            </div>
          </div>

          {card.notes && (
            <div>
              <div className="text-xs font-medium uppercase text-muted-foreground mb-1">
                Notes
              </div>
              <p className="text-sm whitespace-pre-wrap bg-muted/40 p-3 rounded">{card.notes}</p>
            </div>
          )}

          {isActive && (
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" onClick={handleRegeneratePin} disabled={regenerating}>
                {regenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Régénérer le PIN
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="ml-auto">
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Révoquer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Révoquer ce carnet ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Le lien cessera immédiatement de fonctionner. Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevoke} disabled={revoking}>
                      {revoking ? "Révocation…" : "Révoquer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
