# 006 — Identité visuelle familiale

Date : 12 septembre 2026. Statut : accepté pour cette refonte.

## Contexte

L’accueil reposait sur un téléphone fictif et des séries de cartes similaires. Les pages de connexion utilisaient un grand panneau sombre. L’objectif est de donner davantage de présence aux parents et de relier visuellement le site public à l’application.

## Décision

- Une composition photographique remplace le téléphone. La page présente les six modules, des outils immédiatement accessibles, les offres existantes et le contenu éditorial.
- La palette crème, corail et sauge utilise les couleurs sémantiques existantes. Les nouvelles surfaces pastel possèdent leurs variantes sombres et un texte contrasté.
- Les mises en page publiques restent rendues sur le serveur. Seul le composant d’apparition au défilement nécessite une interaction côté client. Son contenu est visible sans JavaScript.
- Les animations sont brèves : apparitions au défilement, une seule oscillation d’une note et réactions au survol. La préférence de réduction des mouvements est respectée. Aucun défilement automatique ou carrousel permanent.
- Le même bandeau de bienvenue est utilisé dans le tableau de bord et sa démo publique. Les cartes et en-têtes partagés reprennent les nouveaux arrondis et espacements.
- Les photos WebP proviennent des trois visuels générés dans la précédente session, pour illustrer des scènes de famille. Ce ne sont pas des portraits de clients ni des témoignages. Leurs originaux restent dans la sauvegarde locale de reprise.
- Les images utilisent Next Image, une taille réservée et des tailles adaptatives. Seule la photo principale de l’accueil est prioritaire ; les autres sont chargées à la demande.

## Validation et limites

Les tests couvrent les contrastes des pages d’accueil, de connexion et de démo, aux largeurs 320 et 1440 px, dans les deux thèmes, ainsi que la réduction des mouvements, les images, les débordements et l’accueil sans JavaScript. Les tests existants de navigation et de compte sont conservés.

Cette refonte ne modifie ni les autorisations, ni les migrations, ni les données familiales. La démo permet de vérifier les composants partagés sans ouvrir un accès aux routes privées.
