"use client";

import { useRef, useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DAYS,
  TOPICS,
  blankProfile,
  exampleProfile,
  profileSchema,
  type WorkDay,
  type WorkProfile,
} from "@/lib/return-to-work/plan";

export function RepriseForm({
  initial,
  initialExample = false,
  ready,
  onCreate,
  onCancel,
}: {
  initial?: WorkProfile;
  initialExample?: boolean;
  ready: boolean;
  onCreate: (profile: WorkProfile, fromExample: boolean) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<WorkProfile>(
    () => initial ?? blankProfile(),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isExample, setIsExample] = useState(initialExample);
  const [copiedDays, setCopiedDays] = useState<WorkDay[] | null>(null);
  const [copyNotice, setCopyNotice] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  function updateDay(index: number, patch: Partial<WorkDay>) {
    setCopiedDays(null);
    setCopyNotice("");
    setDraft((current) => ({
      ...current,
      days: current.days.map((row) =>
        row.day === index ? { ...row, ...patch } : row,
      ),
    }));
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = profileSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors([
        ...new Set(parsed.error.issues.map((issue) => issue.message)),
      ]);
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setErrors([]);
    onCreate(parsed.data, isExample);
  }
  return (
    <form onSubmit={submit} noValidate className="reprise-panel space-y-8">
      <fieldset disabled={!ready} className="min-w-0 space-y-8">
        <legend className="reprise-kicker">01 / Ton organisation</legend>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-serif">
            Une semaine qui tient vraiment.
          </h2>
          {!initial && (
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setDraft(exampleProfile());
                setIsExample(true);
                setErrors([]);
                setCopiedDays(null);
                setCopyNotice("");
              }}
            >
              Essayer avec un exemple
            </Button>
          )}
        </div>
        {isExample && (
          <div className="reprise-note">
            <p role="status">
              Parcours issu d’un exemple fictif. Vérifie la date, les horaires
              et toutes les réponses avant de l’utiliser pour toi.
            </p>
            <label className="reprise-check mt-3">
              <input
                type="checkbox"
                checked={false}
                onChange={() => setIsExample(false)}
              />
              J’ai vérifié et remplacé les données par mon organisation.
            </label>
          </div>
        )}
        <div className="reprise-input-grid">
          <label>
            Date de reprise envisagée
            <input
              type="date"
              min="2000-01-01"
              max="2099-12-01"
              value={draft.returnDate}
              onChange={(event) =>
                setDraft({ ...draft, returnDate: event.target.value })
              }
              required
            />
          </label>
          <label>
            Ta solution de garde
            <select
              value={draft.careStatus}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  careStatus: event.target.value as WorkProfile["careStatus"],
                })
              }
            >
              <option value="pending">En cours de confirmation</option>
              <option value="confirmed">
                Confirmée avec la personne ou la structure
              </option>
              <option value="searching">Je cherche encore</option>
            </select>
          </label>
          <label>
            Un relais en cas d’imprévu ?
            <select
              value={draft.backup}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  backup: event.target.value as WorkProfile["backup"],
                })
              }
            >
              <option value="unknown">À vérifier</option>
              <option value="yes">Oui, une personne a donné son accord</option>
              <option value="no">Non, pas pour le moment</option>
            </select>
          </label>
        </div>
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Clock3 size={18} aria-hidden="true" /> Travail, trajet, garde : on
            rapproche les horaires.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Coche tes jours travaillés et ouvre chaque journée. Le trajet
            correspond à un aller simple entre le travail et le lieu de garde ;
            en télétravail, indique le trajet réellement nécessaire. La garde
            peut être assurée par un proche qui a donné son accord.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Une plage de travail et une plage de garde par jour, dans la même
            journée. Pour des horaires de nuit ou plusieurs relais successifs,
            prépare les créneaux séparément avec les personnes concernées.
          </p>
        </div>
        <div className="space-y-3">
          {copyNotice && (
            <div className="reprise-note">
              <p role="status">{copyNotice}</p>
              {copiedDays && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setDraft((current) => ({ ...current, days: copiedDays }));
                    setCopiedDays(null);
                    setCopyNotice(
                      "Copie annulée. Chaque journée a retrouvé ses horaires.",
                    );
                  }}
                >
                  Annuler la copie des horaires
                </Button>
              )}
            </div>
          )}
          {draft.days.map((row) => (
            <div className="reprise-day" key={row.day}>
              <label className="reprise-check">
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={(event) =>
                    updateDay(row.day, { active: event.target.checked })
                  }
                />
                {DAYS[row.day]} travaillé
              </label>
              {row.active && (
                <details open={row.day === 0 ? true : undefined}>
                  <summary>
                    Horaires du {DAYS[row.day].toLowerCase()}
                    {row.workStart && row.workEnd
                      ? ` · ${row.workStart}–${row.workEnd}`
                      : " · à renseigner"}
                  </summary>
                  <fieldset className="reprise-hours">
                    <legend className="sr-only">
                      Horaires du {DAYS[row.day].toLowerCase()}
                    </legend>
                    <label>
                      Début du travail
                      <input
                        aria-label={`${DAYS[row.day]} : début du travail`}
                        type="time"
                        value={row.workStart}
                        onChange={(event) =>
                          updateDay(row.day, { workStart: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Fin du travail
                      <input
                        aria-label={`${DAYS[row.day]} : fin du travail`}
                        type="time"
                        value={row.workEnd}
                        onChange={(event) =>
                          updateDay(row.day, { workEnd: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Trajet aller (min)
                      <input
                        aria-label={`${DAYS[row.day]} : trajet aller en minutes`}
                        type="number"
                        min={0}
                        max={180}
                        step={1}
                        value={row.travel}
                        onChange={(event) =>
                          updateDay(row.day, {
                            travel:
                              event.target.value === ""
                                ? 0
                                : Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      Début de garde
                      <input
                        aria-label={`${DAYS[row.day]} : début de garde`}
                        type="time"
                        value={row.careStart}
                        onChange={(event) =>
                          updateDay(row.day, { careStart: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      Fin de garde
                      <input
                        aria-label={`${DAYS[row.day]} : fin de garde`}
                        type="time"
                        value={row.careEnd}
                        onChange={(event) =>
                          updateDay(row.day, { careEnd: event.target.value })
                        }
                      />
                    </label>
                  </fieldset>
                  <p className="text-xs text-muted-foreground mt-2">
                    Horaires de garde inconnus ? Laisse les deux champs vides.
                  </p>
                  {draft.days.filter((day) => day.active).length > 1 && (
                    <Button
                      className="mt-3"
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setCopiedDays(draft.days);
                        setCopyNotice(
                          `Horaires du ${DAYS[row.day].toLowerCase()} copiés sur les ${draft.days.filter((day) => day.active).length - 1} autres jours cochés. Tu peux annuler cette copie avant de modifier une journée.`,
                        );
                        setDraft((current) => ({
                          ...current,
                          days: current.days.map((day) =>
                            day.active ? { ...row, day: day.day } : day,
                          ),
                        }));
                      }}
                    >
                      Appliquer ces horaires aux jours cochés
                    </Button>
                  )}
                </details>
              )}
            </div>
          ))}
        </div>
        <fieldset className="space-y-3">
          <legend className="font-semibold mb-3">
            Quels sujets veux-tu préparer pour le travail ?
          </legend>
          {Object.entries(TOPICS).map(([key, label]) => (
            <label className="reprise-check" key={key}>
              <input
                type="checkbox"
                checked={draft.topics.includes(
                  key as WorkProfile["topics"][number],
                )}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    topics: event.target.checked
                      ? [
                          ...current.topics,
                          key as WorkProfile["topics"][number],
                        ]
                      : current.topics.filter((topic) => topic !== key),
                  }))
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
        {initial && (
          <p className="reprise-note">
            Recalculer adapte les dates à la nouvelle organisation et remet les
            six actions à valider. Annuler conserve ton parcours actuel.
          </p>
        )}
        {errors.length > 0 && (
          <div
            role="alert"
            ref={errorRef}
            tabIndex={-1}
            className="reprise-error"
          >
            <p className="font-semibold">
              Quelques informations sont à compléter :
            </p>
            <ul className="list-disc pl-5 mt-2">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" className="family-button">
            {initial ? "Recalculer mon parcours" : "Voir mon bilan et mon plan"}
            <ArrowRight size={16} className="ml-2" aria-hidden="true" />
          </Button>
          {onCancel && (
            <Button variant="outline" type="button" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Tes réponses sont traitées dans ce navigateur. Tu choisis ensuite si
          tu souhaites garder une copie sur cet appareil. Aucun envoi à ton
          employeur.
        </p>
      </fieldset>
    </form>
  );
}
