export const STAGES = ["expecting", "newborn", "baby", "toddler"] as const;
export const FOCUSES = ["arrival", "rest", "money", "care"] as const;
export type FamilyStage = (typeof STAGES)[number];
export type FamilyFocus = (typeof FOCUSES)[number];

export const STAGE_LABELS: Record<FamilyStage, string> = {
  expecting: "Bébé arrive bientôt",
  newborn: "Les premiers mois · 0–6 mois",
  baby: "Bébé grandit · 6–18 mois",
  toddler: "Les premières aventures · 18 mois–3 ans",
};
export const FOCUS_LABELS: Record<FamilyFocus, string> = {
  arrival: "Préparer les prochaines étapes",
  rest: "Souffler et passer le relais",
  money: "Y voir plus clair dans le budget",
  care: "Organiser la garde et la reprise",
};
export const OWNERS = ["undecided", "me", "support", "together"] as const;
export type MissionOwner = (typeof OWNERS)[number];
export const OWNER_LABELS: Record<MissionOwner, string> = {
  undecided: "À décider",
  me: "Moi",
  support: "Mon relais",
  together: "Ensemble",
};

export interface FamilyMission {
  id: string;
  title: string;
  minutes: number;
  focus: FamilyFocus;
  stages: readonly FamilyStage[];
  reason: string;
  steps: readonly [string, string, string];
  href?: string;
  linkLabel?: string;
}

