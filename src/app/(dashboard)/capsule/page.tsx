import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { BookHeart, ArrowRight, Baby } from "lucide-react";
import { getFamilyMembers } from "@/lib/actions/family";
import { differenceInMonths, differenceInYears } from "date-fns";

export const metadata: Metadata = {
  title: "La Capsule",
  description:
    "La biographie vivante de tes enfants : photos, jalons, récaps IA. Tu construis aujourd'hui ce qu'ils découvriront à 18 ans.",
};

function formatAge(birthDate: string): string {
  const now = new Date();
  const birth = new Date(birthDate);
  const years = differenceInYears(now, birth);
  const months = differenceInMonths(now, birth) % 12;
  if (years === 0) return `${differenceInMonths(now, birth)} mois`;
  if (years < 3) return `${years} an${years > 1 ? "s" : ""} ${months}m`;
  return `${years} ans`;
}

export default async function CapsulePage() {
  const result = await getFamilyMembers();
  const children = result.data?.filter((m) => m.memberType === "child") ?? [];

  return (
    <div className="section-stack">
      <PageHeader
        title="La Capsule"
        description="La biographie vivante de tes enfants. Tu construis aujourd'hui ce qu'ils découvriront plus tard."
        icon={<BookHeart className="h-5 w-5" />}
        iconColor="bg-warm-purple/15 text-warm-purple"
      />

      <Card className="border-warm-purple/20 bg-warm-purple/5">
        <CardContent className="p-4 text-sm">
          <p className="font-medium mb-1">💡 Comment ça marche</p>
          <p className="text-muted-foreground">
            Ajoute des photos et des notes au fil du temps. À la fin de chaque trimestre, l'IA assemble tout
            ce que tu as déjà saisi dans Darons (jalons, journal, vaccins, mesures, souvenirs) en un récap
            beau, à lire et à partager. À 18 ans, ton enfant aura sa propre Capsule.
          </p>
        </CardContent>
      </Card>

      {children.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Baby className="h-10 w-10 mx-auto mb-3 text-warm-purple" />
            <p className="font-medium">Aucun enfant dans ton foyer</p>
            <p className="text-sm mt-1">
              Ajoute un enfant pour commencer à construire sa Capsule.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Link key={child.id} href={`/capsule/${child.id}`} className="block">
              <Card className="hover:border-warm-purple/40 transition-all hover:shadow-md h-full">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-warm-purple/15 flex items-center justify-center shrink-0">
                    <Baby className="h-7 w-7 text-warm-purple" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-lg font-semibold truncate">
                      {child.firstName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatAge(child.birthDate)} · Ouvrir sa Capsule
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-warm-purple shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
