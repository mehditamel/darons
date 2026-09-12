import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Syringe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { PUBLIC_INFANT_VACCINATIONS, VACCINATION_REFERENCE_URL } from "@/lib/public-vaccination";

export const metadata: Metadata = {
  title: "Vaccinations du nourrisson — Le guide 2026",
  description: "Les âges repères des vaccinations du nourrisson, dont les méningocoques B et ACWY, avec la référence officielle 2026.",
  alternates: { canonical: "https://darons.app/outils/guide-vaccins-obligatoires" },
};

export default function GuideVaccinsObligatoiresPage() {
  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ label: "Outils", href: "/outils" }, { label: "Vaccinations du nourrisson" }]} />
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold sm:text-4xl">Vaccinations du nourrisson : les repères 2026</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">Les âges ci-dessous décrivent le schéma habituel du nourrisson. Plusieurs protections peuvent être réunies dans une même injection.</p>
      </div>
      <Card><CardContent className="pt-6 space-y-3 text-sm">
        <p><strong>Le calendrier a évolué :</strong> la vaccination contre les méningocoques ACWY a remplacé celle contre le méningocoque C chez le nourrisson. La vaccination contre le méningocoque B fait aussi partie des obligations actuelles.</p>
        <p>Pour les enfants nés depuis janvier 2023, un rattrapage peut être nécessaire selon les vaccinations déjà réalisées. Fais vérifier le carnet par un professionnel de santé.</p>
        <p>Source : <a href={VACCINATION_REFERENCE_URL} className="text-primary underline">Santé publique France — nourrissons et enfants</a>. Référence 2026, vérifiée le 12 septembre 2026.</p>
      </CardContent></Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {PUBLIC_INFANT_VACCINATIONS.map((vaccine) => (
          <Card key={vaccine.code}>
            <CardHeader><CardTitle className="flex items-start gap-2 text-lg"><Syringe className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />{vaccine.name}</CardTitle></CardHeader>
            <CardContent><ul className="space-y-2 text-sm">{vaccine.doses.map((dose) => <li key={dose.doseNumber}><span className="font-medium">{dose.label}</span> — dose {dose.doseNumber}</li>)}</ul></CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Ce guide ne remplace pas un calendrier individuel. Les rappels après la petite enfance, la prématurité, les situations particulières et les retards nécessitent une adaptation. Apporte le carnet de vaccination à la consultation.</p>
      <Button asChild><Link href="/outils/calendrier-vaccinal">Voir les dates indicatives <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
    </div>
  );
}
