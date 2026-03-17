# CLAUDE.md — Cockpit Parental (cockpitparental.fr)

> Ce fichier est lu par Claude Code à chaque session. Il constitue la référence unique du projet.
> Dernière mise à jour : 17 mars 2026

---

## 1. Vision & contexte

**Cockpit Parental** est un tableau de bord familial unifié permettant aux parents de centraliser la gestion administrative, éducative, fiscale et budgétaire de leur foyer.

**Positionnement** : Il n'existe pas de solution intégrée sur le marché français combinant ces 4 piliers. Les apps existantes sont verticales (Mon Enfant / CAF, Carnet de Santé numérique, Bankin). Le cockpit unifié + couche IA pour alertes proactives est le différenciateur clé.

**Stratégie** : SaaS dès le lancement. Le produit est conçu d'emblée pour être multi-utilisateurs et commercialisé. Le foyer TAMELGHAGHET sert de jeu de données de test et de beta interne, mais l'architecture, l'onboarding et le modèle économique sont pensés pour le marché dès le jour 1.

**Domaine** : cockpitparental.fr

**Porteur** : Mehdi TAMELGHAGHET — mehdi@tamel.fr
Fondateur de Centres d'Affaires TAMEL (Marseille), concepteur des cockpits Patrimonial et Entrepreneur.

---

## 2. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | SSR/SSG, routing file-based, API routes intégrées |
| **Langage** | TypeScript (strict) | Typage exhaustif, cohérence avec Cockpit Patrimonial |
| **Styling** | Tailwind CSS 3 | Utility-first, design system rapide |
| **UI Components** | shadcn/ui | Composants accessibles, personnalisables, pas de vendor lock |
| **Backend / BaaS** | Supabase | Auth, PostgreSQL, RLS, Storage, Edge Functions, Realtime |
| **Auth** | Supabase Auth | Email/password + magic link, extensible OAuth/France Connect |
| **Stockage fichiers** | Supabase Storage | Coffre-fort numérique (documents famille, scans) |
| **IA** | Anthropic API (Claude) | Alertes proactives, suggestions, analyse fiscale |
| **Paiement** | Stripe | Abonnements SaaS (phase commercialisation) |
| **Hébergement** | Vercel | Déploiement Next.js natif, preview branches |
| **Emails** | Resend ou Brevo | Notifications, rappels, alertes |
| **Charts** | Recharts | Courbes croissance, graphiques budget, évolution fiscale |
| **Formulaires** | React Hook Form + Zod | Validation côté client + serveur, schémas partagés |

---

## 3. Modules fonctionnels (par priorité)

### Module 1 — Administratif (priorité haute)

**1.1 Identité & documents**
- Registre des membres du foyer (adultes + enfants)
- Suivi pièces d'identité : CNI, passeport, livret de famille, acte naissance
- Alertes d'expiration automatiques (6 mois avant, 3 mois, 1 mois)
- Statut : valide / à renouveler / expiré
- Données initiales foyer : Mehdi (né 15/03/1990), Yasmine (née 15/05/1993), Matis (né 10/03/2025)

**1.2 Santé & vaccinations**
- Calendrier vaccinal français (9 vaccins obligatoires + recommandés)
- Suivi doses administrées avec dates et rappels automatiques
- Courbes de croissance (poids, taille, périmètre crânien) — percentiles OMS
- Carnet de RDV médicaux (pédiatre, spécialistes, urgences)
- Allergies et antécédents

**1.3 Coffre-fort numérique**
- Upload et stockage sécurisé de documents (Supabase Storage)
- Catégorisation : identité, santé, fiscal, scolaire, CAF, assurance
- Recherche full-text sur métadonnées
- Partage temporaire de documents (lien signé avec expiration)

### Module 2 — Éducatif

**2.1 Scolarité**
- Timeline prévisionnelle : crèche → maternelle → primaire → collège
- Dates clés d'inscription (ex : rentrée PS septembre 2028 pour Matis)
- Suivi notes et bulletins (à partir de la primaire)
- Contacts établissements et enseignants

**2.2 Activités & loisirs**
- Catalogue d'activités en cours (bébé nageur, éveil musical, etc.)
- Suggestions par tranche d'âge (données éducatives)
- Planning hebdomadaire
- Historique et progression

**2.3 Développement**
- Jalons motricité / langage / cognition par âge (référentiel OMS/HAS)
- Barres de progression visuelles
- Journal parental (notes libres avec date)
- Alertes si retard détecté vs référentiel

### Module 3 — Fiscal

- Simulation impôt sur le revenu (barème progressif, quotient familial)
- Détail des avantages : demi-part enfant, crédit garde d'enfants (max 1 750 €), crédit emploi à domicile, réduction dons
- Calcul TMI et taux effectif
- Échéancier fiscal annuel (déclaration, acomptes, solde)
- Comparateur avant/après optimisation
- Données initiales : 2,5 parts, TMI 30%, ~3 850 € d'économie estimée

### Module 4 — Budget familial

- Ventilation dépenses par poste et par enfant
- Suivi allocations CAF (PAJE, CMG, allocation rentrée scolaire)
- Calcul reste à charge net mensuel
- Graphiques évolution mensuelle
- Catégories : alimentation, santé, garde, vêtements, loisirs, scolarité, transport
- Données initiales : ~1 245 €/mois dépenses enfant, 532 €/mois allocations CAF

### Module 5 — Recherche de garde (inspiré Mon Enfant / CAF)

