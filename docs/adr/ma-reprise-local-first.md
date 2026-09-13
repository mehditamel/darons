# ADR : préparation à la reprise dans le navigateur

Statut : accepté pour la première version, 13 septembre 2026.

Le parcours de reprise manipule des horaires professionnels et familiaux. Il fonctionne sans compte et ne possède pas d’intégration employeur à ce stade. La saisie, le calcul et les exports restent dans le navigateur. Une sauvegarde locale facultative, strictement validée et limitée à 24 Ko, permet la reprise ; elle n’est pas synchronisée avec le compte et est accessible aux autres personnes utilisant le même profil de navigateur. Un fichier exporté permet le transfert volontaire vers un autre appareil.

Le document destiné au travail est construit à partir d’une liste fermée de sujets et de la date envisagée. Il ne sérialise pas le profil ou les réponses familiales. Les téléchargements n’ajoutent aucune URL, identité ou instruction libre issue d’un import. Le format calendrier reprend des titres d’actions connus et des dates validées, avec identifiants stables, dates de fin exclusives et pliage des lignes selon UTF-8.

La création future d’un portail employeur exige un modèle distinct pour les organisations, ressources publiées, rôles et droits d’accès. Ne pas réutiliser les profils familiaux comme espace RH. Une sauvegarde publique ne doit jamais donner accès à une donnée du foyer ni conférer un rôle employeur. La synchronisation et les indicateurs collectifs feront l’objet d’une décision et de tests de permissions propres.
