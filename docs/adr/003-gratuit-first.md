# ADR-003 : Stratégie 100% gratuit au lancement

**Date** : 2025-03-18
**Statut** : Accepté
**Décideur** : Mehdi TAMELGHAGHET

## Contexte

Le marché des apps parentales françaises est fragmenté entre des solutions verticales payantes (Bankin' pour le budget, Mon Enfant pour la garde). Darons vise une adoption massive par le bouche-à-oreille.

## Options envisagées

1. **100% gratuit** — tous les modules accessibles, monétisation différée
2. **Freemium classique** — fonctions de base gratuites, features clés payantes
3. **Essai gratuit 30j** — puis abonnement obligatoire

## Décision

100% gratuit au lancement. Monétisation progressive (Darons+ à 4,99 €/mois) activée quand la base installée dépasse 10K utilisateurs actifs.

## Justification

- **Acquisition** : la gratuité totale élimine la friction d'inscription et favorise le bouche-à-oreille
- **Différenciation** : aucun concurrent n'offre les 4 piliers gratuits dans une seule app
- **Données** : une large base d'utilisateurs permet de valider le product-market fit avant de monétiser
- **Confiance** : les parents sont méfiants envers les apps qui monétisent les données d'enfants — la gratuité sans piège construit la confiance

## Conséquences

- Pas de revenus au lancement — le projet est financé par le porteur
- Le feature gating est préparé dans le code (`PLAN_LIMITS`) mais non activé
- Stripe est intégré mais le checkout n'est pas exposé dans l'UI
- Budget API (Anthropic, Bridge) à surveiller — caps internes par foyer pour maîtriser les coûts