- Recherche géolocalisée de modes de garde : crèches, assistantes maternelles, MAM, accueils de loisirs, relais petite enfance
- Filtres : distance, disponibilité, tarif estimé, horaires
- Simulateur coût de garde : estimation reste à charge après CMG selon revenus et mode de garde
- Simulateur PAJE complet : prime naissance, allocation de base, CMG
- Fiche détaillée par structure : capacité, activités proposées, contacts, avis
- Carte interactive avec les structures autour du domicile ou du lieu de travail
- Source de données : API monenfant.fr (scraping structuré si pas d'API ouverte) + données open data CAF

### Module 6 — Santé enrichie (inspiré Mon Espace Santé / Carnet de santé 2025)

- 20 examens de santé obligatoires détaillés (nouveau carnet 2025) avec rappels automatiques par âge
- Score d'Apgar (1, 5 et 10 min) pour les nouveau-nés
- Repérage troubles neurodéveloppementaux : grilles d'observation simplifiées par âge (motricité, langage, attention, interactions sociales)
- Suivi exposition aux écrans : questionnaire intégré à partir de 3 mois (recommandations carnet 2025)
- Suivi activité physique de l'enfant à partir de 2 ans
- Journal quotidien enrichi : humeur (pictogrammes soleil/nuage), sommeil, appétit, selles (nourrisson)
- Courbes de croissance avec âge corrigé pour les prématurés
- Allergies et intolérances avec alerte croisée (ex : allergie arachide → alerte sur compositions alimentaires)
- Ordonnances numérisées : photo/scan avec OCR pour extraction médicaments
- Messagerie santé : rappels RDV, préparation de questions pour le pédiatre
- Numéros d'urgence intégrés : 15 (SAMU), 112, 114, centre antipoison, SOS Médecins
- Dématérialisation carnet de santé : synchronisation future avec Mon Espace Santé (API FHIR/HL7 — prévu fin 2026)

### Module 7 — Budget intelligent (inspiré Bankin' / Linxo)

- Agrégation bancaire via Open Banking (Bridge API ou Powens) : synchronisation automatique des comptes
- Catégorisation automatique des transactions par IA : alimentation, garde, santé, vêtements, loisirs enfant, scolarité, transport
- Catégories personnalisables par l'utilisateur (sous-catégories enfant par enfant)
- Budget prévisionnel à 30 jours glissants (algorithme dépenses récurrentes)
- Calcul du "reste à vivre" quotidien après charges fixes
- Alertes intelligentes : dépense inhabituelle, risque de découvert, dépassement budget catégorie
- Objectifs d'épargne : visualisation progression vers un objectif (vacances, rentrée, activités)
- Coach budgétaire IA : suggestions personnalisées d'économies basées sur l'historique
- Graphiques temporels : vue mensuelle, trimestrielle, annuelle, comparaison N/N-1
- Export CSV/PDF des données pour comptable ou déclaration
- Arrondi épargne automatique : option d'arrondir chaque dépense et mettre la différence en épargne
- Partage budget couple : tableau de bord commun Mehdi + Yasmine avec rôles (pilote / lecteur)
- Dépenses partagées type Tricount/Splitwise intégré pour les sorties famille/amis

### Module 8 — Démarches & droits (inspiré service-public.fr / mesdroitssociaux.gouv.fr)

- Checklist démarches grossesse → 3 ans : frise chronologique interactive (déclaration grossesse, congé maternité/paternité, inscription crèche, déclaration naissance CAF, demande PAJE, inscription école...)
- Simulateur de droits sociaux : allocations familiales, APL, prime d'activité, RSA, ASF selon composition foyer et revenus
- Rappels automatiques d'échéances administratives : renouvellement CMG, déclaration revenus CAF, inscription scolaire, demande de bourse
- Guide des droits par âge de l'enfant : à quel âge quel droit/obligation (12 ans carte de retrait, 15 ans apprentissage, 16 ans émancipation...)
- Modèles de courriers et formulaires pré-remplis (attestation employeur, demande de dérogation scolaire, courrier CAF)

---

## 3bis. Intégrations API & sources de données

### Open Banking — Budget automatisé

| Fournisseur | Usage | Coût estimé | Priorité |
|---|---|---|---|
| **Bridge API** (by Bankin') | Agrégation comptes bancaires, catégorisation transactions (98% auto), initiation virements | ~0,15-0,50 €/connexion/mois | Phase 4 |
| **Powens** (ex-Budget Insight) | Alternative Bridge — 1 800 banques connectées, 99,5% taux succès, agrégation patrimoine étendue | Sur devis | Alternative |
| **Plaid** | Alternative internationale — 100% API DSP2 | Sur devis | Futur (expansion EU) |

> **Recommandation** : Bridge API en priorité (leader français, marque B2B de Bankin', certification DSP2 + ACPR, bonne doc). Abstraire l'intégration derrière une interface pour pouvoir changer de provider sans refonte.

### Données publiques françaises (api.gouv.fr)

| API | Données accessibles | Accès | Usage dans le cockpit |
|---|---|---|---|
| **API Particulier** (DINUM) | Quotient familial CAF/MSA, composition familiale, adresse | Réservé acteurs publics — nécessite habilitation | Pré-remplissage données foyer, simulation droits |
| **API Impôt Particulier** (DGFiP) | Revenu fiscal de référence, nombre de parts, montant IR | Réservé acteurs publics | Pré-remplissage module fiscal |
| **Cafdata** (data.caf.fr) | Open data statistique : barèmes prestations, données territoriales | Ouvert à tous | Barèmes allocations à jour, données comparatives |
| **API Géo** (geo.api.gouv.fr) | Communes, codes postaux, départements, géolocalisation | Ouvert à tous | Géolocalisation foyer, recherche structures |
| **API Adresse** (api-adresse.data.gouv.fr) | Géocodage, autocomplétion adresse | Ouvert à tous | Saisie adresse, localisation domicile/travail |
| **API Annuaire Entreprises** | Données entreprises (SIREN/SIRET) | Ouvert à tous | Vérification assistante maternelle, structures garde |
| **API Annuaire Éducation** | Liste des établissements scolaires français | Ouvert à tous | Recherche écoles, collèges par commune |
| **Base Sirene** (INSEE) | Répertoire entreprises et établissements | Ouvert à tous | Enrichissement données structures d'accueil |

### Santé

| API / Source | Données accessibles | Accès | Usage |
|---|---|---|---|
| **Mon Espace Santé** (API FHIR/HL7) | DMP, documents santé, vaccinations, mesures | Référencement obligatoire ANS — complexe | Phase future : synchronisation carnet vaccinal et courbes |
| **Calendrier vaccinal** (solidarites-sante.gouv.fr) | PDF/données structurées du calendrier officiel | Ouvert | Référentiel vaccins obligatoires et recommandés |
| **API Annuaire Santé** (annuaire.sante.fr) | Annuaire des professionnels de santé (RPPS) | Ouvert | Recherche pédiatres, spécialistes près du domicile |
| **Courbes OMS** (who.int) | Données percentiles croissance (poids, taille, PC) | Ouvert | Référentiel courbes de croissance |
| **OpenMedic** (data.gouv.fr) | Données sur les médicaments | Ouvert | Base médicaments pour ordonnances numérisées |

### Garde d'enfants & petite enfance

| Source | Données | Usage |
|---|---|---|
| **monenfant.fr** (CAF) | Crèches, assistantes maternelles, MAM, accueils de loisirs, relais petite enfance | Recherche et carte interactive des modes de garde |
| **data.caf.fr** | Données statistiques EAJE par département | Contexte : nb de places disponibles par zone |
| **API Mon Enfant** | Disponibilités, tarifs, horaires structures | Scraping structuré (pas d'API publique documentée) |

### Fiscalité

| Source | Données | Usage |
|---|---|---|
| **Barèmes DGFiP** (bofip.impots.gouv.fr) | Barème IR, plafonds crédits/réductions, décote | Moteur de simulation IR |
| **data.economie.gouv.fr** | Données fiscales open data, statistiques | Comparaison foyer vs moyenne nationale |
| **Simulateur impots.gouv.fr** | Calcul officiel IR (pas d'API — scraping ou recalcul interne) | Validation du moteur de calcul interne |

### Calendrier & notifications

| Service | Usage | Intégration |
|---|---|---|
| **Google Calendar API** | Sync bidirectionnelle : RDV médicaux, inscriptions, échéances | OAuth2 via Supabase Auth |
| **Apple Calendar** (CalDAV) | Idem pour utilisateurs Apple | CalDAV standard |
| **Resend / Brevo** | Emails transactionnels : rappels, alertes, rapports mensuels | API REST |
| **Twilio / Vonage** | SMS critiques : vaccin en retard, document expiré, échéance fiscale | API REST |
| **Web Push** (service workers) | Notifications navigateur temps réel | API Push native |

### IA & enrichissement

| Service | Usage | Intégration |
|---|---|---|
| **Anthropic API** (Claude) | Alertes proactives, suggestions, coach budgétaire, résumé mensuel IA, aide déclaration fiscale | API REST côté serveur uniquement |
| **OCR** (Tesseract.js ou Google Vision) | Extraction texte depuis ordonnances, factures, documents scannés | Processing côté serveur |

### Architecture d'intégration

```
┌─────────────────────────────────────────────────┐
│                 Cockpit Parental                 │
│              (Next.js + Supabase)                │
├─────────────────────────────────────────────────┤
│                 API Gateway Layer                │
│           (Next.js API Routes / Edge)            │
├──────────┬──────────┬──────────┬────────────────┤
│  Bridge  │ api.gouv │   ANS    │   Anthropic    │
│   API    │  .fr     │  (FHIR)  │   Claude API   │
│ (budget) │ (données │ (santé)  │   (IA)         │
│          │  publiq) │          │                │
├──────────┴──────────┴──────────┴────────────────┤
│          External Services Layer                 │
│  Stripe │ Resend │ Google Cal │ Twilio │ OCR    │
└─────────────────────────────────────────────────┘
```

> **Règle critique** : TOUTES les clés API tierces sont stockées en variables d'environnement serveur. Les appels aux APIs externes se font UNIQUEMENT via les API routes Next.js ou les Edge Functions Supabase — JAMAIS depuis le client.

---

## 4. Architecture projet

```
cockpit-parental/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Routes publiques (login, register, reset)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/          # Routes protégées (layout avec sidebar)
│   │   │   ├── layout.tsx        # Shell principal : sidebar + topbar
│   │   │   ├── page.tsx          # Tableau de bord (vue d'ensemble)
│   │   │   ├── identite/         # 1.1 Identité & documents
│   │   │   ├── sante/            # 1.2 Santé & vaccinations
│   │   │   ├── documents/        # 1.3 Coffre-fort numérique
│   │   │   ├── scolarite/        # 2.1 Scolarité
│   │   │   ├── activites/        # 2.2 Activités & loisirs
│   │   │   ├── developpement/    # 2.3 Développement
│   │   │   ├── fiscal/           # 3. Foyer fiscal
│   │   │   ├── budget/           # 4. Budget familial
│   │   │   ├── garde/            # 5. Recherche de garde
│   │   │   ├── sante-enrichie/   # 6. Santé enrichie (examens, TND, écrans)
│   │   │   ├── demarches/        # 8. Démarches & droits
│   │   │   └── parametres/       # Configuration du foyer
│   │   ├── api/                  # API Routes (Edge Functions si besoin)
│   │   │   ├── ai/               # Endpoints Anthropic API
│   │   │   ├── banking/           # Bridge API proxy (agrégation, catégorisation)
│   │   │   ├── health/            # Santé : Mon Espace Santé (FHIR), annuaire RPPS
│   │   │   ├── gov/               # API Particulier, API Géo, Annuaire Éducation
│   │   │   ├── ocr/               # OCR ordonnances et documents
│   │   │   ├── notifications/     # Emails (Resend), SMS (Twilio), Push
│   │   │   └── webhooks/          # Stripe, Supabase, Bridge webhooks
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Tailwind + CSS custom
│   ├── components/
│   │   ├── ui/                   # shadcn/ui (Button, Card, Dialog, etc.)
│   │   ├── layout/               # Sidebar, Topbar, Shell
│   │   ├── charts/               # Recharts wrappers (courbes, barres, camemberts)
│   │   ├── forms/                # Formulaires métier réutilisables
│   │   └── shared/               # Badge, StatusDot, AlertCard, EmptyState
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Client browser Supabase
│   │   │   ├── server.ts         # Client server Supabase (RSC / API)
│   │   │   ├── middleware.ts     # Auth middleware
│   │   │   └── admin.ts          # Client admin (service_role — JAMAIS côté client)
│   │   ├── ai/
│   │   │   └── anthropic.ts      # Client Anthropic avec prompts système
│   │   ├── integrations/
│   │   │   ├── bridge.ts         # Client Bridge API (agrégation bancaire)
│   │   │   ├── api-gouv.ts       # Clients API Particulier, Géo, Adresse, Annuaires
│   │   │   ├── mon-espace-sante.ts # Client FHIR/HL7 (préparation phase future)
│   │   │   ├── calendar-sync.ts  # Google Calendar + CalDAV sync
│   │   │   ├── notifications.ts  # Resend (email) + Twilio (SMS) + Web Push
│   │   │   └── ocr.ts            # Tesseract.js / Google Vision wrapper
│   │   ├── validators/           # Schémas Zod partagés client/serveur
│   │   ├── simulators/
│   │   │   ├── ir-simulator.ts   # Moteur calcul IR (barème, QF, décote, crédits)
│   │   │   ├── caf-simulator.ts  # Simulateur droits CAF (PAJE, CMG, AF)
│   │   │   └── garde-cost.ts     # Simulateur coût de garde net après aides
│   │   ├── utils.ts              # Helpers (dates, formatage, calculs)
│   │   └── constants.ts          # Constantes métier (barèmes fiscaux, calendrier vaccinal)
│   ├── hooks/                    # Custom hooks React
│   │   ├── useFamily.ts          # CRUD membres du foyer
│   │   ├── useDocuments.ts       # Upload/download/list documents
│   │   ├── useHealth.ts          # Vaccins, RDV, croissance
│   │   ├── useFiscal.ts          # Simulation IR, optimisation
│   │   └── useBudget.ts          # Dépenses, allocations, solde
│   └── types/
│       ├── database.ts           # Types générés depuis Supabase (supabase gen types)
│       ├── family.ts             # Types métier famille
│       ├── health.ts             # Types métier santé
│       ├── fiscal.ts             # Types métier fiscal
│       └── budget.ts             # Types métier budget
├── supabase/
│   ├── migrations/               # Migrations SQL versionnées
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── ...
│   ├── seed.sql                  # Données de test (foyer TAMELGHAGHET)
│   └── config.toml               # Config Supabase local
├── public/
│   ├── favicon.ico
│   └── images/
├── .env.local                    # Variables d'environnement (JAMAIS commité)
├── .env.example                  # Template des variables requises
├── CLAUDE.md                     # ← CE FICHIER
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 5. Schéma base de données (Supabase / PostgreSQL)

### Tables principales

```sql
-- Profils utilisateurs (extension de auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'partner', 'viewer')),
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'family_pro')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Foyers (un user peut avoir un foyer, un foyer peut avoir plusieurs membres)
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Membres du foyer (adultes + enfants)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')),
  member_type TEXT NOT NULL CHECK (member_type IN ('adult', 'child')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents d'identité
CREATE TABLE identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('cni', 'passeport', 'livret_famille', 'acte_naissance', 'carte_vitale', 'autre')),
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  file_path TEXT,  -- Chemin Supabase Storage
  status TEXT GENERATED ALWAYS AS (
    CASE
      WHEN expiry_date IS NULL THEN 'valid'
      WHEN expiry_date < CURRENT_DATE THEN 'expired'
      WHEN expiry_date < CURRENT_DATE + INTERVAL '3 months' THEN 'expiring_soon'
      ELSE 'valid'
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vaccinations
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_code TEXT,  -- Code du calendrier vaccinal français
  dose_number INT NOT NULL DEFAULT 1,
  administered_date DATE,
  next_due_date DATE,
  practitioner TEXT,
  batch_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('done', 'pending', 'overdue', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rendez-vous médicaux
CREATE TABLE medical_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  appointment_type TEXT NOT NULL,  -- pédiatre, dentiste, ophtalmo, urgences...
  practitioner TEXT,
  location TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mesures de croissance
CREATE TABLE growth_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,1),
  head_circumference_cm NUMERIC(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Coffre-fort numérique
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),  -- NULL = document foyer global
  category TEXT NOT NULL CHECK (category IN ('identite', 'sante', 'fiscal', 'scolaire', 'caf', 'assurance', 'logement', 'autre')),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,  -- Supabase Storage
  file_size INT,
  mime_type TEXT,
  tags TEXT[],
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Jalons de développement
CREATE TABLE development_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('motricite', 'langage', 'cognition', 'social', 'autonomie')),
  milestone_name TEXT NOT NULL,
  expected_age_months INT,  -- Âge attendu selon référentiel OMS/HAS
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Journal parental
CREATE TABLE parent_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'difficult', 'tough')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activités extra-scolaires
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,  -- sport, musique, art, langue...
  provider TEXT,  -- Organisme / club
  schedule TEXT,  -- "Mercredi 10h-11h"
  cost_monthly NUMERIC(8,2),
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scolarité
CREATE TABLE schooling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  school_year TEXT NOT NULL,  -- "2028-2029"
  level TEXT NOT NULL,  -- "PS", "MS", "GS", "CP"...
  establishment TEXT,
  teacher TEXT,
  class_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Données fiscales annuelles
CREATE TABLE fiscal_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  year INT NOT NULL,
  nb_parts NUMERIC(3,1) NOT NULL,  -- 2.5 pour couple + 1 enfant
  revenu_net_imposable NUMERIC(12,2),
  impot_brut NUMERIC(10,2),
  credits_impot JSONB DEFAULT '{}',  -- { "garde_enfant": 1750, "dons": 200, ... }
  impot_net NUMERIC(10,2),
  tmi INT,  -- Tranche marginale (0, 11, 30, 41, 45)
  taux_effectif NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, year)
);

