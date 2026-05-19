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
import {
  TRUST_CARD_SECTIONS,
  type TrustCardSection,
} from "@/types/trust-card";
import { Shield, Loader2 } from "lucide-react";
import { TrustCardCreatedDialog } from "./trust-card-created-dialog";

const SECTION_LABELS: Record<TrustCardSection, { label: string; description: string }> = {
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
}

export function TrustCardForm({ members }: TrustCardFormProps) {
  const [loading, setLoading] = useState(false);
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
      sections: ["allergies", "vaccinations", "emergency", "practitioners", "routines"],
      notes: "",
    },
  });

  const sections = form.watch("sections");

  function toggleSection(s: TrustCardSection) {
    const current = form.getValues("sections");
    if (current.includes(s)) {
      form.setValue(
        "sections",
        current.filter((x) => x !== s),
        { shouldValidate: true }
      );
    } else {
      form.setValue("sections", [...current, s], { shouldValidate: true });
    }
  }

  async function onSubmit(data: CreateTrustCardData) {
    setLoading(true);
    const result = await createTrustCard(data);
    setLoading(false);

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
        sections: ["allergies", "vaccinations", "emergency", "practitioners", "routines"],
        notes: "",
      });
    } else {
      toast({
        title: "Aïe",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  if (members.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ajoute d'abord un enfant à ton foyer pour créer un carnet.
      </p>
    );
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="memberId">Pour quel enfant ?</Label>
          <Controller
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
          <Label htmlFor="label">Petit nom du carnet</Label>
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

        <div className="space-y-2">
          <Label htmlFor="notes">Notes libres pour la personne</Label>
          <textarea
            id="notes"
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Sieste vers 13h, doudou indispensable, biberon de 180ml au goûter…"
            {...form.register("notes")}
          />
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
