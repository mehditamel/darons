import { Phone, AlertTriangle, Heart, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EMERGENCY_NUMBERS } from "@/lib/constants";

const EXTENDED_NUMBERS = [
  ...EMERGENCY_NUMBERS,
  { name: "Prévention suicide", number: "3114", description: "Numéro national (24h/24)" },
  { name: "Pharmacie de garde", number: "3237", description: "Pour trouver la pharmacie ouverte la plus proche" },
];

const FIRST_AID_TIPS = [
  {
    title: "Fièvre chez le bébé",
    content: "Appelle le 15 si la température dépasse 40°C, si ton bébé a moins de 3 mois avec plus de 38°C, ou s'il est très abattu.",
  },
  {
    title: "Étouffement",
    content: "Bébé < 1 an : 5 tapes dans le dos entre les omoplates, bébé sur le ventre tête vers le bas. Si ça ne marche pas, appelle le 15 immédiatement.",
  },
  {
    title: "Chute de la tête",
    content: "Surveille pendant 48h : vomissements, somnolence inhabituelle, comportement anormal = urgences (15 ou 112).",
  },
  {
    title: "Ingestion produit toxique",
    content: "N'essaie PAS de faire vomir. Appelle immédiatement le centre antipoison avec le produit sous les yeux.",
  },
];

export default function NumerosUrgencePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-warm-red/10 text-warm-red flex items-center justify-center mx-auto">
          <Phone className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-serif font-bold">
          Les numéros qui sauvent
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          3h du mat, ton bébé a de la fièvre. Tu sais pas quoi faire.
          Ici, tu trouves le bon numéro en 1 seconde.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXTENDED_NUMBERS.map((entry) => (
          <a
            key={entry.number}
            href={`tel:${entry.number.replace(/\s/g, "")}`}
            className="block"
          >
            <Card className="card-playful hover:border-warm-red/40 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-warm-red/10">
                  <Phone className="w-5 h-5 text-warm-red" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{entry.name}</p>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                </div>
                <span className="text-2xl font-bold text-warm-red">{entry.number}</span>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warm-orange" />
            Quand appeler les urgences ?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIRST_AID_TIPS.map((tip) => (
            <div key={tip.title} className="border-b last:border-0 pb-3 last:pb-0">
              <p className="font-semibold text-sm">{tip.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{tip.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-warm-teal/5 border-warm-teal/20">
        <CardContent className="pt-6 text-center space-y-2">
          <Heart className="w-8 h-8 mx-auto text-warm-teal" />
          <p className="font-medium">
            Sauvegarde cette page dans tes favoris. On espère que t&apos;en auras jamais besoin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
