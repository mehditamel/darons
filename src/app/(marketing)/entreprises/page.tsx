import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Darons au travail — Le parcours numérique des parents salariés",
  description:
    "Un parcours concret pour préparer la reprise après une naissance : organisation, garde et échange au travail. Découvrez le service disponible et le périmètre entreprise à construire.",
};
export default function EntreprisesPage() {
  return (
    <div className="space-y-10">
      <header className="py-6">
        <p className="family-eyebrow">
          <Building2 size={16} aria-hidden="true" /> Darons au travail ·
          Entreprises & CSE
        </p>
        <h1 className="text-4xl sm:text-5xl font-serif leading-tight mt-5">
          Aider les parents salariés.
          <br />
          <span className="text-secondary">
            Au moment où tout se réorganise.
          </span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground mt-6 max-w-2xl">
          Un retour au travail se prépare avec des horaires compatibles, les
          bonnes questions et des actions concrètes. Darons donne aux parents un
          parcours numérique pour avancer.
        </p>
        <Button asChild size="lg" className="family-button mt-6">
          <Link href="/outils/reprise-travail">
            Essayer le parcours disponible
            <ArrowRight size={16} aria-hidden="true" className="ml-2" />
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground mt-3">
          Gratuit pour les parents, avec ou sans employeur partenaire.
        </p>
      </header>
      <section aria-labelledby="service-title">
        <p className="family-eyebrow">Déjà utilisable</p>
        <h2 id="service-title" className="text-2xl font-serif mt-3">
          Un service qui produit quelque chose d’utile.
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 mt-5">
          {[
            {
              icon: CalendarCheck,
              title: "Un bilan d’organisation",
              text: "Les horaires de travail, les trajets et la garde sont rapprochés, jour par jour. Les créneaux non couverts et les informations manquantes sont visibles.",
            },
            {
              icon: ClipboardCheck,
              title: "Un plan jusqu’à la reprise",
              text: "Six étapes datées, modifiables et exportables dans un agenda personnel. Le parent peut enregistrer et reprendre son parcours sur son appareil.",
            },
            {
              icon: ShieldCheck,
              title: "Un échange mieux préparé",
              text: "Un document à relire et à transmettre soi-même aux RH ou au manager. Il reprend les sujets choisis, sans détailler la garde ou les proches.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="border rounded-2xl p-5 bg-card"
            >
              <item.icon
                size={24}
                className="text-secondary"
                aria-hidden="true"
              />
              <h3 className="font-semibold mt-4">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground mt-3">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
      <section
        className="border rounded-3xl p-6 sm:p-8 bg-secondary/5"
        aria-labelledby="offer-title"
      >
        <p className="family-eyebrow">Le programme entreprise à construire</p>
        <h2 id="offer-title" className="text-2xl font-serif mt-3">
          Vos dispositifs, au bon endroit dans le parcours.
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          L’offre professionnelle envisagée financera un portail propre à
          l’entreprise, administré par les RH : aides réellement proposées,
          contacts utiles, règles internes, étapes d’accueil du parent et mises
          à jour. Le service sera entièrement numérique.
        </p>
        <ul className="space-y-3 mt-5 text-sm list-disc pl-5">
          <li>
            Une page de ressources validées et mises à jour par votre
            organisation.
          </li>
          <li>
            Des parcours associés aux moments de vie, avec les bons liens et
            interlocuteurs.
          </li>
          <li>
            Un suivi du déploiement fondé sur des indicateurs collectifs à
            définir, sans accès aux carnets ni aux réponses individuelles.
          </li>
        </ul>
        <p className="mt-5 text-sm font-medium">
          Ce portail RH et ces indicateurs ne sont pas encore disponibles. Aucun
          abonnement professionnel n’est activé sur cette page.
        </p>
      </section>
      <section className="border-t pt-8" aria-labelledby="privacy-title">
        <h2 id="privacy-title" className="text-2xl font-serif">
          Le parent choisit ce qu’il transmet.
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Le parcours actuel fonctionne dans le navigateur du parent, avec une
          sauvegarde locale facultative. L’employeur ne reçoit pas ses réponses,
          son avancement ou ses informations familiales. Le document
          professionnel peut être copié ou téléchargé après relecture.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Un accompagnement numérique d’organisation. Darons ne réserve pas de
          place de garde, ne prend pas de décision RH et ne propose pas de
          consultation humaine.
        </p>
        <Link
          className="mt-5 inline-block text-primary underline underline-offset-4"
          href="/outils/reprise-travail"
        >
          Découvrir ce que le parent obtient
        </Link>
      </section>
    </div>
  );
}