// Editorial suggestions, not legal deadlines or medical recommendations.
export const MISSIONS: readonly FamilyMission[] = [
  {
    id: "arrival-paperwork",
    title: "Choisir la première démarche pour bébé",
    minutes: 10,
    focus: "arrival",
    stages: ["expecting", "newborn"],
    reason:
      "Autour de la naissance, commencer par une seule démarche aide à avancer sans tout traiter à la fois.",
    steps: [
      "Ouvrir la checklist naissance et repérer une démarche adaptée à votre situation.",
      "Noter les pièces nécessaires et vérifier le délai auprès de l’organisme concerné.",
      "Choisir qui prend en charge la démarche et son suivi.",
    ],
    href: "/outils/checklist-naissance",
    linkLabel: "Ouvrir la checklist naissance",
  },
  {
    id: "growing-next-step",
    title: "Préparer la prochaine petite transition",
    minutes: 10,
    focus: "arrival",
    stages: ["baby", "toddler"],
    reason:
      "Quand bébé grandit, une transition à la fois suffit : nouveau rythme, accueil ou activité.",
    steps: [
      "Choisir le changement qui approche vraiment pour votre enfant.",
      "Écrire une question à poser à la personne qui vous accompagne.",
      "Décider qui la contacte et quand faire le point sur sa réponse.",
    ],
    href: "/outils/timeline-administrative",
    linkLabel: "Explorer les étapes de la vie de parent",
  },
  {
    id: "first-days-support",
    title: "Organiser un relais pour les premiers jours",
    minutes: 10,
    focus: "rest",
    stages: ["expecting", "newborn"],
    reason:
      "Une aide précise est plus facile à organiser qu’un « si tu as besoin ». Un proche peut aussi être le relais.",
    steps: [
      "Choisir une aide concrète : repas, courses ou une tâche du quotidien.",
      "Proposer à une personne de confiance de s’en occuper, préparation comprise.",
      "Confirmer ensemble le jour et ce dont elle aura besoin pour être autonome.",
    ],
  },
  {
    id: "weekly-support",
    title: "Confier une tâche du début à la fin",
    minutes: 10,
    focus: "rest",
    stages: ["baby", "toddler"],
    reason:
      "Le relais peut prendre en charge la préparation et le suivi, pour éviter de rester la personne qui pense à tout.",
    steps: [
      "Choisir une tâche récurrente qui prend de la place dans ta tête.",
      "Définir avec ton relais ce que « terminé » veut dire, préparation comprise.",
      "Transmettre les informations utiles et convenir d’un seul point de suivi.",
    ],
  },
  {
    id: "breathing-space",
    title: "Réserver un petit moment pour toi",
    minutes: 5,
    focus: "rest",
    stages: STAGES,
    reason:
      "Le plan peut aussi servir à protéger une pause. Il n’a pas besoin d’être rempli de démarches.",
    steps: [
      "Choisir un moment réaliste dans la semaine, même court.",
      "Prévoir le relais nécessaire si tu en as un, ou adapter le moment à ta situation.",
      "Bloquer ce moment et décider ce que tu aimerais en faire.",
    ],
  },
  {
    id: "baby-budget",
    title: "Faire le point sur une dépense de bébé",
    minutes: 10,
    focus: "money",
    stages: STAGES,
    reason:
      "Une dépense concrète donne un premier point d’appui pour comprendre le budget qui change avec bébé.",
    steps: [
      "Choisir un poste à examiner : garde, équipement ou dépenses courantes.",
      "Comparer son montant prévu avec le budget disponible à l’aide du simulateur.",
      "Décider d’une seule action et noter qui vérifie le résultat.",
    ],
    href: "/outils/simulateur-budget",
    linkLabel: "Ouvrir le budget familial",
  },
  {
    id: "benefits-check",
    title: "Repérer une aide à vérifier",
    minutes: 10,
    focus: "money",
    stages: STAGES,
    reason:
      "L’arrivée d’un enfant peut changer la situation du foyer. Les simulations donnent des pistes à confirmer.",
    steps: [
      "Rassembler les informations demandées par le simulateur d’aides.",
      "Repérer une aide qui mérite une vérification, sans considérer l’estimation comme un droit acquis.",
      "Confier la vérification des conditions et des démarches auprès de l’organisme concerné.",
    ],
    href: "/outils/mes-droits",
    linkLabel: "Explorer les aides possibles",
  },
  {
    id: "parental-leave",
    title: "Préparer une question sur la reprise",
    minutes: 10,
    focus: "care",
    stages: ["expecting", "newborn"],
    reason:
      "Clarifier une question sur le congé ou la reprise peut débloquer l’organisation des mois à venir.",
    steps: [
      "Choisir le point à clarifier : rythme, congé ou organisation de la reprise.",
      "Lister les options à explorer avec le simulateur, puis les questions à confirmer.",
      "Choisir qui contacte l’interlocuteur compétent et quand relire sa réponse.",
    ],
    href: "/outils/conge-parental",
    linkLabel: "Explorer le congé parental",
  },
  {
    id: "childcare-questions",
    title: "Préparer le prochain échange sur la garde",
    minutes: 10,
    focus: "care",
    stages: ["baby", "toddler"],
    reason:
      "Quelques questions préparées ensemble rendent le prochain échange avec un mode d’accueil plus utile.",
    steps: [
      "Noter vos besoins concrets : horaires, trajet et jours d’accueil.",
      "Choisir trois questions pour la structure ou la personne contactée.",
      "Désigner qui prend contact et rassemble les réponses pour décider ensemble.",
    ],
    href: "/outils/simulateur-garde",
    linkLabel: "Comparer les coûts de garde",
  },
  {
    id: "childcare-cost",
    title: "Comparer deux pistes de garde",
    minutes: 15,
    focus: "care",
    stages: STAGES,
    reason:
      "Comparer deux possibilités avec les mêmes besoins rend le choix plus lisible.",
    steps: [
      "Choisir deux modes de garde et un même nombre d’heures pour les comparer.",
      "Estimer leur coût dans le simulateur, puis noter les tarifs et disponibilités à confirmer.",
      "Choisir une piste à approfondir et qui demande les informations manquantes.",
    ],
    href: "/outils/simulateur-garde",
    linkLabel: "Ouvrir le comparateur de garde",
  },
  {
    id: "useful-documents",
    title: "Rassembler trois documents utiles",
    minutes: 5,
    focus: "arrival",
    stages: STAGES,
    reason:
      "Retrouver les mêmes informations facilement peut simplifier la prochaine démarche.",
    steps: [
      "Choisir trois documents utiles à une démarche déjà prévue.",
      "Vérifier où ils se trouvent et s’ils sont lisibles et à jour.",
      "Indiquer à la personne responsable comment les retrouver de façon sûre.",
    ],
  },
  {
    id: "equipment-list",
    title: "Trier les achats avant de commander",
    minutes: 5,
    focus: "money",
    stages: STAGES,
    reason:
      "Distinguer ce qui sert maintenant de ce qui peut attendre aide à choisir le prochain achat.",
    steps: [
      "Choisir trois achats envisagés pour bébé.",
      "Distinguer les besoins actuels de ceux qui peuvent attendre, selon votre situation.",
      "Fixer une limite de budget pour le prochain achat et qui compare les options.",
    ],
  },
];

export function getMission(id: string): FamilyMission {
  const mission = MISSIONS.find((item) => item.id === id);
  if (!mission) throw new Error("Action inconnue dans le plan.");
  return mission;
}

export function selectMissions(profile: {
  stages: FamilyStage[];
  focus: FamilyFocus;
  minutes: number;
}): FamilyMission[] {
  const eligible = MISSIONS.filter(
    (mission) =>
      mission.focus === profile.focus &&
      mission.stages.some((stage) => profile.stages.includes(stage)),
  );
  const score = (mission: FamilyMission) =>
    mission.stages.length < STAGES.length ? 10 : 0;
  const ranked = eligible
    .map((mission, index) => ({ mission, index }))
    .sort((a, b) => score(b.mission) - score(a.mission) || a.index - b.index);
  let remaining = profile.minutes;
  const selected: FamilyMission[] = [];
  for (const { mission } of ranked) {
    if (selected.length === 3) break;
    if (mission.minutes > remaining) continue;
    selected.push(mission);
    remaining -= mission.minutes;
  }
  return selected;
}