-- Budget mensuel
CREATE TABLE budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),  -- NULL = dépense foyer global
  month DATE NOT NULL,  -- Premier jour du mois
  category TEXT NOT NULL CHECK (category IN ('alimentation', 'sante', 'garde', 'vetements', 'loisirs', 'scolarite', 'transport', 'logement', 'assurance', 'autre')),
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,  -- Positif = dépense, Négatif = recette (allocation)
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allocations CAF
CREATE TABLE caf_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  allocation_type TEXT NOT NULL,  -- "PAJE", "CMG", "allocation_rentree", "APL"...
  monthly_amount NUMERIC(8,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comptes bancaires connectés (Bridge API)
CREATE TABLE bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  bridge_item_id TEXT NOT NULL,  -- ID connexion Bridge
  bank_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'needs_refresh', 'error', 'disconnected')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  bridge_account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT,  -- "checking", "savings", "card"...
  balance NUMERIC(12,2),
  currency TEXT DEFAULT 'EUR',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  bridge_transaction_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  category_auto TEXT,       -- Catégorie Bridge (automatique)
  category_user TEXT,       -- Catégorie personnalisée par l'utilisateur
  member_id UUID REFERENCES family_members(id),  -- Attribution à un enfant
  transaction_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Structures de garde (cache monenfant.fr)
CREATE TABLE childcare_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,  -- ID monenfant.fr si disponible
  name TEXT NOT NULL,
  structure_type TEXT NOT NULL CHECK (structure_type IN ('creche', 'micro_creche', 'assistante_maternelle', 'mam', 'accueil_loisirs', 'relais_pe')),
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  capacity INT,
  phone TEXT,
  email TEXT,
  website TEXT,
  hourly_rate NUMERIC(6,2),
  opening_hours JSONB,
  activities TEXT[],
  rating NUMERIC(3,2),
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Favoris garde (par foyer)
CREATE TABLE childcare_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  structure_id UUID NOT NULL REFERENCES childcare_structures(id),
  notes TEXT,
  status TEXT DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'contacted', 'visited', 'enrolled', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, structure_id)
);

-- Démarches administratives (checklist)
CREATE TABLE administrative_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('grossesse', 'naissance', 'garde', 'scolarite', 'fiscal', 'caf', 'sante', 'identite', 'autre')),
  due_date DATE,
  trigger_age_months INT,  -- Déclenchement automatique par âge de l'enfant
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  url TEXT,  -- Lien vers le service en ligne
  template_id TEXT,  -- Référence modèle courrier si applicable
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Objectifs d'épargne
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Vacances été 2026", "Rentrée scolaire", "Activités"
  target_amount NUMERIC(10,2) NOT NULL,
  current_amount NUMERIC(10,2) DEFAULT 0,
  target_date DATE,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Examens de santé obligatoires (référentiel + suivi)
