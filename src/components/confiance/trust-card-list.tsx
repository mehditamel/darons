"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, ShieldCheck, ShieldOff } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getTrustCardStatus, type TrustCardWithMember } from "@/types/trust-card";

interface Props {
  cards: TrustCardWithMember[];
}

const STATUS_META = {
  active: { label: "Actif", className: "bg-warm-green/15 text-warm-green border-warm-green/30" },
  expired: { label: "Expiré", className: "bg-muted text-muted-foreground border-border" },
  revoked: { label: "Révoqué", className: "bg-warm-red/15 text-warm-red border-warm-red/30" },
  locked: { label: "Bloqué", className: "bg-warm-orange/15 text-warm-orange border-warm-orange/30" },
};

export function TrustCardList({ cards }: Props) {
  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-warm-teal" />
          <p className="font-medium">Aucun carnet créé pour l'instant</p>
          <p className="text-sm mt-1">
            Crée ton premier carnet ci-dessous pour confier ton enfant en toute sécurité.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const status = getTrustCardStatus(card);
        const meta = STATUS_META[status];
        const expiresIn = formatDistanceToNow(new Date(card.expiresAt), {
          addSuffix: true,
          locale: fr,
        });

        return (
          <Card key={card.id} className="hover:border-warm-teal/40 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-warm-teal/10 flex items-center justify-center shrink-0">
                {status === "revoked" ? (
                  <ShieldOff className="h-5 w-5 text-warm-red" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-warm-teal" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{card.label ?? "Carnet sans nom"}</span>
                  <Badge variant="outline" className={meta.className}>
                    {meta.label}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Pour {card.memberFirstName} · {card.sections.length} section
                  {card.sections.length > 1 ? "s" : ""} ·{" "}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {status === "active"
                      ? `expire ${expiresIn}`
                      : `créé le ${format(new Date(card.createdAt), "d MMM yyyy", { locale: fr })}`}
                  </span>
                </div>
                {card.accessCount > 0 && (
                  <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Consulté {card.accessCount} fois
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link href={`/confiance/${card.id}`}>Détails</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
