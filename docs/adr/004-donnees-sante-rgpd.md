# ADR-004 : Hébergement et protection des données de santé

**Date** : 2025-03-18
**Statut** : Accepté
**Décideur** : Mehdi TAMELGHAGHET

## Contexte

Darons stocke des données de santé d'enfants (vaccinations, courbes de croissance, RDV médicaux, ordonnances). Le RGPD impose des protections renforcées pour les mineurs (article 8) et les données de santé (article 9). En France, l'hébergement de données de santé nécessite la certification HDS.

## Options envisagées

1. **Supabase Cloud (eu-west)** + chiffrement client-side — simple, pas HDS
2. **Supabase self-hosted sur Scaleway** — Scaleway est certifié HDS
3. **Module santé séparé chez OVH Healthcare** — HDS natif, mais architecture split

## Décision

Phase MVP : Supabase Cloud (eu-west) avec chiffrement côté application pour les données sensibles (pgcrypto). Phase production : migration vers Supabase self-hosted sur Scaleway (certifié HDS).

## Justification

- **Pragmatisme** : le MVP doit avancer vite, Supabase Cloud est opérationnel immédiatement
- **Chiffrement** : les colonnes sensibles sont chiffrées via pgcrypto en attendant l'HDS
- **Migration claire** : Supabase self-hosted est 100% compatible — migration sans refonte
- **Scaleway HDS** : datacenter français, certifié HDS, compatible Docker/Kubernetes

## Mesures de protection appliquées

- RLS sur toutes les tables — aucune donnée accessible sans authentification
- Chiffrement AES-256 au repos (Supabase Storage natif)
- HTTPS obligatoire (Vercel + Supabase = natif)
- Pas de données de santé dans les logs serveur (pseudonymisation)
- Consentement granulaire (`user_consents` table) pour chaque module
- Droit à l'effacement avec suppression cascade dans les 30 jours
- Export données RGPD (JSON) disponible dans les paramètres

## Conséquences

- Avant lancement public du module santé : migration Scaleway obligatoire
- Budget d'hébergement Scaleway à prévoir (~50-100 €/mois)
- Monitoring de conformité RGPD à mettre en place (registre des traitements, DPA sous-traitants)