CREATE TABLE health_examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  exam_number INT NOT NULL,  -- 1 à 20 (examens obligatoires)
  exam_age_label TEXT NOT NULL,  -- "8 jours", "1 mois", "2 mois"...
  scheduled_date DATE,
  completed_date DATE,
  practitioner TEXT,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,1),
  head_circumference_cm NUMERIC(5,1),
  screen_exposure_notes TEXT,  -- Repérage écrans (carnet 2025)
  tnd_screening_notes TEXT,    -- Repérage troubles neurodéveloppement
  notes TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'missed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications envoyées (log pour éviter doublons)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  notification_type TEXT NOT NULL,  -- "vaccine_reminder", "doc_expiry", "fiscal_deadline"...
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered BOOLEAN DEFAULT false,
  metadata JSONB
);
```

### Row Level Security (RLS)

```sql
-- Politique globale : chaque utilisateur ne voit que les données de son foyer
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
-- ... (toutes les tables)

-- Exemple de politique
CREATE POLICY "Users see own household" ON households
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users see own family members" ON family_members
  FOR ALL USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- Pattern à répliquer pour CHAQUE table liée à household_id ou member_id
```

---

## 6. Variables d'environnement

```env
# .env.example — copier en .env.local, ne JAMAIS commiter .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # JAMAIS côté client

# Anthropic (Claude IA)
ANTHROPIC_API_KEY=sk-ant-...

# Open Banking — Bridge API
BRIDGE_CLIENT_ID=...
BRIDGE_CLIENT_SECRET=...
BRIDGE_API_URL=https://api.bridgeapi.io
BRIDGE_WEBHOOK_SECRET=...

# API Gouvernement
API_PARTICULIER_TOKEN=...  # Si habilitation obtenue
API_GEO_BASE_URL=https://geo.api.gouv.fr
API_ADRESSE_BASE_URL=https://api-adresse.data.gouv.fr
API_ANNUAIRE_EDUCATION_URL=https://data.education.gouv.fr/api
API_ANNUAIRE_SANTE_URL=https://annuaire.sante.fr/api

# Stripe (monétisation SaaS)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (Resend)
RESEND_API_KEY=re_...

# SMS (Twilio — alertes critiques)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...

# Google Calendar (sync)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# OCR (si Google Vision, sinon Tesseract.js local)
GOOGLE_VISION_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=https://cockpitparental.fr
NEXT_PUBLIC_APP_NAME=Cockpit Parental
```

---

## 7. Design system

### Palette de couleurs (héritée du prototype validé)

```
--bg-primary: #FDFAF6       (fond crème chaud)
--bg-card: #FFFFFF           (cartes)
--bg-sidebar: #1B2838        (sidebar bleu marine)
--accent-warm: #E8734A       (orange — accent principal / alertes)
--accent-teal: #2BA89E       (turquoise — santé / succès)
--accent-blue: #4A7BE8       (bleu — éducation / info)
--accent-purple: #7B5EA7     (violet — développement)
--accent-gold: #D4A843       (or — fiscal)
--accent-green: #4CAF50      (vert — validé / complet)
--accent-red: #E8534A        (rouge — alerte / expiré)
```

### Typographie
- Titres : `DM Serif Display`
- Corps : `DM Sans` (300/400/500/600/700)
- Code/données : `JetBrains Mono`

### Principes UI
- Design chaleureux et familial (pas corporate)
- Cards avec ombres douces, coins arrondis 12-16px
- Sidebar fixe avec icônes + labels, groupes par module
- Badges de notification sur les items qui nécessitent une action
- Mobile-first responsive (sidebar collapsible)
- Mode sombre (phase ultérieure, prévoir les variables CSS)

---

## 8. Phasage de développement

### Phase 0 — Fondations (Semaine 1-2)
- [x] Prototype HTML navigable (9 écrans) — FAIT
- [ ] Init projet Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Configurer Supabase (projet, migrations initiales, RLS)
- [ ] Auth (login, register, magic link, middleware)
- [ ] Shell layout (sidebar, topbar, routing)
- [ ] Onboarding guidé pour nouveaux utilisateurs (création foyer, ajout enfants)
- [ ] Landing page cockpitparental.fr (vitrine + inscription)
- [ ] Stripe : plans Free / Premium (9,90 €/mois) / Family Pro (19,90 €/mois)
- [ ] Seed data foyer TAMELGHAGHET (beta interne)

### Phase 1 — Module Administratif (Semaines 2-4)
- [ ] CRUD membres du foyer
- [ ] Registre documents d'identité + alertes expiration
- [ ] Santé : calendrier vaccinal, saisie doses, rappels
- [ ] Santé : courbes de croissance (Recharts + percentiles OMS)
- [ ] Coffre-fort : upload, catégorisation, recherche, prévisualisation

### Phase 2 — Module Éducatif (Semaines 5-6)
- [ ] Timeline scolarité
- [ ] Activités : CRUD + planning hebdomadaire
- [ ] Jalons développement avec barres de progression
- [ ] Journal parental

### Phase 3 — Module Fiscal (Semaines 7-8)
- [ ] Simulateur IR (barème 2025, quotient familial, décote)
- [ ] Détail crédits/réductions d'impôt
- [ ] Comparateur avant/après optimisation
- [ ] Échéancier fiscal avec alertes

### Phase 4 — Module Budget intelligent (Semaines 9-11)
- [ ] Intégration Bridge API : flux OAuth, connexion comptes bancaires
- [ ] Synchronisation automatique des transactions
- [ ] Catégorisation IA des transactions (Bridge enrichment + Anthropic fallback)
- [ ] Catégories personnalisables par enfant
- [ ] Budget prévisionnel à 30 jours (algorithme dépenses récurrentes)
- [ ] Alertes : dépense inhabituelle, risque découvert, dépassement budget
- [ ] Calcul reste à vivre quotidien
- [ ] Objectifs d'épargne avec progression visuelle
- [ ] Graphiques mensuels/trimestriels/annuels (Recharts)
- [ ] Dashboard budget couple partagé
- [ ] Saisie manuelle dépenses (récurrentes + ponctuelles) en fallback sans Open Banking

### Phase 5 — Modules Garde + Démarches (Semaines 12-13)
- [ ] Recherche géolocalisée de modes de garde (monenfant.fr + API Géo + API Adresse)
- [ ] Carte interactive des structures autour du domicile
- [ ] Simulateur coût de garde (reste à charge après CMG)
- [ ] Simulateur droits sociaux (PAJE, AF, APL, prime activité)
- [ ] Checklist démarches grossesse → 3 ans (frise interactive)
- [ ] Rappels échéances administratives automatiques

### Phase 6 — IA, alertes & notifications (Semaine 14)
- [ ] Intégration Anthropic API côté serveur (Edge Function)
- [ ] Alertes proactives : expirations documents, vaccins en retard, échéances fiscales, CMG à renouveler
- [ ] Coach budgétaire IA : suggestions personnalisées d'économies
- [ ] Suggestions activités par âge de l'enfant
- [ ] Résumé mensuel IA du foyer (email + dashboard)
- [ ] Notifications multicanal : email (Resend), SMS critiques (Twilio), Web Push
- [ ] Sync Google Calendar / Apple Calendar (RDV médicaux, inscriptions, échéances)

### Phase 7 — Santé enrichie & OCR (Semaines 15-16)
- [ ] 20 examens obligatoires détaillés avec rappels par âge
- [ ] Grilles repérage troubles neurodéveloppementaux
- [ ] Questionnaire exposition écrans (à partir de 3 mois)
- [ ] Journal quotidien enrichi (humeur, sommeil, appétit)
- [ ] Courbes de croissance avec âge corrigé prématurés
- [ ] OCR ordonnances (Tesseract.js ou Google Vision)
- [ ] Numéros d'urgence intégrés avec appel direct
- [ ] Préparation intégration Mon Espace Santé (API FHIR — quand disponible)

### Phase 8 — Croissance & extensions (Semaines 17+)
- [ ] Multi-foyers (grands-parents, nounou, mode partagé)
- [ ] Export PDF (bilan annuel foyer)
- [ ] App mobile (React Native ou PWA)
- [ ] Intégrations externes (import CAF via API Particulier si habilitation obtenue)
- [ ] Programme de parrainage
- [ ] Tableau de bord admin SaaS (métriques MRR, churn, cohortes)
- [ ] Arrondi épargne automatique (micro-épargne)
- [ ] Module dépenses partagées type Tricount intégré

---

## 9. Conventions de développement

### Commits
Format **Conventional Commits** obligatoire :
```
feat(sante): ajouter courbes de croissance avec percentiles OMS
fix(auth): corriger redirect après magic link
chore(deps): mise à jour next 14.2.1
docs(readme): ajouter instructions setup local
```

### Nommage
- **Fichiers** : kebab-case (`identity-documents.tsx`, `use-family.ts`)
- **Composants React** : PascalCase (`VaccinationCalendar.tsx`)
- **Variables / fonctions** : camelCase
- **Tables SQL** : snake_case (`family_members`, `fiscal_years`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_FREE_MEMBERS`)
- **Types** : PascalCase avec suffixe si besoin (`FamilyMember`, `VaccinationRow`)

### Langue
- **UI** : tout en français (labels, messages, placeholders)
- **Code** : tout en anglais (variables, fonctions, commentaires techniques)
- **Commits** : en français

