# Darons

> Toute ta vie de daron. Une seule app.

L'app 100% gratuite qui centralise toute la vie de famille : sante des enfants, budget du foyer, fiscalite, education — le tout avec une couche IA qui anticipe et simplifie.

**Site** : [darons.app](https://darons.app)

---

## Stack technique

| Couche | Choix |
|--------|-------|
| Framework | Next.js 14+ (App Router) |
| Langage | TypeScript (strict) |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Backend | Supabase (Auth, PostgreSQL, RLS, Storage) |
| IA | Anthropic API (Claude) |
| Charts | Recharts |
| Formulaires | React Hook Form + Zod |
| Paiement | Stripe (phase commercialisation) |
| Hebergement | Vercel |

## Fonctionnalites

- **Sante & vaccinations** — Calendrier vaccinal francais, courbes de croissance OMS, RDV medicaux, 20 examens obligatoires
- **Budget familial** — Suivi depenses par categorie et par enfant, allocations CAF, Open Banking (Bridge API), coach IA
- **Foyer fiscal** — Simulateur IR (bareme 2025), quotient familial, credits d'impot, echeancier fiscal
- **Coffre-fort numerique** — Upload securise, categorisation, recherche, partage temporaire
- **Scolarite** — Timeline previsionnelle, inscriptions, suivi notes
- **Recherche de garde** — Creches, assistantes maternelles, simulateur cout net apres CMG
- **Demarches & droits** — Checklist naissance-3 ans, simulateur droits sociaux, modeles courriers
- **IA proactive** — Alertes expirations, vaccins en retard, echeances fiscales, suggestions activites

## Installation

### Prerequis

- Node.js 20+
- Docker (pour Supabase local)
- npm

### Setup

```bash
# Cloner le repo
git clone https://github.com/mehditamel/darons.git
cd darons

# Installer les dependances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Editer .env.local avec vos cles Supabase, Anthropic, etc.

# Lancer Supabase local (Docker requis)
npx supabase start

# Appliquer les migrations
npx supabase db reset

# Generer les types TypeScript depuis la base
npm run db:types

# Lancer le serveur de dev
npm run dev
```

L'app sera accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev Next.js |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript (sans build) |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Tests avec couverture |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run e2e:debug` | E2E en mode debug |
| `npm run e2e:ui` | E2E avec interface visuelle |
| `npm run ci` | Lint + type-check + tests (CI local) |
| `npm run analyze` | Analyse du bundle |
| `npm run db:reset` | Reset base locale + seed |
| `npm run db:push` | Appliquer migrations en remote |
| `npm run db:types` | Regenerer les types Supabase |
| `npm run db:migration` | Creer une nouvelle migration |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, register, reset-password
│   ├── (dashboard)/        # 14 pages dashboard + 4 admin
│   ├── (marketing)/        # Landing, blog, outils, legal
│   └── api/                # 38 API routes
├── components/
│   ├── ui/                 # shadcn/ui (30+ composants)
│   ├── layout/             # Sidebar, topbar, footer
│   ├── shared/             # StatCard, AlertCard, EmptyState
│   └── {module}/           # Composants par module
├── lib/
│   ├── actions/            # Server actions (19 fichiers)
│   ├── simulators/         # IR, CAF, cout de garde
│   ├── integrations/       # Bridge, FHIR, Calendar, OCR
│   ├── validators/         # Schemas Zod
│   └── constants.ts        # Baremes fiscaux, calendrier vaccinal
├── hooks/                  # Custom hooks React
└── types/                  # Types TypeScript
```

## Tests

```bash
# Tests unitaires (simulateurs, validators, utils)
npm run test

# Tests E2E (parcours utilisateur complets)
npm run test:e2e

# Mode debug pour les E2E
npm run e2e:debug
```

Les tests couvrent :
- Simulateur IR (bareme, decote, quotient familial, credits)
- Simulateur CAF (PAJE, CMG, allocations familiales)
- Simulateur cout de garde
- Validators (auth, budget, fiscal, family, health, garde)
- FHIR integration (client, mappers, sync)
- E2E : landing, auth, onboarding, sante, fiscal, budget, identite, responsive

## Deploiement

1. Connecter le repo a [Vercel](https://vercel.com)
2. Ajouter les variables d'environnement (voir `.env.example`)
3. Le deploiement se fait automatiquement a chaque push sur `main`

## Conventions

- **Commits** : format Conventional Commits (`feat(module): description`)
- **UI** : tout en francais
- **Code** : tout en anglais (variables, fonctions, commentaires)
- **TypeScript** : `strict: true`, pas de `any`
- **Composants** : Server Components par defaut, `"use client"` si necessaire

## Documentation technique

Les decisions d'architecture sont documentees dans `docs/adr/` :
- [001 — Stack technique](docs/adr/001-stack-technique.md)
- [002 — Auth Supabase](docs/adr/002-auth-supabase.md)
- [003 — Strategie gratuit-first](docs/adr/003-gratuit-first.md)
- [004 — Donnees de sante & RGPD](docs/adr/004-donnees-sante-rgpd.md)
- [005 — Open Banking (Bridge)](docs/adr/005-open-banking-bridge.md)

## Licence

Proprietary — Mehdi TAMELGHAGHET / [Centres d'Affaires TAMEL](https://tamel.fr)
