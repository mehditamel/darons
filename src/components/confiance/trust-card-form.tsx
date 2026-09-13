"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createTrustCard } from "@/lib/actions/trust-card";
import {
  createTrustCardSchema,
  type CreateTrustCardData,
  TRUST_CARD_DURATIONS,
} from "@/lib/validators/trust-card";
import { TRUST_CARD_SECTIONS, type TrustCardSection } from "@/types/trust-card";
import { Shield, Loader2 } from "lucide-react";
import { TrustCardCreatedDialog } from "./trust-card-created-dialog";
import Link from "next/link";
import { HandoffNotesEditor } from "./handoff-notes-editor";

interface PreviousNotes {
  id: string;
  memberId: string;
  label: string;
  notes: string;
  date: string;
}

const SECTION_LABELS: Record<
  TrustCardSection,
  { label: string; description: string }
> = {
  allergies: {
    label: "Allergies",
    description: "Allergènes, sévérité et réactions",
  },
  vaccinations: {
    label: "Vaccinations",
    description: "Vaccins effectués et prochains rappels",
  },
  emergency: {
    label: "Numéros d'urgence",
    description: "15, 112, 114, antipoison, SOS Médecins",
  },
  practitioners: {
    label: "Médecins",
    description: "Pédiatre et spécialistes connus",
  },
  routines: {
    label: "Notes & routines",
    description: "Tes notes libres ci-dessous (sieste, doudou…)",
  },
  identite: {
    label: "Identité",
    description: "Nom, prénom, date de naissance",
  },
};

interface TrustCardFormProps {
  members: Array<{ id: string; firstName: string; lastName: string }>;
  previousNotes?: PreviousNotes[];
}

export function TrustCardForm({
  members,
  previousNotes = [],
}: TrustCardFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [undoNotes, setUndoNotes] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    pin: string;
    shareUrl: string;
    label: string | null;
  } | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateTrustCardData>({
    resolver: zodResolver(createTrustCardSchema),
    defaultValues: {
      memberId: members[0]?.id ?? "",
      label: "",
      durationHours: 24,
      sections: ["emergency", "routines"],
      notes: "",
    },
  });

  const sections = form.watch("sections");
  const memberId = form.watch("memberId");
  const notes = form.watch("notes") ?? "";
  const availableNotes = previousNotes.filter(
    (card) => card.memberId === memberId,
  );

  function toggleSection(s: TrustCardSection) {
    const current = form.getValues("sections");
    if (current.includes(s)) {
      form.setValue(
        "sections",
        current.filter((x) => x !== s),
        { shouldValidate: true },
      );
    } else {
      form.setValue("sections", [...current, s], { shouldValidate: true });
    }
  }

  async function onSubmit(data: CreateTrustCardData) {
    setLoading(true);
    try {
      const result = await createTrustCard({
        ...data,
        notes: data.sections.includes("routines") ? data.notes : undefined,
      });
      if (result.success && result.data) {
        setCreated({
          pin: result.data.pin,
          shareUrl: result.data.shareUrl,
          label: result.data.card.label,
        });
        form.reset({
          memberId: members[0]?.id ?? "",
          label: "",
          durationHours: 24,
          sections: ["emergency", "routines"],
          notes: "",
        });
        setSelectedNotes("");
        setUndoNotes(null);
      } else {
        toast({
          title: "Aïe",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Le carnet n’a pas pu être confirmé",
        description:
          "Tes consignes sont conservées dans ce formulaire. Vérifie la liste des carnets avant de réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ajoute d'abord un enfant à ton foyer pour créer un carnet.{" "}
        <Link href="/identite" className="underline underline-offset-4">
          Ajouter mon enfant
        </Link>
      </p>
    );
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="memberId">Pour quel enfant ?</Label>
          <p className="text-xs text-muted-foreground">
            Changer d’enfant efface les consignes en cours pour éviter de les
            mélanger.
          </p>
          <Controller
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("notes", "");
                  setSelectedNotes("");
                  setUndoNotes(null);
                }}
              >
                <SelectTrigger id="memberId">
                  <SelectValue placeholder="Choisis un enfant" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.firstName} {m.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Petit nom du carnet (facultatif)</Label>
          <Input
            id="label"
            placeholder="Pour Mamie ce week-end"
            {...form.register("label")}
          />
          {form.formState.errors.label && (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.label.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationHours">Durée d'accès</Label>
          <Controller
            control={form.control}
            name="durationHours"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger id="durationHours">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRUST_CARD_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Sections partagées</Label>
          <p className="text-xs text-muted-foreground">
            Le prénom et la date de naissance sont toujours visibles. Ajoute les
            rubriques utiles à cette personne ; les informations de santé
            restent décochées au départ.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TRUST_CARD_SECTIONS.map((s) => {
              const meta = SECTION_LABELS[s];
              const checked = sections.includes(s);
              return (
                <label
                  key={s}
                  className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "border-warm-teal bg-warm-teal/5"
                      : "border-border hover:border-warm-teal/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    onChange={() => toggleSection(s)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{meta.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {meta.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          {form.formState.errors.sections && (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.sections.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {availableNotes.length > 0 && (
            <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
              <label htmlFor="previous-handoff" className="text-sm font-medium">
                Repartir de mes dernières consignes
              </label>
              <select
                id="previous-handoff"
                value={selectedNotes}
                onChange={(event) => setSelectedNotes(event.target.value)}
                className="w-full min-w-0 rounded-md border border-input bg-background p-2 text-sm"
              >
                <option value="">Choisir un carnet de cet enfant</option>
                {availableNotes.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.label} · {card.date}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  !availableNotes.some((card) => card.id === selectedNotes)
                }
                onClick={() => {
                  const previous = availableNotes.find(
                    (card) => card.id === selectedNotes,
                  );
                  if (!previous) return;
                  setUndoNotes(notes);
                  form.setValue("notes", previous.notes, {
                    shouldValidate: true,
                  });
                }}
              >
                Reprendre ces consignes
              </Button>
              {undoNotes !== null && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    form.setValue("notes", undoNotes, { shouldValidate: true });
                    setUndoNotes(null);
                  }}
                >
                  Annuler la reprise des consignes
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Relis et actualise les horaires et habitudes. Seul le texte est
                repris : un nouveau lien et un nouveau PIN seront créés.
              </p>
            </div>
          )}
          <HandoffNotesEditor
            value={notes}
            onChange={(value) =>
              form.setValue("notes", value, { shouldValidate: true })
            }
          />
          {!sections.includes("routines") && notes.trim() && (
            <p className="text-sm text-muted-foreground">
              Ces consignes ne seront pas incluses. Coche « Notes & routines »
              pour les partager.
            </p>
          )}
          {form.formState.errors.notes && (
            <p className="text-sm text-destructive" role="alert">
              {form.formState.errors.notes.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Création…
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" /> Créer le carnet
            </>
          )}
        </Button>
      </form>

      {created && (
        <TrustCardCreatedDialog
          pin={created.pin}
          shareUrl={created.shareUrl}
          label={created.label}
          onClose={() => setCreated(null)}
        />
      )}
    </>
  );
}
