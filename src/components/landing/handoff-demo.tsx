"use client";

import { useEffect, useState } from "react";
import { Clock3, LockKeyhole } from "lucide-react";
import { DaronsMark } from "@/components/brand/darons-logo";

export function HandoffDemo() {
  const [ready, setReady] = useState(false);
  const [identity, setIdentity] = useState(true);
  const [routines, setRoutines] = useState(true);
  const [duration, setDuration] = useState("6 heures");
  useEffect(() => setReady(true), []);
  const count = Number(identity) + Number(routines);

  return (
    <div className="handoff-demo">
      <fieldset className="handoff-controls" disabled={!ready}>
        <legend>Essaie : choisis ce que le proche voit</legend>
        <p id="handoff-choice-help">
          Garde au moins une rubrique. Le prénom et la date de naissance restent
          visibles dans le carnet.
        </p>
        <div className="handoff-options">
          <label>
            <input
              type="checkbox"
              checked={identity}
              disabled={identity && count === 1}
              aria-describedby="handoff-choice-help"
              onChange={(event) => setIdentity(event.target.checked)}
            />
            Identité complète
          </label>
          <label>
            <input
              type="checkbox"
              checked={routines}
              disabled={routines && count === 1}
              aria-describedby="handoff-choice-help"
              onChange={(event) => setRoutines(event.target.checked)}
            />
            Notes & routines
          </label>
        </div>
        <label className="handoff-duration">
          Durée d’accès dans cet exemple
          <select
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          >
            <option>6 heures</option>
            <option>24 heures</option>
            <option>3 jours</option>
            <option>7 jours</option>
          </select>
        </label>
      </fieldset>
      <noscript>
        <p className="handoff-no-script">
          Active JavaScript pour modifier cet exemple. Le carnet ci-dessous
          reste consultable.
        </p>
      </noscript>
      <div
        className="handoff-preview"
        role="region"
        aria-label="Ce que le proche verrait"
      >
        <div className="handoff-preview-top">
          <DaronsMark />
          <span>Carnet de Confiance</span>
          <span>Exemple</span>
        </div>
        <h4>Un après-midi chez mamie</h4>
        <p className="handoff-child">Lou · née le 12 mars 2025</p>
        <p className="handoff-preview-caption">
          Ce que le proche verrait après avoir saisi le PIN
        </p>
        <div className="handoff-preview-sections">
          {identity && (
            <div>
              <h5>Identité</h5>
              <p>Lou Martin · née le 12 mars 2025</p>
            </div>
          )}
          {routines && (
            <div>
              <h5>Notes & routines</h5>
              <p>
                Son doudou lapin est dans le sac. Elle adore qu’on lui lise «
                Petit Ours ».
              </p>
            </div>
          )}
        </div>
        <div className="handoff-preview-footer">
          <span>
            <LockKeyhole aria-hidden="true" /> Accès avec un PIN
          </span>
          <span>
            <Clock3 aria-hidden="true" /> {duration}
          </span>
        </div>
      </div>
      <p className="handoff-feedback" role="status">
        {count} rubrique{count > 1 ? "s" : ""} visible{count > 1 ? "s" : ""} ·
        durée choisie : {duration}
      </p>
      <p className="handoff-disclosure">
        Données fictives. Aucun lien créé ni envoyé. Avec ton compte, tu pourras
        créer ton propre carnet, partager son lien et transmettre le PIN
        séparément.
      </p>
    </div>
  );
}
