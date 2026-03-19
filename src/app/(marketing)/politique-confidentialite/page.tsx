import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Ma Vie Parentale — traitement des données personnelles, RGPD, droits des utilisateurs, sous-traitants.",
  openGraph: {
    title: "Politique de confidentialité — Ma Vie Parentale",
    description: "Protection des données personnelles et droits RGPD sur Ma Vie Parentale.",
  },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="font-serif">Politique de confidentialité</h1>
      <p className="text-muted-foreground">
        Dernière mise à jour : 17 mars 2026
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Ma Vie Parentale, représenté par Mehdi TAMELGHAGHET, est responsable
        du traitement des données personnelles collectées via le service
        mavieparentale.fr.
        <br />
        Contact DPO : contact@mavieparentale.fr
      </p>

      <h2>2. Données collectées</h2>
      <h3>2.1 Données d&apos;inscription</h3>
      <p>Nom, prénom, adresse email, mot de passe (hashé).</p>

      <h3>2.2 Données du foyer</h3>
      <p>
        Composition familiale (noms, dates de naissance, genre des membres),
        documents d&apos;identité (numéros, dates d&apos;expiration).
      </p>

      <h3>2.3 Données de santé</h3>
      <p>
        Vaccinations, rendez-vous médicaux, mesures de croissance, notes de
        santé. Ces données sont considérées comme sensibles au sens du RGPD
        (article 9) et font l&apos;objet de protections renforcées.
      </p>

      <h3>2.4 Données financières</h3>
      <p>
        Revenus (pour simulation fiscale), dépenses, transactions bancaires
        (si Open Banking activé). Les données bancaires transitent via Bridge
        API (certifié DSP2/ACPR) et ne sont jamais stockées en clair.
      </p>

      <h2>3. Finalités du traitement</h2>
      <ul>
        <li>Gestion du compte utilisateur</li>
        <li>Fourniture des services (suivi santé, budget, fiscal, etc.)</li>
        <li>Alertes et notifications personnalisées</li>
        <li>Amélioration du service (analytics anonymisées)</li>
        <li>Facturation des abonnements payants</li>
      </ul>

      <h2>4. Base légale</h2>
      <ul>
        <li>
          <strong>Consentement</strong> : pour le traitement des données de
          santé, l&apos;Open Banking et les notifications
        </li>
        <li>
          <strong>Exécution du contrat</strong> : pour la fourniture du service
        </li>
        <li>
          <strong>Intérêt légitime</strong> : pour l&apos;amélioration du service
        </li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>
          <strong>Données actives</strong> : tant que le compte existe
        </li>
        <li>
          <strong>Après suppression du compte</strong> : purge complète sous 30
          jours
        </li>
        <li>
          <strong>Backups</strong> : purgés sous 90 jours
        </li>
        <li>
          <strong>Données de facturation</strong> : 10 ans (obligation légale)
        </li>
      </ul>

      <h2>6. Sous-traitants</h2>
      <table>
        <thead>
          <tr>
            <th>Sous-traitant</th>
            <th>Usage</th>
            <th>Localisation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Base de données, authentification</td>
            <td>UE (Irlande)</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Hébergement du site</td>
            <td>UE / US</td>
          </tr>
          <tr>
            <td>Stripe</td>
            <td>Paiements</td>
            <td>UE / US</td>
          </tr>
          <tr>
            <td>Resend</td>
            <td>Emails transactionnels</td>
            <td>US</td>
          </tr>
          <tr>
            <td>Anthropic</td>
            <td>IA (coach budgétaire, alertes)</td>
            <td>US</td>
          </tr>
        </tbody>
      </table>

      <h2>7. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Droit d&apos;accès</strong> : obtenir une copie de vos données
        </li>
        <li>
          <strong>Droit de rectification</strong> : corriger vos données
        </li>
        <li>
          <strong>Droit à l&apos;effacement</strong> : supprimer votre compte et
          toutes vos données
        </li>
        <li>
          <strong>Droit à la portabilité</strong> : exporter vos données en
          format JSON
        </li>
        <li>
          <strong>Droit d&apos;opposition</strong> : vous opposer à certains
          traitements
        </li>
        <li>
          <strong>Droit de retrait du consentement</strong> : retirer votre
          consentement à tout moment
        </li>
      </ul>
      <p>
        Pour exercer ces droits : contact@mavieparentale.fr
        <br />
        Délai de réponse : 30 jours maximum.
      </p>

      <h2>8. Sécurité</h2>
      <ul>
        <li>Chiffrement des données au repos (AES-256)</li>
        <li>Chiffrement en transit (HTTPS / TLS 1.3)</li>
        <li>Isolation des données par foyer (Row Level Security)</li>
        <li>Aucune donnée sensible dans les logs</li>
        <li>Mots de passe hashés (bcrypt)</li>
      </ul>

      <h2>9. Cookies</h2>
      <p>
        Le site utilise uniquement des cookies fonctionnels (session
        d&apos;authentification). Aucun cookie publicitaire ou analytique n&apos;est
        utilisé.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question relative à cette politique :<br />
        Email : contact@mavieparentale.fr
        <br />
        Vous pouvez également adresser une réclamation à la CNIL :
        www.cnil.fr
      </p>
    </div>
  );
}
