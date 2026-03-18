import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialit\u00e9",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="font-serif">Politique de confidentialit\u00e9</h1>
      <p className="text-muted-foreground">
        Derni\u00e8re mise \u00e0 jour : 17 mars 2026
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Ma Vie Parentale, repr\u00e9sent\u00e9 par Mehdi TAMELGHAGHET, est responsable
        du traitement des donn\u00e9es personnelles collect\u00e9es via le service
        mavieparentale.fr.
        <br />
        Contact DPO : contact@mavieparentale.fr
      </p>

      <h2>2. Donn\u00e9es collect\u00e9es</h2>
      <h3>2.1 Donn\u00e9es d&apos;inscription</h3>
      <p>Nom, pr\u00e9nom, adresse email, mot de passe (hash\u00e9).</p>

      <h3>2.2 Donn\u00e9es du foyer</h3>
      <p>
        Composition familiale (noms, dates de naissance, genre des membres),
        documents d&apos;identit\u00e9 (num\u00e9ros, dates d&apos;expiration).
      </p>

      <h3>2.3 Donn\u00e9es de sant\u00e9</h3>
      <p>
        Vaccinations, rendez-vous m\u00e9dicaux, mesures de croissance, notes de
        sant\u00e9. Ces donn\u00e9es sont consid\u00e9r\u00e9es comme sensibles au sens du RGPD
        (article 9) et font l&apos;objet de protections renforc\u00e9es.
      </p>

      <h3>2.4 Donn\u00e9es financi\u00e8res</h3>
      <p>
        Revenus (pour simulation fiscale), d\u00e9penses, transactions bancaires
        (si Open Banking activ\u00e9). Les donn\u00e9es bancaires transitent via Bridge
        API (certifi\u00e9 DSP2/ACPR) et ne sont jamais stock\u00e9es en clair.
      </p>

      <h2>3. Finalit\u00e9s du traitement</h2>
      <ul>
        <li>Gestion du compte utilisateur</li>
        <li>Fourniture des services (suivi sant\u00e9, budget, fiscal, etc.)</li>
        <li>Alertes et notifications personnalis\u00e9es</li>
        <li>Am\u00e9lioration du service (analytics anonymis\u00e9es)</li>
        <li>Facturation des abonnements payants</li>
      </ul>

      <h2>4. Base l\u00e9gale</h2>
      <ul>
        <li>
          <strong>Consentement</strong> : pour le traitement des donn\u00e9es de
          sant\u00e9, l&apos;Open Banking et les notifications
        </li>
        <li>
          <strong>Ex\u00e9cution du contrat</strong> : pour la fourniture du service
        </li>
        <li>
          <strong>Int\u00e9r\u00eat l\u00e9gitime</strong> : pour l&apos;am\u00e9lioration du service
        </li>
      </ul>

      <h2>5. Dur\u00e9e de conservation</h2>
      <ul>
        <li>
          <strong>Donn\u00e9es actives</strong> : tant que le compte existe
        </li>
        <li>
          <strong>Apr\u00e8s suppression du compte</strong> : purge compl\u00e8te sous 30
          jours
        </li>
        <li>
          <strong>Backups</strong> : purg\u00e9s sous 90 jours
        </li>
        <li>
          <strong>Donn\u00e9es de facturation</strong> : 10 ans (obligation l\u00e9gale)
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
            <td>Base de donn\u00e9es, authentification</td>
            <td>UE (Irlande)</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>H\u00e9bergement du site</td>
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
            <td>IA (coach budg\u00e9taire, alertes)</td>
            <td>US</td>
          </tr>
        </tbody>
      </table>

      <h2>7. Vos droits</h2>
      <p>Conform\u00e9ment au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Droit d&apos;acc\u00e8s</strong> : obtenir une copie de vos donn\u00e9es
        </li>
        <li>
          <strong>Droit de rectification</strong> : corriger vos donn\u00e9es
        </li>
        <li>
          <strong>Droit \u00e0 l&apos;effacement</strong> : supprimer votre compte et
          toutes vos donn\u00e9es
        </li>
        <li>
          <strong>Droit \u00e0 la portabilit\u00e9</strong> : exporter vos donn\u00e9es en
          format JSON
        </li>
        <li>
          <strong>Droit d&apos;opposition</strong> : vous opposer \u00e0 certains
          traitements
        </li>
        <li>
          <strong>Droit de retrait du consentement</strong> : retirer votre
          consentement \u00e0 tout moment
        </li>
      </ul>
      <p>
        Pour exercer ces droits : contact@mavieparentale.fr
        <br />
        D\u00e9lai de r\u00e9ponse : 30 jours maximum.
      </p>

      <h2>8. S\u00e9curit\u00e9</h2>
      <ul>
        <li>Chiffrement des donn\u00e9es au repos (AES-256)</li>
        <li>Chiffrement en transit (HTTPS / TLS 1.3)</li>
        <li>Isolation des donn\u00e9es par foyer (Row Level Security)</li>
        <li>Aucune donn\u00e9e sensible dans les logs</li>
        <li>Mots de passe hash\u00e9s (bcrypt)</li>
      </ul>

      <h2>9. Cookies</h2>
      <p>
        Le site utilise uniquement des cookies fonctionnels (session
        d&apos;authentification). Aucun cookie publicitaire ou analytique n&apos;est
        utilis\u00e9.
      </p>

      <h2>10. Contact</h2>
      <p>
        Pour toute question relative \u00e0 cette politique :<br />
        Email : contact@mavieparentale.fr
        <br />
        Vous pouvez \u00e9galement adresser une r\u00e9clamation \u00e0 la CNIL :
        www.cnil.fr
      </p>
    </div>
  );
}
