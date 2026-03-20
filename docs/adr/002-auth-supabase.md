# ADR-002 : Authentification via Supabase Auth

**Date** : 2025-03-18
**Statut** : Accepté
**Décideur** : Mehdi TAMELGHAGHET

## Contexte

Darons nécessite un système d'authentification sécurisé, extensible et compatible RGPD pour gérer les comptes parentaux et protéger les données d'enfants.

## Options envisagées

1. **Supabase Auth** — intégré au BaaS choisi, email/password + magic link, extensible OAuth
2. **Firebase Auth** — mature, large écosystème, mais vendor lock Google et hébergement US
3. **Auth0** — puissant, mais coût élevé à l'échelle et complexité pour un MVP
4. **NextAuth.js** — flexible, mais nécessite un backend custom et plus de maintenance

## Décision

Supabase Auth, avec email/password et magic link comme méthodes initiales.

## Justification

- **Intégration native** : même SDK que la base de données, pas de service tiers supplémentaire
- **RLS couplé** : les politiques de sécurité Row Level Security utilisent directement `auth.uid()`
- **Hébergement EU** : Supabase Cloud permet le choix de région (eu-west), compatible RGPD
- **Extensible** : OAuth (Google, Apple) et France Connect ajoutables sans migration
- **Coût** : inclus dans le plan Supabase, pas de facturation séparée

## Conséquences

- Dépendance au SDK `@supabase/ssr` pour la gestion des sessions côté serveur
- Magic link nécessite un service email (Resend) fonctionnel dès le départ
- France Connect nécessitera un développement custom (provider OAuth non standard)