### TypeScript
- `strict: true` — pas de `any`, jamais
- Typer toutes les props de composants
- Utiliser les types générés par `supabase gen types typescript` comme source de vérité
- Schémas Zod dans `lib/validators/` pour validation client + serveur

### Composants React
- Composants fonctionnels uniquement (pas de classes)
- Un composant par fichier
- Props destructurées avec interface typée
- `"use client"` uniquement si hooks ou interactivité nécessaires
- Privilégier les Server Components (RSC) par défaut

### API / Data fetching
- Server Components pour les lectures (pas de `useEffect` + `fetch`)
- Server Actions pour les mutations (formulaires)
- Edge Functions Supabase uniquement pour les appels sensibles (Anthropic API, Stripe)
- JAMAIS exposer `service_role_key` côté client

### Tests
- Vitest pour les tests unitaires (utils, validators, calculs fiscaux)
- Playwright pour les tests E2E des parcours critiques
- Tester les calculs fiscaux exhaustivement (cas limites : décote, plafonnement QF)

---

## 10. Données de référence à intégrer

### Calendrier vaccinal français (obligatoires 0-18 mois)
```
DTPCa (Diphtérie-Tétanos-Polio-Coqueluche) : 2 mois, 4 mois, 11 mois
Hib (Haemophilus) : 2 mois, 4 mois, 11 mois
Hépatite B : 2 mois, 4 mois, 11 mois
Pneumocoque : 2 mois, 4 mois, 11 mois
Méningocoque C : 5 mois, 12 mois
ROR (Rougeole-Oreillons-Rubéole) : 12 mois, 16-18 mois
```

### Barème IR 2025 (revenus 2024)
```
0 — 11 294 € : 0%
11 295 — 28 797 € : 11%
28 798 — 82 341 € : 30%
82 342 — 177 106 € : 41%
> 177 106 € : 45%
```

### Plafonds crédits d'impôt
```
Garde enfant < 6 ans : 50% des dépenses, plafond 3 500 € → max 1 750 €
Emploi à domicile : 50%, plafond 12 000 € (+ 1 500 €/enfant)
Dons organismes intérêt général : 66%, plafond 20% revenu imposable
Dons aide aux personnes : 75%, plafond 1 000 €
```

### Allocations CAF (barèmes 2025)
```
PAJE - Prime naissance : 1 019,40 € (sous conditions ressources)
PAJE - Allocation de base : 184,81 €/mois
CMG (Complément mode garde) : variable selon revenus et mode de garde
Allocation rentrée scolaire (6-10 ans) : 416,40 €
```

---

## 11. Règles strictes pour Claude Code

1. **Jamais de secrets dans le code** — toujours via `.env.local` ou variables Vercel
2. **Jamais de `any`** en TypeScript — typage strict exhaustif
3. **Jamais de `service_role_key` côté client** — uniquement dans les API routes / Edge Functions
4. **RLS activé sur TOUTES les tables** — aucune table publique
5. **Chaque composant = un fichier** — pas de composants imbriqués
6. **Server Components par défaut** — `"use client"` uniquement si nécessaire
7. **Validation Zod** sur chaque formulaire — schéma partagé client/serveur
8. **Migrations réversibles** — chaque migration SQL a un UP et un DOWN
9. **Conventional Commits** — chaque commit suit le format
10. **Responsive mobile-first** — chaque composant fonctionne à 375px minimum
11. **Français pour l'UI** — tous les textes visibles en français
12. **Anglais pour le code** — variables, fonctions, commentaires en anglais
13. **Pas de code mort** — supprimer, ne pas commenter
14. **Pas de `console.log`** — utiliser un logger structuré en production
15. **Données sensibles enfant** — chiffrement Supabase Storage, pas de données de santé dans les logs
16. **Accessibilité** — labels sur tous les inputs, navigation clavier, contrastes WCAG AA
17. **SEO** — metadata dynamique Next.js sur chaque page (title, description, OG)
18. **Erreurs explicites** — messages d'erreur en français, jamais de stack traces côté client
19. **Documentation** — chaque décision d'architecture dans `docs/adr/`
20. **RGPD** — consentement explicite, droit suppression, export données, mentions légales

---

## 12. Commandes utiles

```bash
# Développement local
npm run dev                          # Lancer Next.js en dev (port 3000)
npx supabase start                   # Lancer Supabase local (Docker)
npx supabase db reset                # Reset + reseed la base locale
npx supabase gen types typescript --local > src/types/database.ts  # Générer les types

# Migrations
npx supabase migration new <nom>     # Créer une nouvelle migration
npx supabase db push                 # Appliquer les migrations en remote

# Tests
npm run test                         # Vitest
npm run test:e2e                     # Playwright

# Build & deploy
npm run build                        # Build Next.js
npm run lint                         # ESLint
npx tsc --noEmit                     # Type-check sans build
```

---

## 13. Dépendances à installer

```bash
# Création projet
npx create-next-app@latest cockpit-parental --typescript --tailwind --eslint --app --src-dir

# UI
npx shadcn@latest init
npx shadcn@latest add button card dialog input label select tabs badge avatar calendar dropdown-menu sheet toast alert-dialog progress slider switch tooltip popover command

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Formulaires & validation
npm install react-hook-form @hookform/resolvers zod

# Charts
npm install recharts

# Cartographie (recherche garde)
npm install react-map-gl maplibre-gl

# Utils
npm install date-fns lucide-react clsx tailwind-merge

# IA (côté serveur uniquement)
npm install @anthropic-ai/sdk

# Open Banking (côté serveur uniquement)
npm install # Bridge API = REST pur, pas de SDK — wrapper custom dans lib/integrations/bridge.ts

# OCR (côté serveur)
npm install tesseract.js

# Notifications
npm install resend  # emails transactionnels
npm install twilio  # SMS critiques

# Paiement SaaS
npm install stripe @stripe/stripe-js

# Dev
npm install -D vitest @testing-library/react @playwright/test
npm install -D supabase
```

---

## 14. Contexte personnel (seed data)

Le foyer TAMELGHAGHET à injecter dans le seed :

```json
{
  "household": "Foyer TAMELGHAGHET",
  "members": [
    {
      "first_name": "Mehdi",
      "last_name": "TAMELGHAGHET",
      "birth_date": "1990-03-15",
      "gender": "M",
      "type": "adult"
    },
    {
      "first_name": "Yasmine",
      "last_name": "TAMELGHAGHET",
      "birth_date": "1993-05-15",
      "gender": "F",
      "type": "adult"
    },
    {
      "first_name": "Matis",
      "last_name": "TAMELGHAGHET",
      "birth_date": "2025-03-10",
      "gender": "M",
      "type": "child"
    }
  ],
  "fiscal": {
    "year": 2025,
    "nb_parts": 2.5,
    "tmi": 30,
    "economie_estimee": 3850
  },
  "budget": {
    "depenses_enfant_mensuel": 1245,
    "allocations_caf_mensuel": 532
  },
  "mariage": "2019-12-21"
}
```

---

## 15. Analyse concurrentielle

### Matrice SWOT par concurrent

**FamilyWall** (familywall.com) — Assistant familial généraliste
| | |
|---|---|
| **Forces** | Leader marché (10M users monde, 2M France), calendrier partagé excellent, géolocalisation famille, multi-plateformes, intégration Google Agenda, modèle freemium rodé (4,99€/mois premium), album photo/vidéo privé |
| **Faiblesses** | Pas de suivi santé/médical, pas de fiscal, budget basique (catégorisation manuelle), pas d'IA, pas d'Open Banking, export données limité, version gratuite restrictive pour familles nombreuses |
| **Opportunité CP** | Cockpit Parental couvre santé + fiscal + budget intelligent — segments absents de FamilyWall. Notre IA proactive est un différenciateur majeur |
| **Risque** | FamilyWall pourrait ajouter des modules santé/budget. Leur base installée de 2M users FR est un avantage massif en acquisition |

**Kidizz** (kidizz.com) — Communication crèche/parents (B2B2C)
| | |
|---|---|
| **Forces** | N°1 en crèche (600K téléchargements, 20% crèches FR), transmissions quotidiennes (repas, siestes, changes), photos/vidéos de la journée, certifié HDS, archivage 5 ans, gratuit pour les parents |
| **Faiblesses** | B2B uniquement (vendu aux crèches, pas aux parents directement), limité à la crèche (pas de suivi à la maison), pas de budget, pas de fiscal, pas de suivi après crèche, dépendant de l'adoption par la structure |
| **Opportunité CP** | Intégration future possible : si la crèche utilise Kidizz, le parent récupère les transmissions dans Cockpit Parental. Positionnement complémentaire, pas concurrent direct |
| **Risque** | Faible — segments très différents. Kidizz est B2B, nous sommes B2C |

