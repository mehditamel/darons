import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Darons — éditeur, hébergeur, DPO, conditions d'accès au service.",
  openGraph: {
    title: "Mentions légales — Darons",
    description: "Informations légales de Darons.",
  },
};

export default function MentionsLegalesPage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="font-serif">Mentions légales</h1>
      <p className="text-muted-foreground">
        Dernière mise à jour : 19 mars 2026
      </p>

      <h2>1. Éditeur du site</h2>
      <p>
        <strong>Darons</strong>
        <br />
        Adresse : Marseille, France
        <br />
        Email : contact@darons.app
        <br />
        Directeur de la publication : Mehdi TAMELGHAGHET
      </p>

      <h2>2. Hébergement</h2>
      <p>
        Le site darons.app est hébergé par :
        <br />
        <strong>Vercel Inc.</strong>
        <br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
      </p>
      <p>
        Les données sont stockées par :
        <br />
        <strong>Supabase Inc.</strong>
        <br />
        970 Toa Payoh North #07-04, Singapore 318992
        <br />
        Serveurs UE (AWS eu-west, Irlande)
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du site (textes, images, graphismes, logo,
        icônes, logiciels) est la propriété de Darons ou de ses
        partenaires. Toute reproduction, même partielle, est interdite sans
        autorisation préalable.
      </p>

      <h2>4. Données personnelles</h2>
      <p>
        Conformément au Règlement Général sur la Protection des Données (RGPD)
        et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès,
        de rectification et de suppression de vos données personnelles. Pour
        exercer ce droit, contactez-nous à : contact@darons.app
      </p>
      <p>
        Pour plus de détails, consultez notre{" "}
        <a href="/politique-confidentialite">politique de confidentialité</a>.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Le site utilise uniquement des cookies fonctionnels nécessaires à son
        bon fonctionnement (authentification, préférences). Aucun cookie
        publicitaire ou de suivi n&apos;est utilisé.
      </p>
    </div>
  );
}
