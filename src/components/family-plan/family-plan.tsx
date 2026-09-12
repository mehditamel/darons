"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  HeartHandshake,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FOCUS_LABELS,
  getMission,
  STAGE_LABELS,
} from "@/lib/family-plan/catalog";
import {
  createFamilyPlan,
  exportPlanCalendar,
  MAX_PLAN_BYTES,
  parseFamilyPlan,
  PLAN_STORAGE_KEY,
  planHandoff,
} from "@/lib/family-plan/plan";
import type { FamilyPlan as Plan } from "@/lib/validators/family-plan";
import { PlanWizard } from "./plan-wizard";
import { MissionCard } from "./mission-card";

function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function FamilyPlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [remember, setRemember] = useState(false);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pendingImport, setPendingImport] = useState<Plan | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const wizardRegion = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PLAN_STORAGE_KEY);
      if (stored) {
        setPlan(parseFamilyPlan(stored));
        setRemember(true);
      }
    } catch {
      setError(
        "La sauvegarde locale n’a pas pu être chargée. Tu peux créer un plan ou importer une sauvegarde.",
      );
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !remember || !plan) return;
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
    } catch {
      setRemember(false);
      setError(
        "Les dernières modifications ne sont pas enregistrées : le stockage est indisponible ou plein. Télécharge ton plan pour les garder. Une ancienne copie peut rester sur cet appareil.",
      );
    }
  }, [plan, ready, remember]);

  function showPlan(next: Plan) {
    setPlan(next);
    setError("");
    setNotice("");
    requestAnimationFrame(() => resultHeading.current?.focus());
  }

  function savePreference(checked: boolean) {
    try {
      if (checked && plan)
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plan));
      else localStorage.removeItem(PLAN_STORAGE_KEY);
      setRemember(checked);
      setError("");
      setNotice(
        checked
          ? "Plan enregistré sur cet appareil."
          : "Copie locale effacée. Le plan reste ouvert ici.",
      );
    } catch {
      setError(
        checked
          ? "Enregistrement impossible sur cet appareil. Télécharge ton plan pour le garder."
          : "Impossible d’effacer la copie locale. Réessaie ou utilise les réglages de stockage de ton navigateur.",
      );
    }
  }

  function resetPlan() {
    try {
      localStorage.removeItem(PLAN_STORAGE_KEY);
    } catch {
      setError(
        "Impossible de vérifier l’effacement de la copie locale. Utilise les réglages de stockage de ton navigateur puis réessaie.",
      );
      return;
    }
    setPlan(null);
    setRemember(false);
    setNotice("Plan effacé. Tu peux repartir de tes besoins du moment.");
    setError("");
    requestAnimationFrame(() => wizardRegion.current?.focus());
  }

  const completed =
    plan?.missions.filter((state) => state.completed.every(Boolean)).length ??
    0;
  const pending =
    plan?.missions.filter((state) => !state.completed.every(Boolean)) ?? [];
  const calendarCount = pending.filter((state) => state.date).length;
  const minutes =
    plan?.missions.reduce(
      (total, state) => total + getMission(state.id).minutes,
      0,
    ) ?? 0;

  return (
    <div className="space-y-6">
      <div
        role="status"
        aria-live="polite"
        className={notice ? "plan-message" : "sr-only"}
      >
        {notice}
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-background p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {!ready ? (
        <p className="plan-workspace text-muted-foreground" role="status">
          Préparation de ton espace…
        </p>
      ) : !plan ? (
        <div ref={wizardRegion} tabIndex={-1}>
          <PlanWizard
            onCreate={(profile) => {
              try {
                showPlan(createFamilyPlan(profile, crypto.randomUUID()));
              } catch {
                setError(
                  "Le plan n’a pas pu être créé. Vérifie tes réponses puis réessaie.",
                );
              }
            }}
          />
        </div>
      ) : (
        <>
          <section className="plan-summary" aria-labelledby="plan-result-title">
            <div className="flex items-start gap-3">
              <span className="plan-summary-icon" aria-hidden="true">
                {completed === plan.missions.length ? (
                  <Check size={25} />
                ) : (
                  <HeartHandshake size={25} />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Ton plan, à ton rythme
                </p>
                <h2
                  id="plan-result-title"
                  ref={resultHeading}
                  tabIndex={-1}
                  className="mt-2 font-serif text-2xl sm:text-3xl"
                >
                  {completed === plan.missions.length
                    ? "C’est fait. Place au reste de la vie."
                    : `${plan.missions.length} ${plan.missions.length === 1 ? "action pour" : "actions pour"} alléger ta semaine.`}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Priorité :{" "}
                  {FOCUS_LABELS[plan.profile.focus].toLocaleLowerCase("fr")}.{" "}
                  {minutes} minutes prévues sur les {plan.profile.minutes}{" "}
                  disponibles. Les durées sont indicatives.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {plan.profile.stages.map((stage) => (
                <span className="plan-tag" key={stage}>
                  {STAGE_LABELS[stage]}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Créé le {new Date(plan.createdAt).toLocaleDateString("fr-FR")} ·
              Ce plan reste ouvert jusqu’à ce que tu choisisses de recommencer.
            </p>
            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <span>Les petits pas comptent.</span>
              <strong aria-live="polite">
                {completed}/{plan.missions.length} terminée
                {completed > 1 ? "s" : ""}
              </strong>
            </div>
            <progress
              className="plan-progress mt-2"
              aria-label="Actions terminées"
              max={plan.missions.length}
              value={completed}
            />
            <label className="plan-check mt-5 border-t pt-5">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => savePreference(event.target.checked)}
              />
              <span>
                <strong>Garder mon plan sur cet appareil</strong>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {remember
                    ? "Sauvegarde locale activée."
                    : "Sans sauvegarde, le plan sera perdu en quittant cette page."}{" "}
                  Pas de synchronisation entre appareils ou avec le compte
                  Darons.
                </span>
              </span>
            </label>
          </section>
          <p className="px-1 text-sm leading-relaxed text-muted-foreground">
            Ces suggestions partent de tes trois réponses. Les jours sont
            modifiables ; ce sont des créneaux d’organisation, pas des échéances
            officielles. Ton relais peut être un coparent, un proche ou une
            personne de confiance, après accord avec elle.
          </p>
          <div className="space-y-4">
            {plan.missions.map((state, index) => (
              <MissionCard
                key={`${plan.id}-${state.id}`}
                state={state}
                index={index}
                onChange={(next) =>
                  setPlan({
                    ...plan,
                    missions: plan.missions.map((item) =>
                      item.id === next.id ? next : item,
                    ),
                  })
                }
              />
            ))}
          </div>
          <section
            className="plan-workspace"
            aria-labelledby="plan-takeaway-title"
          >
            <h2 id="plan-takeaway-title" className="font-serif text-2xl">
              Un plan qui sort de ta tête.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              À garder, à mettre dans ton agenda ou à transmettre à ton relais.
              Rien n’est envoyé automatiquement.
            </p>
            <div className="my-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="h-auto min-h-11 whitespace-normal text-left"
                disabled={!calendarCount}
                onClick={() => {
                  download(
                    exportPlanCalendar(plan),
                    "mon-plan-darons.ics",
                    "text/calendar;charset=utf-8",
                  );
                  setNotice(
                    `${calendarCount} action${calendarCount > 1 ? "s" : ""} dans le fichier calendrier. Ouvre-le dans ton agenda pour confirmer l’ajout. Les événements couvrent le jour choisi et ne se synchronisent pas ensuite.`,
                  );
                }}
              >
                <CalendarPlus
                  size={17}
                  className="mr-2 shrink-0"
                  aria-hidden="true"
                />
                Ajouter à mon calendrier
              </Button>
              <Button
                variant="outline"
                className="h-auto min-h-11 whitespace-normal text-left"
                disabled={!pending.length}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(planHandoff(plan));
                    setNotice(
                      "Le récapitulatif des actions restantes est copié. Tu peux l’envoyer à ton relais pour vous mettre d’accord.",
                    );
                  } catch {
                    download(
                      planHandoff(plan),
                      "mon-relais-darons.txt",
                      "text/plain;charset=utf-8",
                    );
                    setNotice(
                      "La copie n’est pas disponible ici. Le récapitulatif est téléchargé pour le transmettre toi-même.",
                    );
                  }
                }}
              >
                <Copy size={17} className="mr-2 shrink-0" aria-hidden="true" />
                Préparer le relais
              </Button>
            </div>
            {!calendarCount && (
              <p className="mb-5 text-sm text-muted-foreground">
                Pour exporter un calendrier, garde au moins une action à faire
                avec un jour choisi.
              </p>
            )}
            <Button
              variant="ghost"
              className="mt-4 h-auto min-h-11 whitespace-normal text-left"
              onClick={() => {
                download(
                  JSON.stringify(plan, null, 2),
                  "mon-plan.darons.json",
                  "application/json",
                );
                setNotice(
                  "Sauvegarde téléchargée. Importe ce fichier ici pour retrouver le plan et son avancement sur un autre appareil.",
                );
              }}
            >
              <Download
                size={17}
                className="mr-2 shrink-0"
                aria-hidden="true"
              />
              Télécharger mon plan et son avancement
            </Button>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              L’export calendrier est une copie des actions restantes. Il ne
              transmet pas le plan à une autre personne et ses modifications
              restent indépendantes.
            </p>
          </section>
        </>
      )}
      {ready && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <Button
            variant="ghost"
            className="h-auto min-h-11 whitespace-normal text-left"
            onClick={() => fileInput.current?.click()}
          >
            <Upload size={16} className="mr-2 shrink-0" aria-hidden="true" />
            Importer une sauvegarde
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="hidden"
            aria-label="Fichier de sauvegarde Darons"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (file.size > MAX_PLAN_BYTES) {
                setError(
                  "Cette sauvegarde est trop volumineuse (64 Ko maximum).",
                );
                return;
              }
              try {
                const imported = parseFamilyPlan(await file.text());
                setPendingImport(imported);
                setError("");
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Ce fichier ne peut pas être importé.",
                );
              }
            }}
          />
          {plan && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground">
                  Effacer et recommencer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Repartir sur un nouveau plan ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Ton plan et sa copie sur cet appareil seront effacés.
                    Télécharge une sauvegarde avant de continuer si tu veux
                    conserver ton avancement. Les fichiers déjà exportés
                    resteront inchangés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Garder mon plan</AlertDialogCancel>
                  <AlertDialogAction onClick={resetPlan}>
                    Effacer mon plan
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
      <AlertDialog
        open={!!pendingImport}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reprendre cette sauvegarde ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport
                ? `${pendingImport.missions.length} action(s) · ${FOCUS_LABELS[pendingImport.profile.focus]}. `
                : ""}
              {plan
                ? "Le plan ouvert sera remplacé, avec son avancement. "
                : ""}
              La sauvegarde sur cet appareil reste{" "}
              {remember ? "activée" : "désactivée"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingImport) showPlan(pendingImport);
                setPendingImport(null);
              }}
            >
              Reprendre ce plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
