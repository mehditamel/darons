# ADR-005 : Choix de Bridge API pour l'Open Banking

**Date** : 2025-03-18
**Statut** : Accepté
**Décideur** : Mehdi TAMELGHAGHET

## Contexte

Le module budget intelligent nécessite une agrégation bancaire automatique (synchronisation des comptes et transactions) conforme à la DSP2 européenne.

## Options envisagées

1. **Bridge API** (by Bankin') — leader français, certifié DSP2 + ACPR, 350+ banques FR
2. **Powens** (ex-Budget Insight) — 1 800 banques, 99,5% taux succès, sur devis
3. **Plaid** — leader US/international, couverture EU en croissance
4. **Saisie manuelle** — pas d'agrégation, l'utilisateur saisit ses dépenses

## Décision

Bridge API comme provider principal, avec une abstraction (interface `BankingProvider`) pour pouvoir changer de fournisseur sans refonte. Saisie manuelle toujours disponible en fallback.

## Justification

- **Leader français** : Bridge (marque B2B de Bankin') est le standard de l'Open Banking en France
- **Certification** : DSP2, ACPR — conforme réglementairement
- **Catégorisation** : 98% de catégorisation automatique des transactions (économise des appels Anthropic)
- **Documentation** : API REST bien documentée, SDK non nécessaire (wrapper custom dans `lib/integrations/bridge.ts`)
- **Coût** : ~0,15-0,50 €/connexion/mois — acceptable à l'échelle

## Architecture

```
User → Darons UI → /api/banking/connect → Bridge OAuth → Banque
                  → /api/banking/transactions → Bridge API → Cache Supabase
                  → Webhook Bridge → Supabase (nouvelles transactions)
```

## Conséquences

- Coût variable selon le nombre de connexions actives — monitoring requis
- Bridge API = point de défaillance unique pour le budget automatisé → fallback saisie manuelle
- Les clés API Bridge sont stockées uniquement côté serveur (jamais exposées au client)
- Rate limiting appliqué : 10 req/s, queue avec exponential backoff
