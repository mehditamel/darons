import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookHeart, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFamilyMembers } from "@/lib/actions/family";
import {
  listMemories,
  listRecapsForMember,
  suggestNextPeriod,
} from "@/lib/actions/capsule";
import { MemoryUpload } from "@/components/capsule/memory-upload";
import { MemoryGallery } from "@/components/capsule/memory-gallery";
import { RecapCard } from "@/components/capsule/recap-card";
import { GenerateRecapButton } from "@/components/capsule/generate-recap-button";

export const metadata: Metadata = {
  title: "Capsule de l'enfant",
};

interface PageProps {
  params: { memberId: string };
}

export default async function CapsuleMemberPage({ params }: PageProps) {
  const [membersRes, memoriesRes, recapsRes, suggestionRes] = await Promise.all([
    getFamilyMembers(),
    listMemories(params.memberId),
    listRecapsForMember(params.memberId),
    suggestNextPeriod(params.memberId),
  ]);

  const child = membersRes.data?.find(
    (m) => m.id === params.memberId && m.memberType === "child"
  );
  if (!child) notFound();

  const memories = memoriesRes.data ?? [];
  const recaps = recapsRes.data ?? [];
  const suggestion = suggestionRes.data;

  return (
    <div className="section-stack">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/capsule">
          <ArrowLeft className="h-4 w-4 mr-2" /> Toutes les Capsules
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-warm-purple/15 flex items-center justify-center">
          <BookHeart className="h-6 w-6 text-warm-purple" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold">
            La Capsule de {child.firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {memories.length} souvenir{memories.length > 1 ? "s" : ""} · {recaps.length} récap
            {recaps.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-warm-purple" /> Galerie souvenirs
                </CardTitle>
                {suggestion && (
                  <GenerateRecapButton
                    memberId={child.id}
                    periodType="quarter"
                    periodStart={suggestion.periodStart}
                    periodEnd={suggestion.periodEnd}
                    label={suggestion.label}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <MemoryGallery memories={memories} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Récaps générés</CardTitle>
            </CardHeader>
            <CardContent>
              {recaps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Aucun récap pour l'instant. Clique sur « Générer le récap » ci-dessus.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recaps.map((r) => (
                    <RecapCard key={r.id} recap={r} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ajouter un souvenir</CardTitle>
          </CardHeader>
          <CardContent>
            <MemoryUpload memberId={child.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