**Bankin'** (bankin.com) — Gestion budget personnel
| | |
|---|---|
| **Forces** | Leader budget FR (6M users Europe), agrégation comptes via Bridge API (leur propre techno), catégorisation IA 98%, coach budgétaire, cashback 400 enseignes, agrément ACPR |
| **Faiblesses** | Pas du tout orienté famille/enfants, pas de suivi santé, pas de fiscal, pas de catégories "par enfant", pas de suivi allocations CAF, pas de simulation de droits |
| **Opportunité CP** | On utilise leur techno (Bridge API) pour notre module budget, mais en ajoutant la couche famille : ventilation par enfant, suivi allocations, simulation droits, coach budgétaire orienté foyer |
| **Risque** | Bankin' pourrait pivoter vers un mode "famille". Prix Bridge API en tant que client B2B |

**Mon Espace Santé** (monespacesante.fr) — Carnet de santé numérique officiel
| | |
|---|---|
| **Forces** | Officiel (État + Assurance Maladie), gratuit, DMP intégré, créé auto à chaque naissance, vaccinations, courbes croissance, messagerie santé sécurisée, partage entre représentants légaux |
| **Faiblesses** | UX médiocre (app institutionnelle), pas de budget, pas de fiscal, pas d'éducatif, pas d'alertes proactives IA, carnet de santé dématérialisé prévu fin 2026 (en retard), intégration tiers complexe (API FHIR réservée aux éditeurs référencés ANS) |
| **Opportunité CP** | Cockpit Parental est le "front-end intelligent" au-dessus de Mon Espace Santé. On ajoute l'UX, l'IA, le multimodule. Quand l'API FHIR sera ouverte, on synchronise. En attendant, on offre une meilleure expérience en saisie manuelle |
| **Risque** | Si Mon Espace Santé devient bon en UX avec IA, notre module santé perd de la valeur. Peu probable à court terme vu le rythme institutionnel |

**Positionnement unique Cockpit Parental** : Aucun concurrent n'intègre les 4 piliers (admin/santé + éducatif + fiscal + budget) dans une seule app avec IA proactive. C'est notre moat.

---

## 16. Monétisation & feature gating

### Plans tarifaires

| Fonctionnalité | Free | Premium (9,90€/mois) | Family Pro (19,90€/mois) |
|---|---|---|---|
| Membres du foyer | 1 adulte + 1 enfant | Illimité | Illimité |
| Documents d'identité | 5 max | Illimité | Illimité |
| Coffre-fort numérique | 500 Mo | 10 Go | 50 Go |
| Suivi vaccinations | ✅ | ✅ | ✅ |
| Courbes de croissance | ✅ | ✅ | ✅ |
| Jalons développement | 3 catégories | Toutes | Toutes |
| Journal parental | 10 entrées/mois | Illimité | Illimité |
| Simulation IR | Basique (résultat) | Détaillée + comparateur | Détaillée + historique |
| Budget manuel | ✅ | ✅ | ✅ |
| Open Banking (Bridge) | ❌ | ✅ | ✅ |
| Catégorisation IA transactions | ❌ | ✅ | ✅ |
| Coach budgétaire IA | ❌ | ✅ | ✅ |
| Alertes proactives | Email uniquement | Email + Push | Email + Push + SMS |
| Résumé mensuel IA | ❌ | ✅ | ✅ |
| Recherche de garde | Carte basique | Carte + simulateur coût | Carte + simulateur + comparateur |
| Sync calendrier | ❌ | Google Calendar | Google + Apple + Outlook |
| OCR ordonnances | ❌ | ❌ | ✅ |
| Export PDF bilan annuel | ❌ | ❌ | ✅ |
| Multi-foyers / partage | ❌ | ❌ | ✅ (grands-parents, nounou) |
| Support | FAQ | Email prioritaire | Chat + email prioritaire |

### Implémentation technique

```typescript
// lib/constants.ts
export const PLAN_LIMITS = {
  free: {
    maxAdults: 1,
    maxChildren: 1,
    maxDocuments: 5,
    storageBytes: 500 * 1024 * 1024, // 500 Mo
    journalEntriesPerMonth: 10,
    hasOpenBanking: false,
    hasAiCoach: false,
    hasCalendarSync: false,
    hasOcr: false,
    hasPdfExport: false,
    hasMultiHousehold: false,
    alertChannels: ['email'] as const,
  },
  premium: {
    maxAdults: Infinity,
    maxChildren: Infinity,
    maxDocuments: Infinity,
    storageBytes: 10 * 1024 * 1024 * 1024, // 10 Go
    journalEntriesPerMonth: Infinity,
    hasOpenBanking: true,
    hasAiCoach: true,
    hasCalendarSync: true,
    hasOcr: false,
    hasPdfExport: false,
    hasMultiHousehold: false,
    alertChannels: ['email', 'push'] as const,
  },
  family_pro: {
    maxAdults: Infinity,
    maxChildren: Infinity,
    maxDocuments: Infinity,
    storageBytes: 50 * 1024 * 1024 * 1024, // 50 Go
    journalEntriesPerMonth: Infinity,
    hasOpenBanking: true,
    hasAiCoach: true,
    hasCalendarSync: true,
    hasOcr: true,
    hasPdfExport: true,
    hasMultiHousehold: true,
    alertChannels: ['email', 'push', 'sms'] as const,
  },
} as const;

// Middleware de vérification plan — à utiliser dans chaque API route
export function requirePlan(minPlan: 'free' | 'premium' | 'family_pro') { ... }
```

### Stripe webhooks à gérer

```
checkout.session.completed → Créer/upgrader subscription
customer.subscription.updated → Mettre à jour plan
customer.subscription.deleted → Downgrade vers free
invoice.payment_failed → Notifier + grace period 7j
invoice.paid → Confirmer renouvellement
```

---

## 17. RGPD & sécurité des données enfant

### Principes

Les données d'enfants sont des **données sensibles**. Le RGPD impose des protections renforcées pour les mineurs (article 8). En France, le consentement parental est requis pour tout traitement de données d'un mineur de moins de 15 ans.

### Exigences techniques

| Exigence | Implémentation |
|---|---|
| **Consentement explicite** | Checkbox RGPD à l'inscription + consentement spécifique pour chaque module sensible (santé, Open Banking) |
| **Droit d'accès** | Bouton "Exporter mes données" → JSON/CSV de toutes les données du foyer |
| **Droit à l'effacement** | Bouton "Supprimer mon compte" → suppression cascade de TOUTES les données + fichiers Storage, dans un délai de 30 jours max |
| **Droit à la portabilité** | Export structuré (JSON) de toutes les données, téléchargeable par l'utilisateur |
| **Minimisation** | Ne collecter QUE les données nécessaires à chaque module. Pas de tracking superflu |
| **Chiffrement au repos** | Supabase Storage avec chiffrement AES-256. Colonnes sensibles (données santé, numéros documents) chiffrées en base via `pgcrypto` |
| **Chiffrement en transit** | HTTPS obligatoire partout (Vercel + Supabase = natif) |
| **Pseudonymisation logs** | Jamais de noms, prénoms ou données enfant dans les logs serveur |
| **Durée de conservation** | Données actives tant que le compte existe. Après suppression : purge complète sous 30 jours. Backups purgés sous 90 jours |
| **Sous-traitants** | Registre des sous-traitants à maintenir (Supabase, Vercel, Bridge, Stripe, Resend, Twilio, Anthropic) avec DPA pour chacun |
| **DPO** | Désigner un DPO (ou point de contact RGPD) dès le lancement |

### Hébergement données de santé (HDS)

Les données de santé (vaccinations, RDV médicaux, courbes croissance, ordonnances) nécessitent un hébergeur certifié HDS en France. Options :

- **Supabase Cloud** : hébergé AWS eu-west (Irlande) — pas HDS. Acceptable pour la phase MVP si les données santé sont chiffrées côté client avant stockage
- **Supabase Self-hosted sur Scaleway** : Scaleway est certifié HDS → solution cible pour la production
- **Alternative** : module santé sur un bucket séparé chez un hébergeur HDS (OVH Healthcare, Scaleway) avec Supabase pour le reste

> **Décision à prendre** : MVP sur Supabase Cloud avec chiffrement client-side, migration vers Scaleway HDS avant lancement public santé.

### Mentions légales obligatoires

Pages à créer dès la Phase 0 :
- `/mentions-legales` — Identité éditeur, hébergeur, DPO
- `/politique-confidentialite` — Traitement données, sous-traitants, durées conservation, droits
- `/cgu` — Conditions générales d'utilisation
- `/cookies` — Politique cookies (uniquement fonctionnels — pas de tracking pub)

### Consentement granulaire

```typescript
// Table Supabase
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'terms_of_service', 'privacy_policy', 'health_data', 
    'open_banking', 'ai_processing', 'email_notifications', 
    'sms_notifications', 'push_notifications', 'analytics'
  )),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
);
```

---

## 18. Onboarding UX

### Parcours premier utilisateur (7 étapes)

