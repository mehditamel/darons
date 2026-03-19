# ADR-001 : Choix de la stack technique

**Date** : 2025-03-18
**Statut** : Accepté
**Décideur** : Mehdi TAMELGHAGHET

## Contexte

Darons est une app gratuite pour les parents (SaaS) combinant 4 piliers : administratif/santé, éducatif, fiscal et budgétaire. Le choix de la stack doit permettre un développement rapide, une bonne expérience utilisateur et une sécurité renforcée pour les données d'enfants (RGPD).

## Décisions

### Framework : Next.js 14 (App Router)
- SSR/SSG natif pour le SEO (landing page, blog, outils gratuits)
- React Server Components pour les pages dashboard (pas de bundle client pour les données)
- API Routes intégrées pour les webhooks et proxies API
- Déploiement natif Vercel

### Backend : Supabase
- Auth (email/password, magic link), PostgreSQL, RLS, Storage, Edge Functions
- RLS par foyer : chaque utilisateur ne voit que les données de son household
- Storage chiffré pour le coffre-fort numérique
- Alternative envisagée : Firebase — rejeté car vendor lock-in plus fort et pas de SQL natif

### Paiement : Stripe
- Gestion des abonnements (Free/Premium/Family Pro)
- Webhooks pour le cycle de vie des subscriptions
- Alternative envisagée : Paddle — rejeté car moins de contrôle sur le checkout

### UI : Tailwind CSS + shadcn/ui
- Design system rapide, utility-first
- Composants accessibles et personnalisables (pas de vendor lock-in)
- Alternative envisagée : Chakra UI — rejeté car bundle plus lourd

### IA : Anthropic Claude API
- Alertes proactives, coach budgétaire, suggestions activités, résumé mensuel
- Appels côté serveur uniquement (Edge Functions)

### Open Banking : Bridge API
- Agrégation bancaire (DSP2), catégorisation IA des transactions
- Leader français, certification ACPR
- Interface abstraite pour pouvoir changer de provider

## Conséquences

- Stack JavaScript/TypeScript end-to-end (cohérence, partage de types)
- Hébergement données de santé : MVP sur Supabase Cloud avec chiffrement client-side, migration vers hébergeur HDS (Scaleway) avant lancement public santé
- Coût d'infrastructure minimal en phase de lancement (Vercel free tier + Supabase free tier)
