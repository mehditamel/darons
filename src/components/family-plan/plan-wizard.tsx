"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Check,
  Clock3,
  HeartHandshake,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FOCUSES,
  FOCUS_LABELS,
  STAGES,
  STAGE_LABELS,
} from "@/lib/family-plan/catalog";
import {
  familyProfileSchema,
  type FamilyProfile,
} from "@/lib/validators/family-plan";

const FOCUS_ICONS = {
  arrival: Sparkles,
  rest: HeartHandshake,
  money: Wallet,
  care: Baby,
};
const TITLES = [
  "Où en est ta petite famille ?",
  "Qu’est-ce qui te ferait du bien ?",
  "Combien de temps as-tu cette semaine ?",
];

interface PlanWizardProps {
  onCreate: (profile: FamilyProfile) => void;
}

export function PlanWizard({ onCreate }: PlanWizardProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<FamilyProfile>({
    stages: [],
    focus: "rest",
    minutes: 20,
  });
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  function move(next: number) {
    setStep(next);
    setError("");
    requestAnimationFrame(() => heading.current?.focus());
  }

  return (
    <form
      className="plan-workspace"
      onSubmit={(event) => {
        event.preventDefault();
        const result = familyProfileSchema.safeParse(profile);
        if (!result.success) {
          setError("Choisis au moins une étape pour ta famille.");
          return;
        }
        if (step < 2) move(step + 1);
        else onCreate(result.data);
      }}
    >
      <ol className="plan-steps" aria-label="Les trois étapes du plan">
        {["Ta famille", "Ton besoin", "Ton temps"].map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            data-active={step >= index}
          >
            <span aria-hidden="true">
              {step > index ? <Check size={14} /> : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
      <h2 ref={heading} tabIndex={-1} className="plan-question">
        {TITLES[step]}
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {step === 0
          ? "Plusieurs réponses possibles si la famille s’agrandit. Aucun nom ni date de naissance à renseigner."
          : step === 1
            ? "Choisis ta priorité du moment. Tu n’as pas besoin de tout régler cette semaine."
            : "C’est le temps pour avancer sur le plan, pas une évaluation de ton quotidien. Les durées restent indicatives."}
      </p>
      {step === 0 && (
        <fieldset>
          <legend className="sr-only">L’étape de ta famille</legend>
          <div className="plan-choices">
            {STAGES.map((stage) => (
              <label
                key={stage}
                className="plan-choice"
                data-selected={profile.stages.includes(stage)}
              >
                <input
                  type="checkbox"
                  checked={profile.stages.includes(stage)}
                  onChange={(event) => {
                    setProfile({
                      ...profile,
                      stages: event.target.checked
                        ? [...profile.stages, stage]
                        : profile.stages.filter((item) => item !== stage),
                    });
                    setError("");
                  }}
                />
                <span>{STAGE_LABELS[stage]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {step === 1 && (
        <fieldset>
          <legend className="sr-only">Ta priorité cette semaine</legend>
          <div className="plan-choices">
            {FOCUSES.map((focus) => {
              const Icon = FOCUS_ICONS[focus];
              return (
                <label
                  key={focus}
                  className="plan-choice"
                  data-selected={profile.focus === focus}
                >
                  <input
                    type="radio"
                    name="focus"
                    value={focus}
                    checked={profile.focus === focus}
                    onChange={() => setProfile({ ...profile, focus })}
                  />
                  <Icon
                    size={20}
                    aria-hidden="true"
                    className="shrink-0 text-secondary"
                  />
                  <span>{FOCUS_LABELS[focus]}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      {step === 2 && (
        <fieldset>
          <legend className="sr-only">Le temps disponible pour le plan</legend>
          <div className="plan-time-choices">
            {([10, 20, 40] as const).map((minutes) => (
              <label
                key={minutes}
                className="plan-choice flex-col items-start"
                data-selected={profile.minutes === minutes}
              >
                <input
                  type="radio"
                  name="minutes"
                  value={minutes}
                  checked={profile.minutes === minutes}
                  onChange={() => setProfile({ ...profile, minutes })}
                />
                <strong className="text-2xl font-serif">{minutes} min</strong>
                <span className="text-sm">
                  {minutes === 10
                    ? "Un premier pas"
                    : minutes === 20
                      ? "Un peu de place"
                      : "Le temps d’avancer"}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
            <Clock3 size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            Le plan s’arrête à trois actions, même si tu as davantage de temps.
          </p>
        </fieldset>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => move(step - 1)}>
            <ArrowLeft size={16} className="mr-2" aria-hidden="true" />
            Retour
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            3 réponses. Et on respire.
          </span>
        )}
        <Button type="submit" className="min-h-12 rounded-full px-6">
          {step === 2 ? "Créer mon plan" : "Continuer"}
          <ArrowRight size={16} className="ml-2" aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