```
1. Landing page → CTA "Créer mon cockpit gratuitement"
2. Inscription (email + mot de passe OU magic link)
3. Création du foyer
   → Prénom + nom du parent 1
   → Ajout optionnel parent 2 (email d'invitation)
4. Ajout du premier enfant
   → Prénom, date de naissance, genre
   → Message chaleureux adapté à l'âge ("Matis a 1 an ! Voici ce qu'on peut suivre ensemble")
5. Choix des modules prioritaires (multi-select)
   → "Qu'est-ce qui vous intéresse le plus ?"
   → Santé & vaccins / Budget famille / Suivi développement / Fiscal
   → Active uniquement les sections choisies dans la sidebar
6. Premier quick win
   → Si santé choisi : "Ajoutez le dernier vaccin de [prénom]" avec formulaire pré-rempli
   → Si budget choisi : "Connectez votre banque en 30 secondes" (Bridge)
   → Si développement choisi : "Où en est [prénom] ?" avec 3 jalons à cocher
7. Dashboard personnalisé
   → Affiche les modules choisis avec des données réelles
   → Bannière "Complétez votre profil" avec barre de progression
```

### Empty states

Chaque section vide affiche un empty state chaleureux et actionnable :

```typescript
// Exemples de messages par module
const EMPTY_STATES = {
  identite: {
    icon: '🪪',
    title: 'Aucun document enregistré',
    description: 'Ajoutez les pièces d\'identité de votre famille pour ne plus jamais oublier une date d\'expiration.',
    cta: 'Ajouter un premier document',
  },
  vaccinations: {
    icon: '💉',
    title: 'Carnet de vaccins vierge',
    description: `Le calendrier vaccinal de ${childName} est prêt. Commencez par les vaccins déjà faits.`,
    cta: 'Enregistrer un vaccin',
  },
  budget: {
    icon: '💰',
    title: 'Votre budget vous attend',
    description: 'Connectez votre banque pour un suivi automatique, ou ajoutez vos dépenses manuellement.',
    cta: 'Connecter ma banque',
    ctaSecondary: 'Saisie manuelle',
  },
  journal: {
    icon: '📝',
    title: 'Le journal de votre famille',
    description: 'Notez les premiers mots, les fous rires, les petites victoires. Vous serez contents de les relire.',
    cta: 'Écrire une première note',
  },
};
```

### Barre de progression profil

Affichée en haut du dashboard tant que < 100% :

```
Complétude profil = (
  foyer créé (10%) +
  enfant ajouté (10%) +
  1er document identité (10%) +
  1er vaccin enregistré (10%) +
  1 mesure croissance (10%) +
  1 activité ajoutée (10%) +
  données fiscales (10%) +
  1ère dépense budget (10%) +
  email vérifié (10%) +
  photo profil (10%)
)
```

---

## 19. Prompts IA système

### Coach budgétaire

```
Tu es le coach budgétaire familial intégré à Cockpit Parental. 
Tu parles en français, de manière chaleureuse et bienveillante, jamais moralisatrice.
Tu t'adresses à des parents qui gèrent le budget de leur foyer.

CONTEXTE FOYER : {household_context}
TRANSACTIONS DU MOIS : {monthly_transactions}
BUDGET PRÉVISIONNEL : {budget_forecast}
ALLOCATIONS CAF : {caf_allocations}

RÈGLES :
- Identifie les 3 postes de dépenses qui ont le plus augmenté vs le mois précédent
- Propose des économies concrètes et réalistes (pas "arrêtez de manger")
- Rappelle les allocations CAF auxquelles le foyer a droit et ne perçoit pas
- Si le reste à vivre < 20% des revenus, alerte de manière empathique
- Termine toujours par un point positif (épargne constituée, dépense maîtrisée)
- Jamais de jugement sur les choix de consommation
- Maximum 200 mots
```

### Alertes proactives

```
Tu es le système d'alertes proactives de Cockpit Parental.
Tu génères des alertes personnalisées pour le foyer en vérifiant :

DONNÉES FOYER : {household_data}
DATE AUJOURD'HUI : {current_date}

VÉRIFICATIONS À EFFECTUER :
1. Documents d'identité expirant dans les 6 prochains mois
2. Vaccins en retard ou à planifier selon le calendrier vaccinal français
3. Échéances fiscales à venir (déclaration IR, acomptes, CFE si applicable)
4. Allocations CAF à renouveler ou nouvelles allocations disponibles (changement d'âge enfant)
5. Inscriptions scolaires/périscolaires selon les dates officielles
6. Examens de santé obligatoires à planifier selon l'âge de chaque enfant

FORMAT DE SORTIE (JSON) :
{
  "alerts": [
    {
      "priority": "high|medium|low",
      "category": "identite|sante|fiscal|caf|scolarite",
      "title": "...",
      "message": "...",
      "action_url": "/chemin/vers/action",
      "due_date": "YYYY-MM-DD"
    }
  ]
}

RÈGLES :
- Maximum 5 alertes par exécution (prioriser les plus urgentes)
- Ton chaleureux mais factuel
- Inclure les délais concrets ("dans 47 jours", pas "bientôt")
- Ne pas répéter une alerte déjà envoyée dans les 7 derniers jours
```

### Résumé mensuel

```
Tu es l'assistant IA de Cockpit Parental. Génère un résumé mensuel du foyer.

DONNÉES DU MOIS : {monthly_data}
MOIS : {month_label}

STRUCTURE DU RÉSUMÉ :
1. **Santé** : vaccins effectués, prochains RDV, évolution courbes croissance
2. **Développement** : nouveaux jalons atteints, activités en cours
3. **Budget** : dépenses totales, répartition, évolution vs mois précédent, allocations perçues
4. **Administratif** : documents à renouveler, démarches effectuées/à faire
5. **Prochain mois** : 3 actions prioritaires recommandées

RÈGLES :
- Français, ton chaleureux et positif
- Utilise le prénom des enfants
- Chiffres précis (montants, dates, percentiles)
- Maximum 300 mots
- Termine par les 3 priorités du mois suivant
```

### Suggestions activités par âge

```
Tu es un conseiller en activités pour enfants, intégré à Cockpit Parental.

ENFANT : {child_name}, né le {birth_date} (âge : {age_months} mois)
ACTIVITÉS EN COURS : {current_activities}
LOCALISATION : {city}
SAISON : {current_season}

Suggère 3-5 activités adaptées à l'âge de l'enfant.
Pour chaque suggestion, indique :
- Nom de l'activité
- Tranche d'âge recommandée
- Bénéfices pour le développement (motricité, langage, social...)
- Fréquence recommandée
- Coût estimé mensuel
- Mot-clé pour rechercher dans la ville de l'utilisateur

N'inclus PAS les activités déjà en cours.
Privilégie la diversité : 1 sport, 1 artistique, 1 éveil, 1 nature si possible.
```

---

## 20. SEO & acquisition

### Mots-clés cibles

**Tête de traîne (volume élevé, concurrence forte) :**
- "application gestion famille" — 1K-5K/mois
- "suivi vaccin bébé" — 1K-5K/mois
- "budget familial application" — 500-1K/mois
- "carnet de santé numérique" — 1K-5K/mois

**Longue traîne (volume moyen, conversion élevée) :**
- "application suivi vaccination enfant france" — 100-500/mois
- "simulateur impôt famille 2025" — 500-1K/mois
- "calcul reste à charge crèche" — 500-1K/mois
- "courbe de croissance bébé percentile" — 500-1K/mois
- "calcul allocation caf paje cmg" — 500-1K/mois
- "quand faire passeport bébé" — 500-1K/mois
- "calendrier vaccinal obligatoire 2025" — 1K-5K/mois

### Architecture SEO du site

```
cockpitparental.fr/                         → Landing page (conversion)
cockpitparental.fr/blog/                    → Blog parental SEO
cockpitparental.fr/outils/simulateur-ir     → Outil gratuit simulation IR (lead magnet)
cockpitparental.fr/outils/simulateur-caf    → Outil gratuit simulation allocations CAF
cockpitparental.fr/outils/calendrier-vaccinal → Calendrier vaccinal interactif (lead magnet)
cockpitparental.fr/outils/cout-creche       → Simulateur coût crèche
cockpitparental.fr/guide/demarches-naissance → Guide complet démarches naissance
cockpitparental.fr/guide/vaccins-obligatoires → Guide vaccins obligatoires 2025
```

### Stratégie contenu blog

Publier 2-4 articles/mois ciblant la longue traîne parentale :
- Guides pratiques : "Comment faire le passeport de bébé", "Quand inscrire en crèche"
- Simulateurs interactifs : outils gratuits qui captent des emails
- Checklists : "Checklist naissance : 15 démarches à ne pas oublier"
- Comparatifs : "Crèche vs assistante maternelle : coût réel après aides"
- Fiscal : "Crédit d'impôt garde enfant : guide complet 2025"

### Landing page (structure)

```
Hero : "Toute la vie de famille. Un seul cockpit." + CTA
Social proof : "Rejoignez X familles qui simplifient leur quotidien"
4 piliers : Santé / Éducation / Budget / Fiscal (avec screenshots)
Simulateur gratuit intégré (IR ou CAF — lead magnet sans inscription)
Témoignages
Plans tarifaires
FAQ
Footer : mentions légales, CGU, politique confidentialité
```

