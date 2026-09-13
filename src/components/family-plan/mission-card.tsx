"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Clock3 } from "lucide-react";
import {
  getMission,
  OWNERS,
  OWNER_LABELS,
  type MissionOwner,
} from "@/lib/family-plan/catalog";
import {
  calendarDateSchema,
  type MissionState,
} from "@/lib/validators/family-plan";

interface MissionCardProps {
  state: MissionState;
  index: number;
  onChange: (state: MissionState) => void;
}

export function MissionCard({ state, index, onChange }: MissionCardProps) {
  const mission = getMission(state.id);
  const done = state.completed.every(Boolean);
  return (
    <article
      className="plan-mission"
      data-complete={done}
      aria-labelledby={`title-${state.id}`}
    >
      <div className="flex items-start gap-3 sm:gap-5">
        <span className="plan-mission-number" aria-hidden="true">
          {done ? <Check size={22} /> : String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-medium text-secondary">
            <span className="inline-flex items-center gap-1">
              <Clock3 size={14} aria-hidden="true" />
              {mission.minutes} min environ
            </span>
            {done && <span>Action terminée</span>}
          </div>
          <h3
            id={`title-${state.id}`}
            className="text-xl font-serif sm:text-2xl"
          >
            {mission.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {mission.reason}
          </p>
        </div>
      </div>
      <fieldset className="mt-6 space-y-2">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary">
          Préparer · agir · faire le suivi
        </legend>
        {mission.steps.map((item, step) => (
          <label key={item} className="plan-check">
            <input
              type="checkbox"
              checked={state.completed[step]}
              onChange={(event) => {
                const completed = [
                  ...state.completed,
                ] as MissionState["completed"];
                completed[step] = event.target.checked;
                onChange({ ...state, completed });
              }}
            />
            <span
              className={
                state.completed[step]
                  ? "text-muted-foreground line-through"
                  : ""
              }
            >
              {item}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Responsable proposé
          <select
            className="plan-input"
            value={state.owner}
            onChange={(event) =>
              onChange({ ...state, owner: event.target.value as MissionOwner })
            }
          >
            {OWNERS.map((owner) => (
              <option key={owner} value={owner}>
                {OWNER_LABELS[owner]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Jour choisi
          <input
            className="plan-input"
            type="date"
            min="2000-01-01"
            max="2099-12-31"
            value={state.date}
            onChange={(event) => {
              if (
                !event.target.value ||
                calendarDateSchema.safeParse(event.target.value).success
              )
                onChange({ ...state, date: event.target.value });
            }}
          />
        </label>
      </div>
      {mission.href && (
        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          href={mission.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {mission.linkLabel}
          <ArrowUpRight size={15} className="shrink-0" aria-hidden="true" />
          <span className="sr-only">(nouvel onglet)</span>
        </Link>
      )}
    </article>
  );
}
