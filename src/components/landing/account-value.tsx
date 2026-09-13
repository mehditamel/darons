import Link from "next/link";
import { ArrowRight, Baby, CalendarDays, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Baby,
    title: "Tu gardes une trace",
    text: "Le profil de ton enfant, les mesures et les documents que tu ajoutes restent dans ton espace familial.",
  },
  {
    icon: CalendarDays,
    title: "Tu retrouves la suite",
    text: "À ta prochaine visite, ton tableau de bord rassemble les rendez-vous enregistrés et les échéances à suivre.",
  },
  {
    icon: HandHeart,
    title: "Tu passes le relais",
    text: "Dans le Carnet de Confiance, choisis les infos à partager avec un proche, pour une durée limitée et avec un PIN.",
  },
];

export function AccountValue() {
  return (
    <section className="account-value" aria-labelledby="account-value-title">
      <div className="account-value-heading">
        <p className="family-eyebrow">Pourquoi un compte ?</p>
        <h2 id="account-value-title">
          Ses infos aujourd’hui.
          <br />
          <span className="text-secondary">Encore utiles demain.</span>
        </h2>
        <p>
          Les outils gratuits répondent à une question ponctuelle. Ton compte
          garde les informations que tu enregistres dans les modules de ton
          foyer, pour les prochaines fois.
        </p>
      </div>
      <div className="account-value-grid">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <Icon aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="account-value-start">
        <div>
          <h3>Commence par un seul besoin.</h3>
          <p>
            Confirme ton email, crée ton foyer et le profil de ton enfant. Puis
            ouvre le Carnet de Confiance pour préparer un premier relais. Le
            reste peut attendre.
          </p>
        </div>
        <Button asChild size="lg" className="family-button">
          <Link href="/register">
            Créer mon espace gratuit
            <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <p className="account-value-footnote">
        Les essais publics ne sont pas transférés automatiquement dans ton
        compte. Mon plan Darons reste enregistré sur ton appareil si tu actives
        sa sauvegarde.
      </p>
    </section>
  );
}
