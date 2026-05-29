import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    membersRes.data?.filter((m) => m.memberType === "child").map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
    })) ?? [];

  return (
    <div className="section-stack">
      <PageHeader
        title="Carnet de Confiance"
        description="Confie ton enfant sereinement : un lien + un PIN, accès limité dans le temps."
        icon={<ShieldCheck className="h-5 w-5" />}
        iconColor="bg-warm-teal/15 text-warm-teal"
      />

      <Card className="border-warm-teal/20 bg-warm-teal/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-warm-teal shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium">Comment ça marche ?</p>
            <p className="text-muted-foreground">
              1. Tu crées un carnet pour ton enfant (allergies, vaccins, urgences, routines).
              2. Tu envoies le lien à la personne. 3. Tu lui donnes le PIN par un autre moyen (SMS, oral).
              4. Elle a accès aux infos pendant la durée que tu choisis. À tout moment, tu peux révoquer.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Mes carnets ({cards.length})</h2>
          <TrustCardList cards={cards} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-warm-teal" />
              <div>
                <CardTitle>Nouveau carnet</CardTitle>
                <CardDescription>Configure-le en 30 secondes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TrustCardForm members={childMembers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
