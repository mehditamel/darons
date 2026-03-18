import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions g\u00e9n\u00e9rales d'utilisation",
};

export default function CguPage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="font-serif">Conditions g\u00e9n\u00e9rales d&apos;utilisation</h1>
      <p className="text-muted-foreground">
        Derni\u00e8re mise \u00e0 jour : 17 mars 2026
      </p>

      <h2>1. Objet</h2>
      <p>
        Les pr\u00e9sentes conditions g\u00e9n\u00e9rales d&apos;utilisation (CGU) r\u00e9gissent
        l&apos;utilisation du service Ma Vie Parentale, accessible \u00e0 l&apos;adresse
        mavieparentale.fr. En vous inscrivant, vous acceptez sans r\u00e9serve
        les pr\u00e9sentes CGU.
      </p>

      <h2>2. Description du service</h2>
      <p>
        Ma Vie Parentale est un tableau de bord familial num\u00e9rique permettant
        de centraliser la gestion administrative, \u00e9ducative, fiscale et
        budg\u00e9taire d&apos;un foyer. Le service propose plusieurs modules :
        suivi de sant\u00e9, gestion de documents, budget, simulation fiscale,
        recherche de garde d&apos;enfants et suivi du d\u00e9veloppement.
      </p>

      <h2>3. Acc\u00e8s au service</h2>
      <p>
        L&apos;acc\u00e8s au service n\u00e9cessite la cr\u00e9ation d&apos;un compte utilisateur.
        L&apos;utilisateur s&apos;engage \u00e0 fournir des informations exactes et \u00e0
        maintenir la confidentialit\u00e9 de ses identifiants de connexion.
      </p>

      <h2>4. Plans tarifaires</h2>
      <p>
        Le service est propos\u00e9 selon trois formules : Gratuit, Premium
        (9,90 \u20ac/mois) et Family Pro (19,90 \u20ac/mois). Les fonctionnalit\u00e9s
        disponibles d\u00e9pendent du plan souscrit. Les tarifs peuvent \u00eatre
        modifi\u00e9s avec un pr\u00e9avis de 30 jours.
      </p>

      <h2>5. Donn\u00e9es personnelles</h2>
      <p>
        Le traitement des donn\u00e9es personnelles est d\u00e9crit dans notre{" "}
        <a href="/politique-confidentialite">politique de confidentialit\u00e9</a>.
        L&apos;utilisateur conserve la propri\u00e9t\u00e9 de ses donn\u00e9es et peut les
        exporter ou les supprimer \u00e0 tout moment.
      </p>

      <h2>6. Donn\u00e9es de sant\u00e9</h2>
      <p>
        Les donn\u00e9es de sant\u00e9 (vaccinations, rendez-vous m\u00e9dicaux, mesures de
        croissance) sont des donn\u00e9es sensibles au sens du RGPD. Elles sont
        chiffr\u00e9es et stock\u00e9es de mani\u00e8re s\u00e9curis\u00e9e. Le service ne constitue
        pas un avis m\u00e9dical et ne se substitue pas \u00e0 un professionnel de sant\u00e9.
      </p>

      <h2>7. Responsabilit\u00e9</h2>
      <p>
        Les simulations fiscales et budg\u00e9taires sont fournies \u00e0 titre indicatif.
        Ma Vie Parentale ne peut \u00eatre tenu responsable des d\u00e9cisions prises
        sur la base de ces informations. Consultez un professionnel pour
        tout conseil fiscal ou juridique.
      </p>

      <h2>8. R\u00e9siliation</h2>
      <p>
        L&apos;utilisateur peut supprimer son compte \u00e0 tout moment depuis les
        param\u00e8tres. La suppression entra\u00eene l&apos;effacement d\u00e9finitif de toutes
        les donn\u00e9es dans un d\u00e9lai de 30 jours. Les abonnements en cours sont
        rembours\u00e9s au prorata.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les pr\u00e9sentes CGU sont soumises au droit fran\u00e7ais. Tout litige sera
        port\u00e9 devant les tribunaux comp\u00e9tents de Marseille.
      </p>
    </div>
  );
}
