import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck, Plus, Sparkles } from "lucide-react";
import { listTrustCards } from "@/lib/actions/trust-card";
import { getFamilyMembers } from "@/lib/actions/family";
import { TrustCardForm } from "@/components/confiance/trust-card-form";
import { TrustCardList } from "@/components/confiance/trust-card-list";

export const metadata: Metadata = {
  title: "Carnet de Confiance",
  description:
    "Confie ton enfant en toute sécurité : un lien + un PIN pour donner accès aux infos essentielles à une nounou, des grands-parents ou un proche.",
};

export default async function ConfiancePage() {
  const [cardsRes, membersRes] = await Promise.all([
    listTrustCards(),
    getFamilyMembers(),
  ]);

  const cards = cardsRes.data ?? [];
  const childMembers =
    membersRes.data
      ?.filter((m) => m.memberType === "child")
      .map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
      })) ?? [];

  return (
    <div className="section-stack">
      <PageHeader
        title="Carnet de Confiance"
        description="Les consignes à l’aller. Le récit de sa journée au retour. Un relais simple, même avec un proche sans compte Darons."
        icon={<ShieldCheck className="h-5 w-5" />}
        iconColor="bg-warm-teal/15 text-warm-teal"
      />

      <Card className="border-warm-teal/20 bg-warm-teal/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-warm-teal shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium">Comment ça marche ?</p>
            <p className="text-muted-foreground">
              Prépare les consignes du jour et choisis les rubriques à
              transmettre. Partage le lien, puis le PIN séparément. Le proche
              consulte le carnet sans créer de compte et peut préparer un récap
              de la garde à te transmettre dans votre conversation habituelle.
              Tu choisis la durée d’accès et peux révoquer le carnet.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">
            Mes carnets ({cards.length})
          </h2>
          <TrustCardList cards={cards} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-warm-teal" />
              <div>
                <CardTitle>Nouveau carnet</CardTitle>
                <CardDescription>
                  Un carnet pour ce passage de relais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TrustCardForm
              members={childMembers}
              previousNotes={cards
                .filter((card) => card.notes && !card.revokedAt)
                .slice(0, 30)
                .map((card) => ({
                  id: card.id,
                  memberId: card.memberId,
                  label: card.label ?? "Carnet",
                  notes: card.notes!,
                  date: new Intl.DateTimeFormat("fr-FR").format(
                    new Date(card.createdAt),
                  ),
                }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
