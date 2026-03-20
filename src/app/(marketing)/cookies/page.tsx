import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description: "Politique de cookies de Darons — cookies fonctionnels uniquement, aucun tracking publicitaire.",
  openGraph: {
    title: "Cookies — Darons",
    description: "Politique de cookies de Darons.",
  },
};

export default function CookiesPage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="font-serif">Politique de cookies</h1>
      <p className="text-muted-foreground">
        Dernière mise à jour : 20 mars 2026
      </p>

      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte déposé sur votre appareil lors de
        la visite d&apos;un site web. Il permet au site de mémoriser certaines
        informations pour faciliter votre navigation.
      </p>

      <h2>2. Les cookies que nous utilisons</h2>
      <p>
        Darons utilise <strong>uniquement des cookies fonctionnels</strong>,
        strictement nécessaires au bon fonctionnement du service :
      </p>
      <table>
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Finalité</th>
            <th>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sb-*-auth-token</code></td>
            <td>Authentification et maintien de votre session</td>
            <td>Durée de la session (max 7 jours)</td>
          </tr>
          <tr>
            <td><code>theme</code></td>
            <td>Mémoriser votre préférence de thème (clair/sombre)</td>
            <td>1 an</td>
          </tr>
          <tr>
            <td><code>cookie-consent</code></td>
            <td>Mémoriser votre choix concernant cette politique</td>
            <td>1 an</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Ce que nous ne faisons pas</h2>
      <ul>
        <li>Aucun cookie publicitaire ou de remarketing</li>
        <li>Aucun cookie de tracking tiers (pas de Google Analytics)</li>
        <li>Aucun cookie de réseau social</li>
        <li>Aucun partage de données de navigation avec des tiers</li>
      </ul>
      <p>
        Si nous utilisons un outil d&apos;analyse (Plausible Analytics), celui-ci
        fonctionne <strong>sans cookies</strong> et dans le respect total du RGPD.
      </p>

      <h2>4. Gestion des cookies</h2>
      <p>
        Les cookies fonctionnels étant strictement nécessaires, ils ne
        requièrent pas votre consentement au sens de la directive ePrivacy.
        Vous pouvez toutefois les bloquer via les paramètres de votre
        navigateur, mais certaines fonctionnalités du service pourraient
        ne plus fonctionner correctement.
      </p>

      <h2>5. Vos droits</h2>
      <p>
        Conformément au RGPD et à la loi Informatique et Libertés, vous
        disposez d&apos;un droit d&apos;accès, de rectification et de suppression
        de vos données. Consultez notre{" "}
        <a href="/politique-confidentialite">politique de confidentialité</a>{" "}
        pour exercer vos droits.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pour toute question relative aux cookies, contactez-nous à
        l&apos;adresse : <strong>contact@darons.app</strong>
      </p>
    </div>
  );
}
