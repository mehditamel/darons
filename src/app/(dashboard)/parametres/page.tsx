import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemberList } from "@/components/famille/member-list";
import { getFamilyMembers } from "@/lib/actions/family";

export const metadata: Metadata = {
  title: "Paramètres",
};

export default async function ParametresPage() {
  const membersResult = await getFamilyMembers();
  const members = membersResult.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paramètres"
        description="Gérez votre compte, votre foyer et votre abonnement"
      />

      <div className="grid gap-6">
        {/* Family members section */}
        <Card>
          <CardHeader>
            <CardTitle>Mon foyer</CardTitle>
            <CardDescription>
              Gérez les membres de votre famille
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MemberList members={members} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mon compte</CardTitle>
            <CardDescription>
              Informations de votre compte utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Prénom</p>
                <p className="font-medium">Mehdi</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">TAMELGHAGHET</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">mehdi@tamel.fr</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rôle</p>
                <p className="font-medium">Propriétaire</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Modifier mes informations
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Abonnement</CardTitle>
                <CardDescription>Votre plan actuel et ses limites</CardDescription>
              </div>
              <Badge>Gratuit</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Membres du foyer</span>
                <span>1 adulte + 1 enfant max</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Documents</span>
                <span>5 max</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Stockage</span>
                <span>500 Mo</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Open Banking</span>
                <span className="text-muted-foreground">Non inclus</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Coach IA</span>
                <span className="text-muted-foreground">Non inclus</span>
              </li>
            </ul>
            <Button>Passer à Premium — 9,90 €/mois</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données & confidentialité</CardTitle>
            <CardDescription>
              RGPD : gérez vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" size="sm">
              Exporter mes données (JSON)
            </Button>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">
                Zone dangereuse
              </p>
              <Button variant="destructive" size="sm">
                Supprimer mon compte
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                Toutes vos données seront supprimées sous 30 jours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
