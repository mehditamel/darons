"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Baby,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { householdSchema, type HouseholdFormData } from "@/lib/validators/family";
import { familyMemberSchema, type FamilyMemberFormData } from "@/lib/validators/family";

const STEPS = [
  { label: "Votre foyer", icon: Home },
  { label: "Votre enfant", icon: Baby },
  { label: "Termin\u00e9", icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const progress = ((step + 1) / STEPS.length) * 100;

  const householdForm = useForm<HouseholdFormData>({
    resolver: zodResolver(householdSchema),
    defaultValues: { name: "" },
  });

  const memberForm = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      memberType: "child",
    },
  });

  function handleHouseholdSubmit() {
    householdForm.handleSubmit(() => {
      setStep(1);
    })();
  }

  function handleMemberSubmit() {
    memberForm.handleSubmit(() => {
      setStep(2);
    })();
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-serif font-bold">
          Bienvenue sur Ma Vie Parentale
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configurons votre espace familial en quelques \u00e9tapes
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            \u00c9tape {step + 1} sur {STEPS.length}
          </span>
          <span className="text-sm font-medium">{STEPS[step].label}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warm-orange/10">
              <Home className="h-7 w-7 text-warm-orange" />
            </div>
            <CardTitle className="text-center">Cr\u00e9ez votre foyer</CardTitle>
            <CardDescription className="text-center">
              Donnez un nom \u00e0 votre espace familial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleHouseholdSubmit();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="householdName">Nom du foyer</Label>
                <Input
                  id="householdName"
                  placeholder="Ex: Famille Dupont"
                  {...householdForm.register("name")}
                />
                {householdForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {householdForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warm-teal/10">
              <Baby className="h-7 w-7 text-warm-teal" />
            </div>
            <CardTitle className="text-center">
              Ajoutez votre enfant
            </CardTitle>
            <CardDescription className="text-center">
              Commencez par ajouter un enfant pour personnaliser votre
              exp\u00e9rience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleMemberSubmit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Pr\u00e9nom</Label>
                  <Input
                    id="firstName"
                    placeholder="Matis"
                    {...memberForm.register("firstName")}
                  />
                  {memberForm.formState.errors.firstName && (
                    <p className="text-xs text-destructive">
                      {memberForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Dupont"
                    {...memberForm.register("lastName")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...memberForm.register("birthDate")}
                />
                {memberForm.formState.errors.birthDate && (
                  <p className="text-xs text-destructive">
                    {memberForm.formState.errors.birthDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Genre</Label>
                <Select
                  onValueChange={(value) =>
                    memberForm.setValue("gender", value as "M" | "F")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="S\u00e9lectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Gar\u00e7on</SelectItem>
                    <SelectItem value="F">Fille</SelectItem>
                  </SelectContent>
                </Select>
                {memberForm.formState.errors.gender && (
                  <p className="text-xs text-destructive">
                    {memberForm.formState.errors.gender.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                <Button type="submit" className="flex-1">
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-green/10">
              <CheckCircle2 className="h-8 w-8 text-warm-green" />
            </div>
            <CardTitle className="text-center">
              Votre cockpit est pr\u00eat !
            </CardTitle>
            <CardDescription className="text-center">
              Vous pouvez maintenant commencer \u00e0 utiliser Ma Vie Parentale.
              Ajoutez des vaccins, des documents, ou explorez votre tableau de
              bord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Acc\u00e9der \u00e0 mon tableau de bord
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
