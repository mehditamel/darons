"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Baby,
  Users,
  LayoutGrid,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  Wallet,
  FileText,
  Calculator,
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
import { createHousehold, createFamilyMember } from "@/lib/actions/family";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { label: "Ton foyer", icon: Home },
  { label: "Ton enfant", icon: Baby },
  { label: "Co-daron(ne)", icon: Users },
  { label: "Tes priorités", icon: LayoutGrid },
  { label: "C'est parti !", icon: CheckCircle2 },
];

const MODULE_OPTIONS = [
  {
    id: "sante",
    label: "Vaccins & santé",
    description: "Carnet vaccinal, courbes de croissance, RDV pédiatre",
    icon: HeartPulse,
    color: "text-warm-teal",
    href: "/sante",
  },
  {
    id: "budget",
    label: "Budget du foyer",
    description: "Dépenses, allocations CAF, reste à charge",
    icon: Wallet,
    color: "text-warm-blue",
    href: "/budget",
  },
  {
    id: "papiers",
    label: "Papiers qui traînent",
    description: "Documents d'identité, coffre-fort numérique, alertes expiration",
    icon: FileText,
    color: "text-warm-orange",
    href: "/identite",
  },
  {
    id: "impots",
    label: "Impôts",
    description: "Simulation IR, crédits d'impôt, optimisation fiscale",
    icon: Calculator,
    color: "text-warm-gold",
    href: "/fiscal",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [childName, setChildName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

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
    householdForm.handleSubmit((data) => {
      startTransition(async () => {
        const result = await createHousehold(data);
        if (result.success) {
          setStep(1);
        } else {
          toast({
            title: "Erreur",
            description: result.error ?? "Impossible de créer le foyer",
            variant: "destructive",
          });
        }
      });
    })();
  }

  function handleMemberSubmit() {
    memberForm.handleSubmit((data) => {
      startTransition(async () => {
        const result = await createFamilyMember(data);
        if (result.success) {
          setChildName(data.firstName);
          setStep(2);
        } else {
          toast({
            title: "Erreur",
            description: result.error ?? "Impossible d'ajouter l'enfant",
            variant: "destructive",
          });
        }
      });
    })();
  }

  function handlePartnerStep() {
    // Partner invite is optional — just advance
    setStep(3);
  }

  function handleModulesSubmit() {
    setStep(4);
  }

  function toggleModule(id: string) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Get the first selected module's href for quick win redirect
  const firstSelectedModule = MODULE_OPTIONS.find((m) => selectedModules.has(m.id));
  const quickWinHref = firstSelectedModule?.href ?? "/dashboard";

  // Compute child age message
  function getChildMessage(): string {
    const name = childName || "ton enfant";
    return `${name} est entre de bonnes mains. On va bien s'occuper de tout.`;
  }

  return (
    <div className="mx-auto max-w-lg py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-serif font-bold">
          Bienvenue sur Darons
        </h1>
        <p className="mt-2 text-muted-foreground">
          Configurons ton espace familial en quelques étapes
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Étape {step + 1} sur {STEPS.length}
          </span>
          <span className="text-sm font-medium">{STEPS[step].label}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step 0: Create household */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warm-orange/10">
              <Home className="h-7 w-7 text-warm-orange" />
            </div>
            <CardTitle className="text-center">Crée ton foyer</CardTitle>
            <CardDescription className="text-center">
              Donne un nom à ton espace familial
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
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Création..." : "Continuer"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Add first child */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warm-teal/10">
              <Baby className="h-7 w-7 text-warm-teal" />
            </div>
            <CardTitle className="text-center">
              Ajoute ton enfant
            </CardTitle>
            <CardDescription className="text-center">
              Commence par ajouter un enfant pour personnaliser ton
              expérience
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
                  <Label htmlFor="firstName">Prénom</Label>
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
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Garçon</SelectItem>
                    <SelectItem value="F">Fille</SelectItem>
                  </SelectContent>
                </Select>
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
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? "Ajout..." : "Continuer"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Invite partner (optional) */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warm-purple/10">
              <Users className="h-7 w-7 text-warm-purple" />
            </div>
            <CardTitle className="text-center">
              Invite ton/ta co-daron(ne)
            </CardTitle>
            <CardDescription className="text-center">
              {getChildMessage()}<br />
              Tu veux inviter l&apos;autre parent à rejoindre le foyer ?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="partnerEmail">Email du co-parent (optionnel)</Label>
              <Input
                id="partnerEmail"
                type="email"
                placeholder="co-parent@email.com"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Il/elle recevra une invitation pour accéder au foyer partagé.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button className="flex-1" onClick={handlePartnerStep}>
                {partnerEmail ? "Inviter et continuer" : "Passer cette étape"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Module picker */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warm-blue/10">
              <LayoutGrid className="h-7 w-7 text-warm-blue" />
            </div>
            <CardTitle className="text-center">
              C&apos;est quoi ton plus gros bordel en ce moment ?
            </CardTitle>
            <CardDescription className="text-center">
              Sélectionne ce qui t&apos;intéresse le plus. On activera ces modules en priorité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {MODULE_OPTIONS.map((module) => {
                const isSelected = selectedModules.has(module.id);
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted hover:border-muted-foreground/30 hover:bg-muted/50"
                    }`}
                  >
                    <module.icon className={`h-6 w-6 ${module.color}`} />
                    <span className="text-sm font-medium">{module.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {module.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1"
                onClick={handleModulesSubmit}
              >
                {selectedModules.size > 0 ? "Continuer" : "Tout activer"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done + quick win */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-green/10">
              <CheckCircle2 className="h-8 w-8 text-warm-green" />
            </div>
            <CardTitle className="text-center">
              Ton espace est prêt !
            </CardTitle>
            <CardDescription className="text-center">
              {selectedModules.size > 0 ? (
                <>On a activé tes modules prioritaires. Commence par un premier quick win :</>
              ) : (
                <>Tu peux maintenant explorer tous les modules. Par quoi tu commences ?</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedModules.size > 0 ? (
              <>
                <Button
                  className="w-full"
                  onClick={() => router.push(quickWinHref)}
                >
                  {firstSelectedModule?.id === "sante" && "Enregistrer le premier vaccin"}
                  {firstSelectedModule?.id === "budget" && "Ajouter une première dépense"}
                  {firstSelectedModule?.id === "papiers" && "Scanner un premier document"}
                  {firstSelectedModule?.id === "impots" && "Lancer la simulation d'impôts"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Accéder au tableau de bord
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={() => router.push("/dashboard")}
              >
                Accéder à mon tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
