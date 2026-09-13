"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { appendHandoffPrompt, HANDOFF_PROMPTS } from "@/lib/trust-card/handoff";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function HandoffNotesEditor({ value, onChange, disabled }: Props) {
  const id = useId();
  const input = useRef<HTMLTextAreaElement>(null);
  const [notice, setNotice] = useState("");
  return (
    <div className="space-y-3 min-w-0">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          Les consignes du jour
        </label>
        <p id={`${id}-help`} className="text-xs text-muted-foreground mt-1">
          Repas, sommeil, réconfort, retour : ajoute les repères utiles, avec
          tes propres mots. Les boutons insèrent une question à compléter.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {HANDOFF_PROMPTS.map((prompt) => (
          <Button
            key={prompt.label}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => {
              const next = appendHandoffPrompt(value, prompt.text);
              if (next === null) {
                setNotice(
                  "La limite est de 1 000 caractères. Raccourcis les consignes avant d’ajouter un repère.",
                );
                return;
              }
              onChange(next);
              setNotice("");
              requestAnimationFrame(() => {
                input.current?.focus();
                input.current?.setSelectionRange(next.length, next.length);
              });
            }}
          >
            + {prompt.label}
          </Button>
        ))}
      </div>
      <textarea
        id={id}
        ref={input}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setNotice("");
        }}
        disabled={disabled}
        maxLength={1000}
        rows={5}
        aria-describedby={`${id}-help ${id}-count`}
        className="w-full min-w-0 rounded-xl border border-input bg-background px-3 py-3 text-sm leading-relaxed"
        placeholder="Les petites choses que tu voudrais dire avant de partir…"
      />
      <p id={`${id}-count`} className="text-xs text-muted-foreground">
        {value.length} / 1 000 caractères · partagés uniquement si « Notes &
        routines » est coché.
      </p>
      {notice && (
        <p role="alert" className="text-sm text-destructive">
          {notice}
        </p>
      )}
    </div>
  );
}