---

## 21. Analytics & métriques produit

### KPIs SaaS à tracker

| Métrique | Définition | Cible M6 | Cible M12 |
|---|---|---|---|
| **MRR** | Monthly Recurring Revenue | 2 000 € | 10 000 € |
| **Utilisateurs inscrits** | Comptes créés | 1 000 | 5 000 |
| **Taux activation** | % users ayant complété onboarding (≥3 étapes) | 60% | 70% |
| **Taux conversion Free→Premium** | % free users qui upgrade | 5% | 8% |
| **Churn mensuel** | % abonnés payants qui annulent | < 5% | < 3% |
| **DAU/MAU** | Ratio daily/monthly active users (stickiness) | 25% | 35% |
| **NPS** | Net Promoter Score (enquête trimestrielle) | > 40 | > 50 |

### Événements tracking (Plausible ou PostHog — pas Google Analytics pour RGPD)

```typescript
// lib/analytics.ts — événements clés à instrumenter
const EVENTS = {
  // Onboarding
  'onboarding_started': {},
  'onboarding_step_completed': { step: number },
  'onboarding_completed': { duration_seconds: number },
  
  // Modules
  'document_added': { type: string },
  'vaccine_recorded': { vaccine_code: string },
  'growth_measured': {},
  'journal_entry_created': {},
  'budget_transaction_added': { source: 'manual' | 'bank_sync' },
  'bank_connected': { bank_name: string },
  'fiscal_simulation_run': {},
  'garde_search_performed': { city: string },
  'ai_coach_used': { module: string },
  
  // Conversion
  'pricing_page_viewed': {},
  'checkout_started': { plan: string },
  'subscription_activated': { plan: string },
  'subscription_cancelled': { plan: string, reason?: string },
  
  // Engagement
  'alert_clicked': { alert_type: string },
  'monthly_summary_opened': {},
  'document_exported': { format: 'pdf' | 'csv' | 'json' },
};
```

### Cohortes à analyser

- **Par date d'inscription** : rétention J1, J7, J30, J90
- **Par module activé en premier** : quel module génère le plus de rétention ?
- **Par source d'acquisition** : SEO blog vs simulateur gratuit vs bouche-à-oreille
- **Par plan** : comportement Free vs Premium vs Family Pro
- **Par âge de l'enfant** : les parents de nouveau-nés sont-ils plus engagés ?

---

## 22. Performance & cache

### Stratégie de caching

| Donnée | TTL cache | Stratégie | Justification |
|---|---|---|---|
| Barèmes fiscaux (IR, crédits) | 24h | Cache Redis ou `unstable_cache` Next.js | Change 1x/an max |
| Calendrier vaccinal | 24h | Constantes in-code + cache build | Change rarement |
| Données Bridge (soldes) | 15 min | Cache Supabase + revalidation | Compromis fraîcheur/coût |
| Transactions Bridge | 1h | Cache Supabase + webhook push | Bridge envoie les nouvelles transactions |
| Structures de garde (monenfant.fr) | 7j | Table Supabase `childcare_structures` | Données stables |
| Courbes OMS (percentiles) | Build-time | JSON statique dans `public/data/` | Données immuables |
| Résultats API Géo/Adresse | 24h | Cache in-memory (LRU) | Données stables |
| Résumé mensuel IA | 30j | Stocké en base une fois généré | Coûteux en tokens |

### Quotas & rate limiting APIs externes

| Service | Quota | Rate limit | Gestion |
|---|---|---|---|
| **Bridge API** | Par contrat (facturation/connexion) | 10 req/s | Queue avec exponential backoff |
| **Anthropic API** | Par token (budget mensuel à définir) | Tier-dependent | Budget cap par foyer : 50 appels IA/mois (Free), 200 (Premium), 500 (Pro) |
| **Twilio SMS** | ~0,07€/SMS France | 1 msg/s | Limiter à max 5 SMS/mois par foyer (alertes critiques uniquement) |
| **Resend** | 3 000 emails/mois (free), puis 100K (paid) | 10 req/s | Batch emails, digest hebdo plutôt que temps réel |
| **API Géo** | Illimité | Fair use | Cache agressif 24h |
| **API Adresse** | Illimité | Fair use | Cache agressif + debounce 300ms côté client |

### Rate limiting interne

```typescript
// Middleware API : limiter les appels par utilisateur
// Utiliser upstash/ratelimit avec Redis
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min par user
});
```

### Optimisations Next.js

- **ISR** (Incremental Static Regeneration) pour les pages blog et guides
- **RSC** (React Server Components) pour toutes les pages dashboard (pas de bundle client pour les données)
- **Dynamic imports** pour les composants lourds (Recharts, MapLibre) : `next/dynamic`
- **Image optimization** : `next/image` pour tous les uploads (thumbnails auto)
- **Edge runtime** pour les API routes simples (auth check, feature gating)

---

## 23. Gestion d'erreurs globale

### Codes erreur métier

```typescript
// lib/errors.ts
export const ERROR_CODES = {
  // Auth
  AUTH_001: 'Votre session a expiré. Veuillez vous reconnecter.',
  AUTH_002: 'Cet email est déjà utilisé par un autre compte.',
  AUTH_003: 'Le lien magic link a expiré. Demandez-en un nouveau.',
  
  // Foyer
  HOUSEHOLD_001: 'Nombre maximum de membres atteint pour votre plan.',
  HOUSEHOLD_002: 'Vous devez avoir au moins un enfant pour utiliser ce module.',
  
  // Documents
  DOC_001: 'Le fichier dépasse la taille maximale (10 Mo).',
  DOC_002: 'Format de fichier non supporté. Formats acceptés : PDF, JPG, PNG.',
  DOC_003: 'Espace de stockage insuffisant. Passez au plan supérieur.',
  
  // Budget / Banking
  BANK_001: 'Impossible de se connecter à votre banque. Veuillez réessayer.',
  BANK_002: 'Votre connexion bancaire nécessite une ré-authentification.',
  BANK_003: 'La synchronisation bancaire est temporairement indisponible.',
  
  // IA
  AI_001: 'Le coach IA est momentanément indisponible. Réessayez dans quelques minutes.',
  AI_002: 'Vous avez atteint votre limite mensuelle de consultations IA.',
  
  // Stripe
  STRIPE_001: 'Le paiement a échoué. Vérifiez vos informations bancaires.',
  STRIPE_002: 'Votre abonnement a expiré. Renouvelez pour continuer.',
} as const;
```

### Retry logic APIs externes

```typescript
// lib/utils/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; baseDelay: number; maxDelay: number }
): Promise<T> {
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.maxRetries) throw error;
      const delay = Math.min(
        options.baseDelay * Math.pow(2, attempt),
        options.maxDelay
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

// Usage : Bridge API avec 3 retries, backoff 1s → 2s → 4s, max 10s
const transactions = await withRetry(
  () => bridgeClient.getTransactions(accountId),
  { maxRetries: 3, baseDelay: 1000, maxDelay: 10000 }
);
```

---

## 24. Scénarios de test critiques

### Tests unitaires (Vitest)

| Module | Scénario | Priorité |
|---|---|---|
| Simulateur IR | Barème 2025 : couple 2,5 parts, 60K€ revenu → résultat attendu | Critique |
| Simulateur IR | Décote applicable : célibataire, 18K€ revenu | Critique |
| Simulateur IR | Plafonnement quotient familial | Critique |
| Simulateur CAF | PAJE + CMG selon revenus et mode de garde | Haute |
| Simulateur garde | Reste à charge crèche vs assistante maternelle | Haute |
| Vaccinations | Calcul prochaine dose selon calendrier vaccinal et date naissance | Haute |
| Croissance | Calcul percentile OMS à partir de poids/taille/âge | Haute |
| Feature gating | Vérification limites par plan (Free/Premium/Pro) | Critique |
| Alertes | Détection document expirant dans 90 jours | Haute |
| Budget | Catégorisation transaction "LECLERC" → alimentation | Moyenne |

### Tests E2E (Playwright)

| Parcours | Étapes | Priorité |
|---|---|---|
| Inscription → onboarding complet | Register → créer foyer → ajouter enfant → premier vaccin → dashboard | Critique |
| Upgrade Free → Premium | Dashboard → pricing → Stripe checkout → confirmation → features débloquées | Critique |
| Connexion bancaire | Dashboard budget → Bridge connect → auth banque → sync → transactions affichées | Haute |
| Ajout document + alerte | Ajouter CNI avec expiration dans 2 mois → vérifier alerte générée | Haute |
| Simulation IR complète | Saisir revenus → calculer → vérifier résultat vs impots.gouv.fr | Haute |
| Export données RGPD | Paramètres → "Exporter mes données" → vérifier JSON contient tout | Haute |
| Suppression compte | Paramètres → "Supprimer mon compte" → confirmer → vérifier purge complète | Critique |

---

*Ce fichier doit être mis à jour à chaque évolution significative du projet.*
