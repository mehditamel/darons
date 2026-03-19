import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "CGU de Darons — conditions d'utilisation du service, responsabilités, résiliation.",
  openGraph: {
    title: "CGU — Darons",
    description: "Conditions générales d'utilisation de Darons.",
  },
};

export default function CguPage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="font-serif">Conditions générales d&apos;utilisation</h1>
      <p className="text-muted-foreground">
        Dernière mise à jour : 19 mars 2026
      </p>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales d&apos;utilisation (CGU) régissent
        l&apos;utilisation du service Darons, accessible à l&apos;adresse
        darons.app. En vous inscrivant, vous acceptez sans réserve
        les présentes CGU.
      </p>

      <h2>2. Description du service</h2>
      <p>
        Darons est une application gratuite pour les parents permettant
        de centraliser la gestion administrative, éducative, fiscale et
        budgétaire d&apos;un foyer. Le service propose plusieurs modules :
        suivi de santé, gestion de documents, budget, simulation fiscale,
        recherche de garde d&apos;enfants et suivi du développement.
      </p>

      <h2>3. Accès au service</h2>
      <p>
        L&apos;accès au service nécessite la création d&apos;un compte utilisateur.
        L&apos;utilisateur s&apos;engage à fournir des informations exactes et à
        maintenir la confidentialité de ses identifiants de connexion.
      </p>

      <h2>4. Gratuité du service</h2>
      <p>
        Darons est gratuit. Des options premium pourront être proposées
        ultérieurement sans jamais restreindre les fonctionnalités de base.
        Les tarifs éventuels peuvent être modifiés avec un préavis de 30 jours.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Le traitement des données personnelles est décrit dans notre{" "}
        <a href="/politique-confidentialite">politique de confidentialité</a>.
        L&apos;utilisateur conserve la propriété de ses données et peut les
        exporter ou les supprimer à tout moment.
      </p>

      <h2>6. Données de santé</h2>
      <p>
        Les données de santé (vaccinations, rendez-vous médicaux, mesures de
        croissance) sont des données sensibles au sens du RGPD. Elles sont
        chiffrées et stockées de manière sécurisée. Le service ne constitue
        pas un avis médical et ne se substitue pas à un professionnel de santé.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Les simulations fiscales et budgétaires sont fournies à titre indicatif.
        Darons ne peut être tenu responsable des décisions prises
        sur la base de ces informations. Consultez un professionnel pour
        tout conseil fiscal ou juridique.
      </p>

      <h2>8. Résiliation</h2>
      <p>
        L&apos;utilisateur peut supprimer son compte à tout moment depuis les
        paramètres. La suppression entraîne l&apos;effacement définitif de toutes
        les données dans un délai de 30 jours.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes CGU sont soumises au droit français. Tout litige sera
        porté devant les tribunaux compétents de Marseille.
      </p>
    </div>
  );
}
