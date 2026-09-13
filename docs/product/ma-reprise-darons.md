# Ma reprise Darons : un service concret pour les parents salariés

## Besoin et décision

Mehdi demande un véritable service d’aide aux parents salariés et choisit un fonctionnement entièrement numérique le 13 septembre 2026. La plateforme reste gratuite pour tous les parents. Le retour au travail est un premier périmètre précis : vérifier que les horaires sont compatibles, préparer l’échange professionnel et organiser les premières semaines. L’utilité et la demande commerciale restent des hypothèses à vérifier auprès de parents et de RH ; aucun gain de temps, taux de rétention ou impact sur l’absentéisme n’est revendiqué.

## Service disponible dans cette livraison

`/outils/reprise-travail` permet de saisir une date envisagée, les horaires de travail et de garde, un trajet aller simple par jour travaillé, l’état de confirmation de la garde et l’existence d’un relais. Les sept jours sont disponibles, y compris le week-end. Une plage de travail et une plage de garde dans la même journée sont prises en charge. Les horaires de nuit, gardes fractionnées et relais multiples successifs demandent une autre modélisation ; le formulaire explique cette limite et refuse les horaires incohérents.

Le calcul compare l’intervalle de travail augmenté des trajets aller et retour à l’intervalle de garde. Il affiche les minutes et créneaux non couverts. Des horaires inconnus restent inconnus et ne deviennent pas une garde confirmée. Le statut déclaré de la solution est visible à côté du bilan. Exemple : finir à 17 h 30, avoir 30 minutes de trajet et une garde jusqu’à 17 h laisse une heure à organiser.

Six actions adaptent leur texte à l’organisation : garde, échange professionnel, solution d’imprévu, test de la journée et Carnet de Confiance, bilan à une semaine et à un mois. Les dates proposées sont relatives à la reprise (J−21, J−14, J−7, J−3, J+7, J+30) et les dates passées sont ramenées au jour courant. Ce sont des choix éditoriaux modifiables, jamais des délais légaux ou une injonction. Les actions peuvent être cochées et exportées dans un calendrier personnel, sans alarme, invitation ou synchronisation.

Le document professionnel est généré à partir de la date de reprise envisagée et des seuls sujets que le parent sélectionne. Il pose les questions d’horaires, de priorités, d’aides, de congés et de formation, avec un espace à compléter ensemble pour la décision, le responsable et la prochaine date. Les horaires de garde, les relais et l’avancement ne sont pas inclus. Le texte est visible avant copie ou téléchargement. Il ne vaut pas demande formelle de congé ou accord de l’employeur. Un récapitulatif personnel distinct comprend l’organisation familiale et le plan.

L’enregistrement sur l’appareil est volontaire. La sauvegarde peut être exportée et importée, avec validation stricte, taille maximale de 24 Ko et confirmation avant remplacement. Un échec du stockage ou du presse-papiers est expliqué. La suppression cible uniquement ce parcours, après confirmation. Il n’y a pas de connexion du plan au compte Darons, à un calendrier externe ou à l’employeur.

## Sources et périmètre des informations

Sources officielles consultées le 13 septembre 2026 : [congé de paternité, secteur privé](https://www.service-public.gouv.fr/particuliers/vosdroits/F3156), [FAQ du congé supplémentaire de naissance](https://www.service-public.gouv.fr/particuliers/actualites/A18982) et [entretien de parcours professionnel](https://www.service-public.gouv.fr/particuliers/vosdroits/F32040). Les références sont proposées comme points de vérification ; Darons ne calcule pas l’éligibilité, les délais de prévenance ou les indemnités dans ce parcours. En particulier, le retour de congé ne déclenche pas une affirmation universelle d’entretien obligatoire. Les conditions et le statut doivent être vérifiés.

## Pourquoi une entreprise paierait : prochaine étape, non livrée

Le parcours public prouve une utilité possible pour le parent. Il ne justifie pas à lui seul un abonnement employeur. L’objet vendable à valider est un portail qui permet aux RH de configurer et maintenir leurs dispositifs réels : aides à la garde, contacts, congés conventionnels, aménagements et étapes de reprise. Le parent accéderait aux informations pertinentes de son organisation au fil de son parcours. L’entreprise paierait l’administration, le déploiement et la mise à jour de cet espace, pas l’accès des parents aux outils gratuits.

Le prochain périmètre doit comprendre l’administration authentifiée d’un espace entreprise, les rôles, la publication de ressources versionnées et datées, un accès salariés décidé par l’organisation, et une séparation vérifiée des données des familles. Les indicateurs éventuels porteront sur le déploiement collectif, avec méthode et seuils de confidentialité à définir. Ne pas inventer un tableau de bord RH, un score de fragilité des parents, un suivi nominatif ou des intégrations existantes. La page `/entreprises` distingue explicitement le parcours utilisable du portail encore à construire. Aucun abonnement B2B n’est activé.

## Validation et critères d’acceptation

- Les intervalles sans recouvrement et les décalages matin/soir sont calculés sans double comptage ; les week-ends sont pris en charge.
- Les champs incomplets, dates impossibles, jours dupliqués, sujets inconnus et imports contenant des champs non prévus sont rejetés.
- Un parcours anonyme ne crée pas de copie locale avant l’accord du parent. Les erreurs de stockage ne sont pas présentées comme une sauvegarde réussie.
- Le document professionnel n’inclut pas l’organisation familiale. Rien n’est envoyé automatiquement et le calendrier ne crée pas d’invitation.
- Vérification clavier, écrans de 320 à 1440 px, clair/sombre et mouvement réduit. Sans JavaScript, sources et explication de repli restent disponibles.
- Tests applicatifs sur le calcul, les dates, les exports et imports ; parcours navigateur sur le résultat, la reprise de sauvegarde, les erreurs, les choix de transmission et l’effacement.

Pour valider le produit, faire tester cinq situations réelles : horaires décalés dans la journée, temps partiel, parent solo, garde non confirmée et reprise déjà commencée. Mesurer par entretien volontaire si le parent identifie un décalage utile et repart avec une action réalisable. Objectif exploratoire : quatre parents sur cinq comprennent le bilan sans explication et jugent au moins une action utile. Interroger ensuite cinq RH/CSE sur le besoin d’un portail de dispositifs propres à leur organisation. Ces chiffres sont des objectifs de test, pas des résultats. Aucun contact n’a été pris dans cette livraison.
