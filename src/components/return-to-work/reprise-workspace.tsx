"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  ShieldCheck,
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
  ACTION_IDS,
  DAYS,
  MAX_REPRISE_BYTES,
  REPRISE_STORAGE_NAME,
  TOPICS,
  actionDetails,
  clockLabel,
  coverage,
  createWorkPlan,
  dateLabel,
  durationLabel,
  employerBrief,
  exportWorkCalendar,
  parseWorkPlan,
  personalSummary,
  workPlanSchema,
  type WorkPlan,
  type WorkProfile,
} from "@/lib/return-to-work/plan";
import { RepriseForm } from "./reprise-form";
import { RepriseScenario } from "./reprise-scenario";

function download(
  text: string,
  filename: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function RepriseWorkspace() {
  const [plan, setPlan] = useState<WorkPlan | null>(null);
  const [ready, setReady] = useState(false);
  const [remember, setRemember] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pendingImport, setPendingImport] = useState<WorkPlan | null>(null);
  const [sharedTopics, setSharedTopics] = useState<WorkProfile["topics"]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REPRISE_STORAGE_NAME);
      if (saved) {
        const restored = parseWorkPlan(saved);
        setPlan(restored);
        setRemember(true);
        setSharedTopics(restored.profile.topics);
      }
    } catch {
      setError(
        "Impossible de charger la copie locale. Tu peux créer un parcours ou importer ta sauvegarde.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !remember || !plan) return;
    try {
      localStorage.setItem(REPRISE_STORAGE_NAME, JSON.stringify(plan));
    } catch {
      setRemember(false);
      setError(
        "Les dernières modifications ne sont pas enregistrées. Télécharge ta sauvegarde ; une ancienne copie peut rester sur cet appareil.",
      );
    }
  }, [plan, ready, remember]);
  function showPlan(value: WorkPlan) {
    setPlan(value);
    setSharedTopics(value.profile.topics);
    setEditing(false);
    setError("");
    setNotice("");
    requestAnimationFrame(() => heading.current?.focus());
  }
  function savePreference(checked: boolean) {
    try {
      if (checked && plan)
        localStorage.setItem(REPRISE_STORAGE_NAME, JSON.stringify(plan));
      else localStorage.removeItem(REPRISE_STORAGE_NAME);
      setRemember(checked);
      setError("");
      setNotice(
        checked
          ? "Parcours enregistré sur cet appareil."
          : "Copie locale effacée. Le parcours reste ouvert ici.",
      );
    } catch {
      setError(
        checked
          ? "Enregistrement impossible. Télécharge une sauvegarde pour garder ton parcours."
          : "Impossible d’effacer la copie locale. Réessaie ou utilise les réglages de stockage du navigateur.",
      );
    }
  }
  function updateAction(
    id: (typeof ACTION_IDS)[number],
    patch: { done?: boolean; date?: string },
  ) {
    if (!plan) return;
    const candidate = workPlanSchema.safeParse({
      ...plan,
      actions: plan.actions.map((action) =>
        action.id === id ? { ...action, ...patch } : action,
      ),
    });
    if (candidate.success) {
      setPlan(candidate.data);
      setError("");
    } else setError("Choisis une date valide pour cette action.");
  }
  const rows = plan ? coverage(plan.profile) : [];
  const gaps = rows.filter((row) => row.missing !== null && row.missing > 0);
  const unknown = rows.filter((row) => row.missing === null);
  const minutes = rows.reduce((total, row) => total + (row.missing ?? 0), 0);
  const done = plan?.actions.filter((action) => action.done).length ?? 0;
  const brief = plan ? employerBrief(plan, sharedTopics) : "";
  return (
    <div className="space-y-6">
      {!ready && (
        <p className="reprise-note">
          Le parcours interactif nécessite JavaScript. Tu peux consulter les
          sources officielles en bas de cette page et{" "}
          <Link className="reprise-link" href="/outils/simulateur-garde">
            le simulateur de garde
          </Link>
          . Aucun parcours n’a été créé.
        </p>
      )}
      <p
        role="status"
        aria-live="polite"
        className={notice ? "reprise-note" : "sr-only"}
      >
        {notice}
      </p>
      {error && (
        <p role="alert" className="reprise-error">
          {error}
        </p>
      )}
      {!plan || editing ? (
        <RepriseForm
          key={editing ? "edit" : "new"}
          initial={editing && plan ? plan.profile : undefined}
          initialExample={plan?.fromExample ?? false}
          ready={ready}
          onCreate={(profile, fromExample) => {
            try {
              showPlan(
                createWorkPlan(
                  profile,
                  crypto.randomUUID(),
                  new Date(),
                  fromExample,
                ),
              );
            } catch {
              setError(
                "Ce parcours n’a pas pu être créé. Vérifie la date de reprise et réessaie.",
              );
            }
          }}
          onCancel={editing ? () => setEditing(false) : undefined}
        />
      ) : (
        <>
          <section
            className="reprise-panel"
            id="semaine"
            aria-labelledby="bilan-title"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="reprise-kicker">02 / Ton bilan concret</p>
                <h2
                  id="bilan-title"
                  ref={heading}
                  tabIndex={-1}
                  className="text-3xl font-serif mt-3"
                >
                  Ta reprise du {dateLabel(plan.profile.returnDate)}
                </h2>
                {plan.fromExample && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Parcours issu d’un exemple fictif. Vérifie les données dans
                    « Modifier mon organisation » avant de l’utiliser.
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Modifier mon organisation
              </Button>
            </div>
            <div className="reprise-stat-grid mt-6">
              <div>
                <strong>{durationLabel(minutes)}</strong>
                <span>de décalage sur les jours renseignés</span>
              </div>
              <div>
                <strong>{unknown.length}</strong>
                <span>
                  jour{unknown.length > 1 ? "s" : ""} aux horaires de garde
                  inconnus
                </span>
              </div>
              <div>
                <strong>
                  {plan.profile.careStatus === "confirmed"
                    ? "Confirmée"
                    : "À confirmer"}
                </strong>
                <span>ta solution de garde, selon ta réponse</span>
              </div>
            </div>
            <p className="mt-5 font-semibold">
              {gaps.length
                ? `${gaps.length} journée(s) demandent un ajustement.`
                : unknown.length
                  ? "Complète les horaires manquants avant de conclure."
                  : "Pas de décalage entre les horaires renseignés."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ce bilan compare les horaires saisis, trajet aller et retour
              inclus. Il ne confirme ni une place de garde ni la disponibilité
              d’un relais. Ajoute ta marge de trajet dans les durées saisies ;
              le télétravail ne remplace pas un mode de garde.
            </p>
            <div className="mt-5 space-y-3">
              {rows.map((row) => (
                <div className="reprise-coverage" key={row.day}>
                  <div>
                    <h3 className="font-semibold">{DAYS[row.day]}</h3>
                    <p className="text-sm text-muted-foreground">
                      Besoin de relais : {clockLabel(row.start)}–
                      {clockLabel(row.end)}
                    </p>
                  </div>
                  <div>
                    {row.missing === null ? (
                      <p>Horaires de garde à préciser</p>
                    ) : row.missing ? (
                      <>
                        <p className="font-semibold">
                          {durationLabel(row.missing)} à organiser
                        </p>
                        {row.gaps.map((gap) => (
                          <p className="text-sm" key={gap.start}>
                            De {clockLabel(gap.start)} à {clockLabel(gap.end)}
                          </p>
                        ))}
                      </>
                    ) : (
                      <p className="flex items-center gap-2">
                        <Check size={16} aria-hidden="true" />
                        Horaires compatibles
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <RepriseScenario
            key={`${plan.id}:${JSON.stringify(plan.profile)}`}
            profile={plan.profile}
            fromExample={plan.fromExample}
            onDownload={(text) =>
              download(text, "darons-reprise-hypothese.txt")
            }
          />
          <section className="reprise-panel" aria-labelledby="actions-title">
            <p className="reprise-kicker">
              03 / Un parcours jusqu’à la reprise
            </p>
            <h2 id="actions-title" className="text-2xl font-serif mt-3">
              Six étapes, une prochaine action.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {done} sur 6 étapes terminées. Les dates sont des repères
              d’organisation modifiables, sans valeur d’échéance légale. Les
              étapes déjà passées sont proposées aujourd’hui.
            </p>
            <ol className="reprise-actions mt-6">
              {plan.actions.map((action, index) => {
                const details = actionDetails(action.id, plan.profile);
                return (
                  <li key={action.id} className={action.done ? "is-done" : ""}>
                    <span className="reprise-action-number" aria-hidden="true">
                      {action.done ? (
                        <Check size={18} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <div>
                      <label className="reprise-check font-semibold">
                        <input
                          type="checkbox"
                          checked={action.done}
                          onChange={(event) =>
                            updateAction(action.id, {
                              done: event.target.checked,
                            })
                          }
                        />
                        {details.title}
                      </label>
                      <p className="text-sm text-muted-foreground my-3">
                        {details.text}
                      </p>
                      <a className="reprise-link" href={details.href}>
                        {details.link}
                      </a>
                      <label className="reprise-action-date">
                        Jour choisi
                        <input
                          aria-label={`Jour choisi : ${details.title}`}
                          type="date"
                          value={action.date}
                          min="2000-01-01"
                          max="2099-12-31"
                          onChange={(event) =>
                            updateAction(action.id, {
                              date: event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Button
              className="mt-5"
              variant="outline"
              disabled={done === 6}
              onClick={() => {
                download(
                  exportWorkCalendar(plan),
                  "darons-reprise.ics",
                  "text/calendar;charset=utf-8",
                );
                setNotice(
                  "Calendrier téléchargé. Importe-le dans ton agenda personnel : il contient les actions restantes, sans alarme ni synchronisation.",
                );
              }}
            >
              <CalendarPlus size={16} aria-hidden="true" className="mr-2" />
              Ajouter les étapes à mon agenda
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              Le calendrier mentionne la reprise et la garde. Choisis un agenda
              personnel si tu souhaites garder ces informations privées.
            </p>
          </section>
          <section
            className="reprise-panel"
            id="document-rh"
            aria-labelledby="rh-title"
          >
            <p className="reprise-kicker">04 / Le bon échange au travail</p>
            <h2 id="rh-title" className="text-2xl font-serif mt-3">
              Ton document pour les RH ou le manager.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Choisis les sujets à inclure. Le texte ci-dessous contient ta date
              envisagée et les questions sélectionnées. Tes horaires de garde,
              tes relais et ton avancement n’y figurent pas.
            </p>
            <fieldset className="space-y-3 mt-5">
              <legend className="sr-only">
                Sujets du document professionnel
              </legend>
              {Object.entries(TOPICS).map(([key, label]) => (
                <label className="reprise-check" key={key}>
                  <input
                    type="checkbox"
                    checked={sharedTopics.includes(
                      key as WorkProfile["topics"][number],
                    )}
                    onChange={(event) =>
                      setSharedTopics((current) =>
                        event.target.checked
                          ? [...current, key as WorkProfile["topics"][number]]
                          : current.filter((value) => value !== key),
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <pre
              className="reprise-brief mt-5"
              role="region"
              aria-label="Aperçu du document professionnel"
            >
              {brief}
            </pre>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button
                disabled={!sharedTopics.length}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(brief);
                    setNotice(
                      "Document copié. Relis-le et transmets-le toi-même à la personne choisie.",
                    );
                  } catch {
                    download(brief, "darons-echange-professionnel.txt");
                    setNotice(
                      "Copie indisponible : document téléchargé à la place. Aucun message n’a été envoyé.",
                    );
                  }
                }}
              >
                <Copy size={16} aria-hidden="true" className="mr-2" />
                Copier mon document professionnel
              </Button>
              <Button
                variant="outline"
                disabled={!sharedTopics.length}
                onClick={() =>
                  download(brief, "darons-echange-professionnel.txt")
                }
              >
                <Download size={16} aria-hidden="true" className="mr-2" />
                Télécharger le document
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Complète les décisions après l’échange. Ce document ne vaut ni
              demande officielle de congé, ni accord de l’employeur.
            </p>
          </section>
          <section className="reprise-panel" aria-labelledby="save-title">
            <h2
              id="save-title"
              className="text-xl font-serif flex items-center gap-2"
            >
              <ShieldCheck size={20} aria-hidden="true" />
              Garder ton parcours, à ta façon.
            </h2>
            <label className="reprise-check mt-5">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => savePreference(event.target.checked)}
              />
              Enregistrer ce parcours sur cet appareil
            </label>
            <p className="mt-2 text-sm text-muted-foreground">
              Sur un appareil partagé, les autres personnes utilisant ce
              navigateur pourraient retrouver cette copie. Pas de
              synchronisation avec ton compte Darons, ton employeur ou un autre
              appareil.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Button
                variant="outline"
                onClick={() =>
                  download(
                    personalSummary(plan),
                    "darons-reprise-personnelle.txt",
                  )
                }
              >
                Télécharger mon récapitulatif personnel
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  download(
                    JSON.stringify(plan, null, 2),
                    "darons-reprise-sauvegarde.json",
                    "application/json",
                  )
                }
              >
                <Download size={16} aria-hidden="true" className="mr-2" />
                Sauvegarder mon parcours
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost">Effacer mon parcours</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Effacer ce parcours ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Le parcours et sa copie dans ce navigateur seront effacés.
                      Les fichiers que tu as téléchargés et les autres données
                      Darons sont conservés.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        try {
                          localStorage.removeItem(REPRISE_STORAGE_NAME);
                          setPlan(null);
                          setRemember(false);
                          setNotice("Parcours effacé.");
                          setError("");
                        } catch {
                          setError(
                            "Impossible de confirmer l’effacement local. Utilise les réglages de stockage de ce navigateur puis réessaie.",
                          );
                        }
                      }}
                    >
                      Effacer ce parcours
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>
        </>
      )}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input
          className="sr-only"
          tabIndex={-1}
          ref={fileInput}
          type="file"
          accept=".json,application/json"
          aria-label="Sauvegarde de reprise à importer"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            try {
              if (file.size > MAX_REPRISE_BYTES)
                throw new Error("La sauvegarde dépasse 24 Ko.");
              setPendingImport(parseWorkPlan(await file.text()));
              setError("");
            } catch (cause) {
              setError(
                cause instanceof Error ? cause.message : "Import impossible.",
              );
            }
          }}
        />
        <Button
          variant="ghost"
          disabled={!ready}
          onClick={() => fileInput.current?.click()}
        >
          <Upload size={16} className="mr-2" aria-hidden="true" />
          Importer une sauvegarde de reprise
        </Button>
        <span className="text-muted-foreground">
          Fichier Darons .json, 24 Ko maximum.
        </span>
      </div>
      <AlertDialog
        open={Boolean(pendingImport)}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Charger ce parcours de reprise ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Il remplacera le parcours ouvert et, si l’enregistrement local est
              activé, sa copie sur cet appareil. Télécharge d’abord ta
              sauvegarde actuelle si tu veux la conserver.
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
              Charger le parcours
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <p className="text-sm text-muted-foreground">
        Besoin des informations de ton enfant pour la personne qui le garde ?{" "}
        <Link className="reprise-link" href="/confiance">
          Retrouve le Carnet de Confiance dans ton espace gratuit.
        </Link>
      </p>
    </div>
  );
}
