# 006 — Identité visuelle familiale

Date : 12 septembre 2026. Statut : accepté pour cette refonte.

## Contexte

L’accueil reposait sur un téléphone fictif et des séries de cartes similaires. Les pages de connexion utilisaient un grand panneau sombre. L’objectif est de donner davantage de présence aux parents et de relier visuellement le site public à l’application.

## Décision

- Une composition photographique remplace le téléphone. La page présente les six modules, des outils immédiatement accessibles, les offres existantes et le contenu éditorial.
- La palette crème, corail et sauge utilise les couleurs sémantiques existantes. Les nouvelles surfaces pastel possèdent leurs variantes sombres et un texte contrasté.
- Les mises en page publiques restent rendues sur le serveur. Les apparitions, la profondeur au pointeur, la progression de lecture et la visite interactive utilisent de petites frontières côté client. Son contenu est visible sans JavaScript.
- Les animations sont brèves : apparitions au défilement, une seule oscillation d’une note et réactions au survol. La préférence de réduction des mouvements est respectée. Aucun défilement automatique ou carrousel permanent.
- Le même bandeau de bienvenue est utilisé dans le tableau de bord et sa démo publique. Les cartes et en-têtes partagés reprennent les nouveaux arrondis et espacements.
- Les photos WebP proviennent des trois visuels générés dans la précédente session, pour illustrer des scènes de famille. Ce ne sont pas des portraits de clients ni des témoignages. Leurs originaux restent dans la sauvegarde locale de reprise.
- Les images utilisent Next Image, une taille réservée et des tailles adaptatives. Seule la photo principale de l’accueil est prioritaire ; les autres sont chargées à la demande.

## Validation et limites

Les tests couvrent les contrastes des pages d’accueil, de connexion et de démo, aux largeurs 320 et 1440 px, dans les deux thèmes, ainsi que la réduction des mouvements, les images, les débordements et l’accueil sans JavaScript. Les tests existants de navigation et de compte sont conservés.

Cette refonte ne modifie ni les autorisations, ni les migrations, ni les données familiales. La démo permet de vérifier les composants partagés sans ouvrir un accès aux routes privées.

## Logo et mouvement — seconde passe

Le nouveau symbole représente un adulte, un enfant et un sourire commun à l’intérieur d’un D. Le concept a été exploré avec l’outil de génération d’images intégré, puis reconstruit en SVG. Le composant DaronsLogo est partagé par les en-têtes, la navigation privée et le pied de page. Le symbole public/brand/darons-mark.svg et les icônes d’installation déclinent la même géométrie. Les PNG ont été rasterisés depuis public/icons/icon.svg avec sharp.

La visite à onglets présente trois exemples fictifs et renvoie vers les outils réels. Radix fournit les rôles, la navigation au clavier et les associations onglet/panneau. Aucun changement automatique d’onglet. La profondeur répond uniquement à une souris ; les valeurs animées ne relancent pas React à chaque mouvement. Les entrées restent finies, sans boucle. Le défilement reste natif. Les préférences de réduction du mouvement sont prises en compte dès le CSS initial et dans les animations JavaScript.

Les tests ajoutés couvrent la navigation au clavier de la visite, ses liens, les contrastes et les débordements dans ses trois états à 320 et 1440 px, ainsi que l’arrêt des animations d’entrée.
