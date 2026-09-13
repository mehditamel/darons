"use client";

import { useRef, useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DAYS,
  clockLabel,
  durationLabel,
  type WorkProfile,
} from "@/lib/return-to-work/plan";
import {
  compareWorkScenario,
  scenarioOutcome,
  scenarioSummary,
  type WorkAdjustment,
  type WorkComparison,
} from "@/lib/return-to-work/scenario";

export function RepriseScenario({
  profile,
  fromExample,
  onDownload,
}: {
  profile: WorkProfile;
  fromExample: boolean;
  onDownload: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(() =>
    profile.days.filter((day) => day.active).map((day) => day.day),
  );
  const [shift, setShift] = useState("0");
  const [travel, setTravel] = useState("");
  const [earlier, setEarlier] = useState("0");
  const [later, setLater] = useState("0");
  const [result, setResult] = useState<{
    comparison: WorkComparison;
    text: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  function invalidate() {
    setResult(null);
    setError("");
    setNotice("");
  }
  const amount = (value: number | null) =>
    value === null ? "À préciser" : durationLabel(value);
  return (
    <section
      className="reprise-panel reprise-scenario"
      aria-labelledby="scenario-title"
    >
      <p className="reprise-kicker">
        <SlidersHorizontal size={16} aria-hidden="true" /> Le laboratoire de ta
        semaine
      </p>
      <h2 id="scenario-title" className="text-2xl font-serif mt-3">
        Et si on changeait les horaires ?
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Commencer plus tôt, raccourcir un trajet, élargir la garde… Compare une
        piste avant d’en parler aux personnes concernées.
      </p>
      <Button
        className="mt-5"
        variant="outline"
        aria-expanded={open}
        aria-controls="scenario-form"
        onClick={() => setOpen(!open)}
      >
        {open ? "Replier le comparateur" : "Tester un ajustement"}
        <ArrowRight size={16} className="ml-2" aria-hidden="true" />
      </Button>
      <div id="scenario-form" hidden={!open} className="mt-6 space-y-6">
        <p className="reprise-note">
          Une hypothèse à discuter. Ton parcours, ses dates et ses actions
          restent inchangés. Le scénario disparaît en quittant cette page ; tu
          peux télécharger son récapitulatif.
        </p>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            invalidate();
            const adjustment: WorkAdjustment = {
              days,
              workShift: Number(shift),
              travel: travel === "" ? null : Number(travel),
              careEarlier: Number(earlier),
              careLater: Number(later),
            };
            try {
              setResult({
                comparison: compareWorkScenario(profile, adjustment),
                text: scenarioSummary(profile, adjustment, fromExample),
              });
              requestAnimationFrame(() => resultHeading.current?.focus());
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Vérifie les ajustements saisis.",
              );
              requestAnimationFrame(() => errorRef.current?.focus());
            }
          }}
          className="space-y-5"
        >
          <fieldset>
            <legend className="font-semibold mb-3">
              1. Quels jours veux-tu comparer ?
            </legend>
            <div className="reprise-scenario-days">
              {profile.days
                .filter((day) => day.active)
                .map((day) => (
                  <label key={day.day} className="reprise-check">
                    <input
                      type="checkbox"
                      checked={days.includes(day.day)}
                      onChange={(event) => {
                        invalidate();
                        setDays(
                          event.target.checked
                            ? [...days, day.day]
                            : days.filter((value) => value !== day.day),
                        );
                      }}
                    />
                    {DAYS[day.day]}
                  </label>
                ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-semibold mb-3">
              2. Quelle organisation veux-tu essayer ?
            </legend>
            <p className="text-sm text-muted-foreground mb-4">
              Les ajustements s’appliquent aux jours cochés, à partir de leurs
              propres horaires.
            </p>
            <div className="reprise-scenario-inputs">
              <label>
                Décaler la journée de travail
                <select
                  value={shift}
                  onChange={(event) => {
                    invalidate();
                    setShift(event.target.value);
                  }}
                >
                  <option value="0">Garder les horaires actuels</option>
                  {[-120, -90, -60, -45, -30, -15, 15, 30, 45, 60, 90, 120].map(
                    (value) => (
                      <option key={value} value={value}>
                        {durationLabel(Math.abs(value))} plus{" "}
                        {value < 0 ? "tôt" : "tard"}
                      </option>
                    ),
                  )}
                </select>
                <span>
                  Début et fin décalés ensemble, même durée de travail.
                </span>
              </label>
              <label>
                Trajet aller envisagé (min)
                <input
                  type="number"
                  min={0}
                  max={180}
                  step={1}
                  placeholder="Conserver chaque trajet"
                  value={travel}
                  onChange={(event) => {
                    invalidate();
                    setTravel(event.target.value);
                  }}
                />
                <span>
                  Laisse vide pour garder les durées actuelles. 0 signifie aucun
                  trajet.
                </span>
              </label>
              <label>
                Commencer la garde plus tôt (min)
                <input
                  type="number"
                  min={0}
                  max={180}
                  step={1}
                  value={earlier}
                  onChange={(event) => {
                    invalidate();
                    setEarlier(event.target.value);
                  }}
                />
              </label>
              <label>
                Finir la garde plus tard (min)
                <input
                  type="number"
                  min={0}
                  max={180}
                  step={1}
                  value={later}
                  onChange={(event) => {
                    invalidate();
                    setLater(event.target.value);
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Les horaires de garde inconnus restent inconnus. Une extension est
              une piste à vérifier avec la personne ou la structure, y compris
              son coût éventuel.
            </p>
          </fieldset>
          {error && (
            <p
              role="alert"
              ref={errorRef}
              tabIndex={-1}
              className="reprise-error"
            >
              {error}
            </p>
          )}
          <Button type="submit">Comparer avec mon organisation</Button>
        </form>
        {result && (
          <div
            className="reprise-scenario-result"
            role="region"
            aria-label="Résultat de la simulation"
          >
            <p className="reprise-kicker">
              {fromExample
                ? "Exemple fictif · Hypothèse à confirmer"
                : "Hypothèse à confirmer"}
            </p>
            <h3
              ref={resultHeading}
              tabIndex={-1}
              className="text-2xl font-serif mt-3"
            >
              {scenarioOutcome(result.comparison)}
            </h3>
            <p className="text-sm text-muted-foreground mt-3">
              Comparaison sur {result.comparison.rows.length} jour(s)
              sélectionné(s), dont {result.comparison.knownDays} aux horaires de
              garde renseignés.
            </p>
            {result.comparison.knownDays > 0 && (
              <div className="reprise-scenario-totals mt-5">
                <div>
                  <span>Organisation actuelle</span>
                  <strong>
                    {durationLabel(result.comparison.beforeMinutes)}
                  </strong>
                  <small>à organiser</small>
                </div>
                <ArrowRight size={22} aria-hidden="true" />
                <div>
                  <span>Avec cette hypothèse</span>
                  <strong>
                    {durationLabel(result.comparison.afterMinutes)}
                  </strong>
                  <small>resteraient à organiser</small>
                </div>
              </div>
            )}
            {result.comparison.unknownDays > 0 && (
              <p className="reprise-note mt-4">
                {result.comparison.unknownDays} jour(s) de garde inconnue exclus
                de ces durées. Complète-les dans ton organisation avant de
                conclure.
              </p>
            )}
            <div className="space-y-3 mt-5">
              {result.comparison.rows.map((row) => (
                <div key={row.day} className="reprise-coverage">
                  <div>
                    <h4 className="font-semibold">{DAYS[row.day]}</h4>
                    <p className="text-sm text-muted-foreground">
                      Besoin de relais envisagé : {clockLabel(row.after.start)}–
                      {clockLabel(row.after.end)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {amount(row.before.missing)} → {amount(row.after.missing)}
                    </p>
                    {row.after.gaps.map((gap) => (
                      <p key={gap.start} className="text-sm">
                        Resterait : {clockLabel(gap.start)}–
                        {clockLabel(gap.end)}
                      </p>
                    ))}
                    {row.after.missing === 0 && (
                      <p className="text-sm">
                        Horaires compatibles, accords à vérifier.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <details className="mt-4">
              <summary>Voir les horaires proposés et le récapitulatif</summary>
              <pre
                className="reprise-brief"
                aria-label="Récapitulatif de l’hypothèse"
              >
                {result.text}
              </pre>
            </details>
            <p className="text-sm text-muted-foreground mt-4">
              Ce récapitulatif contient des horaires familiaux. Choisis à qui tu
              le transmets ; pour les RH, utilise le document professionnel
              séparé plus bas.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.text);
                    setNotice(
                      "Hypothèse copiée. Tu choisis à qui la transmettre.",
                    );
                  } catch {
                    onDownload(result.text);
                    setNotice(
                      "Copie indisponible : récapitulatif téléchargé. Aucun message n’a été envoyé.",
                    );
                  }
                }}
              >
                Copier cette hypothèse
              </Button>
              <Button variant="outline" onClick={() => onDownload(result.text)}>
                Télécharger cette hypothèse
              </Button>
            </div>
            {notice && (
              <p role="status" className="reprise-note mt-4">
                {notice}
              </p>
            )}
            <p className="text-sm mt-5">
              Si cette piste est confirmée, reporte ses horaires via « Modifier
              mon organisation ». Une simulation ne confirme ni une garde ni un
              aménagement au travail.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
