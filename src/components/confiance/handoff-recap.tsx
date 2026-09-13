"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  buildHandoffRecap,
  DISCOVER_DARONS_MESSAGE,
  RECAP_FIELDS,
  recapSchema,
  type HandoffRecapData,
} from "@/lib/trust-card/handoff";

export function HandoffRecap({ example = false }: { example?: boolean }) {
  const id = useId();
  const [ready, setReady] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [data, setData] = useState<HandoffRecapData>({
    date: "",
    meal: "",
    rest: "",
    moment: "",
    note: "",
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [discovery, setDiscovery] = useState(false);
  const preview = useRef<HTMLTextAreaElement>(null);
  const discoveryText = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setData((current) => ({ ...current, date }));
    setReady(true);
    setCanShare(typeof navigator.share === "function");
  }, []);
  const parsed = recapSchema.safeParse(data);
  const text =
    prepared && parsed.success ? buildHandoffRecap(parsed.data, example) : "";

  async function copy(value: string, recommend = false) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(
        recommend
          ? "Le message pour faire découvrir Darons est copié, sans donnée du carnet."
          : "Récapitulatif copié. Colle-le dans ta conversation avec le parent. Aucun envoi automatique.",
      );
    } catch {
      if (recommend) setDiscovery(true);
      setNotice(
        "La copie automatique n’est pas disponible. Sélectionne et copie le texte ci-dessous.",
      );
      requestAnimationFrame(() => {
        const field = recommend ? discoveryText.current : preview.current;
        field?.focus();
        field?.select();
      });
    }
  }

  return (
    <section
      className="handoff-recap rounded-2xl border border-border bg-card text-card-foreground p-4 sm:p-6 space-y-5 min-w-0"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex gap-3 items-start">
        <span className="rounded-full bg-primary/10 p-2 shrink-0">
          <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Le relais, dans les deux sens
          </p>
          <h3 id={`${id}-title`} className="text-xl font-semibold">
            Et sa journée, alors ?
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {example
              ? "Mets-toi à la place du proche : prépare un retour de garde fictif."
              : "Prépare un petit récap pour le parent. Remplis seulement ce que tu souhaites lui transmettre."}
          </p>
        </div>
      </div>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!parsed.success) {
            setError(parsed.error.issues[0].message);
            return;
          }
          setError("");
          setPrepared(true);
          setNotice("");
          requestAnimationFrame(() => preview.current?.focus());
        }}
      >
        <fieldset disabled={!ready} className="space-y-4 min-w-0">
          <legend className="sr-only">Mon retour de garde</legend>
          <label className="block text-sm font-medium" htmlFor={`${id}-date`}>
            Date de la garde
            <input
              id={`${id}-date`}
              type="date"
              min="2000-01-01"
              max="2099-12-31"
              value={data.date}
              onChange={(event) => {
                setData({ ...data, date: event.target.value });
                setPrepared(false);
                setNotice("");
                setError("");
              }}
              className="mt-1 block w-full min-w-0 rounded-lg border border-input bg-background p-2 font-normal"
            />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {RECAP_FIELDS.map((field) => (
              <div key={field.key} className="min-w-0">
                <label
                  htmlFor={`${id}-${field.key}`}
                  className="text-sm font-medium"
                >
                  {field.label}
                </label>
                <textarea
                  id={`${id}-${field.key}`}
                  value={data[field.key]}
                  maxLength={240}
                  rows={3}
                  placeholder={field.hint}
                  onChange={(event) => {
                    setData({ ...data, [field.key]: event.target.value });
                    setPrepared(false);
                    setNotice("");
                    setError("");
                  }}
                  className="mt-1 block w-full min-w-0 rounded-lg border border-input bg-background p-3 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {data[field.key].length} / 240 caractères
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Brouillon dans cette page, effacé à sa fermeture ou à son
            rechargement. Aucun enregistrement dans le compte du parent.
            Transmets-le avant de fermer.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="whitespace-normal h-auto min-h-10 py-2"
          >
            Préparer le récapitulatif
          </Button>
        </fieldset>
      </form>
      {text && (
        <div className="space-y-3 border-t pt-4">
          <label
            htmlFor={`${id}-preview`}
            className="text-sm font-semibold flex items-center gap-2"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Relis avant de transmettre
          </label>
          <textarea
            ref={preview}
            id={`${id}-preview`}
            aria-label="Récapitulatif à transmettre"
            value={text}
            readOnly
            rows={9}
            className="block w-full rounded-lg border border-input bg-background p-3 text-sm leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void copy(text)}>
              <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
              Copier le récap
            </Button>
            {canShare && (
              <Button
                type="button"
                variant="outline"
                disabled={sharing}
                className="whitespace-normal h-auto min-h-10 py-2"
                onClick={async () => {
                  setSharing(true);
                  try {
                    await navigator.share({ title: "Le relais du jour", text });
                    setNotice(
                      "Le menu de partage est fermé. Vérifie l’envoi dans l’application choisie.",
                    );
                  } catch (error) {
                    setNotice(
                      error instanceof Error && error.name === "AbortError"
                        ? "Partage annulé. Tu peux toujours copier le récapitulatif."
                        : "Le partage n’a pas abouti. Tu peux copier le récapitulatif.",
                    );
                  } finally {
                    setSharing(false);
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Choisir à qui l’envoyer
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Seul ce texte est transmis au menu de partage : aucun lien privé,
            PIN ou autre contenu du carnet n’est ajouté.
          </p>
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      )}
      <div className="border-t pt-4 space-y-3">
        <p className="text-sm font-medium">
          Un parent autour de toi aimerait ce relais ?
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            type="button"
            variant="outline"
            disabled={!ready}
            className="whitespace-normal h-auto min-h-10 py-2"
            onClick={() => void copy(DISCOVER_DARONS_MESSAGE, true)}
          >
            Faire découvrir Darons
          </Button>
          <Link
            href="/register"
            prefetch={false}
            className="text-sm underline underline-offset-4 inline-flex items-center"
          >
            Créer mon carnet gratuit{" "}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {discovery && (
          <textarea
            ref={discoveryText}
            aria-label="Message pour faire découvrir Darons"
            readOnly
            value={DISCOVER_DARONS_MESSAGE}
            rows={5}
            className="w-full rounded-lg border border-input bg-background p-3 text-sm"
          />
        )}
        <p className="text-xs text-muted-foreground">
          Le message de découverte contient uniquement une présentation de l’app
          et son lien public.
        </p>
      </div>
    </section>
  );
}
