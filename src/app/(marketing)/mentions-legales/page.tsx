import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions l\u00e9gales",
};

export default function MentionsLegalesPage() {
  return (
    <div className="prose prose-stone max-w-none">
      <h1 className="font-serif">Mentions l\u00e9gales</h1>
      <p className="text-muted-foreground">
        Derni\u00e8re mise \u00e0 jour : 17 mars 2026
      </p>

      <h2>1. \u00c9diteur du site</h2>
      <p>
        <strong>Ma Vie Parentale</strong>
        <br />
        Adresse : Marseille, France
        <br />
        Email : contact@mavieparentale.fr
        <br />
        Directeur de la publication : Mehdi TAMELGHAGHET
      </p>

      <h2>2. H\u00e9bergement</h2>
      <p>
        Le site mavieparentale.fr est h\u00e9berg\u00e9 par :
        <br />
        <strong>Vercel Inc.</strong>
        <br />
        440 N Barranca Ave #4133, Covina, CA 91723, \u00c9tats-Unis
      </p>
      <p>
        Les donn\u00e9es sont stock\u00e9es par :
        <br />
        <strong>Supabase Inc.</strong>
        <br />
        970 Toa Payoh North #07-04, Singapore 318992
        <br />
        Serveurs UE (AWS eu-west, Irlande)
      </p>

      <h2>3. Propri\u00e9t\u00e9 intellectuelle</h2>
      <p>
        L&apos;ensemble du contenu du site (textes, images, graphismes, logo,
        ic\u00f4nes, logiciels) est la propri\u00e9t\u00e9 de Ma Vie Parentale ou de ses
        partenaires. Toute reproduction, m\u00eame partielle, est interdite sans
        autorisation pr\u00e9alable.
      </p>

      <h2>4. Donn\u00e9es personnelles</h2>
      <p>
        Conform\u00e9ment au R\u00e8glement G\u00e9n\u00e9ral sur la Protection des Donn\u00e9es (RGPD)
        et \u00e0 la loi Informatique et Libert\u00e9s, vous disposez d&apos;un droit d&apos;acc\u00e8s,
        de rectification et de suppression de vos donn\u00e9es personnelles. Pour
        exercer ce droit, contactez-nous \u00e0 : contact@mavieparentale.fr
      </p>
      <p>
        Pour plus de d\u00e9tails, consultez notre{" "}
        <a href="/politique-confidentialite">politique de confidentialit\u00e9</a>.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Le site utilise uniquement des cookies fonctionnels n\u00e9cessaires \u00e0 son
        bon fonctionnement (authentification, pr\u00e9f\u00e9rences). Aucun cookie
        publicitaire ou de suivi n&apos;est utilis\u00e9.
      </p>
    </div>
  );
}
