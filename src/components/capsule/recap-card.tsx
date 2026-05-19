import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookHeart, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { CapsuleRecap } from "@/types/capsule";

interface Props {
  recap: CapsuleRecap;
}

export function RecapCard({ recap }: Props) {
  const sectionCount = recap.content?.sections?.length ?? 0;
  return (
    <Link href={`/capsule/recap/${recap.id}`} className="block">
      <Card className="hover:border-warm-purple/40 transition-colors h-full">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-warm-purple/10 flex items-center justify-center shrink-0">
            <BookHeart className="h-5 w-5 text-warm-purple" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-serif font-semibold truncate">
              {recap.title ?? recap.content?.title ?? "Récap"}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(recap.periodStart), "d MMM", { locale: fr })}
              {" → "}
              {format(new Date(recap.periodEnd), "d MMM yyyy", { locale: fr })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {sectionCount} section{sectionCount > 1 ? "s" : ""}
              </Badge>
              <span className="text-xs text-muted-foreground">
                généré le {format(new Date(recap.generatedAt), "d MMM", { locale: fr })}
              </span>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        </CardContent>
      </Card>
    </Link>
  );
}
