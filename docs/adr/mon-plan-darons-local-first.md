# Mon plan Darons : sélection locale et export explicite

Date : 2026-09-12. Statut : accepté pour la première version publique.

Le plan doit être utile avant la création d’un compte et ne demande ni nom, ni revenu, ni information médicale. Un catalogue éditorial typé et une sélection déterministe évitent un nouvel appel d’IA, de nouvelles tables et une personnalisation opaque. Seules les actions du besoin choisi sont proposées ; les actions propres à l’étape sont prioritaires. Le plan comporte au maximum trois actions sans dépasser le budget de temps. L’ordre du catalogue tranche les égalités. Les durées sont des estimations éditoriales. Le temps restant n’est pas rempli avec des tâches hors sujet : un besoin de relais ne déclenche pas de démarches administratives supplémentaires.

Les schémas Zod valident le formulaire, les identifiants, dates, étapes, responsables, avancement et cohérence du budget à l’import. Les textes et liens viennent exclusivement du catalogue. La sauvegarde versionnée est limitée à 64 Ko et à une clé dédiée. Le stockage local nécessite un choix explicite ; son absence ou son échec ne doit pas être présenté comme une synchronisation réussie.

Les fichiers ICS utilisent des jours calendaires sans décalage de fuseau, un DTEND exclusif au lendemain, des UID stables, CRLF, échappement et pliage UTF-8 à 75 octets, conformément aux sections 3.1 et 3.6.1 de la [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545). Ils ne contiennent ni invitation ni alarme. La sauvegarde de plan est distincte du calendrier et permet de restaurer l’avancement après validation et confirmation. Le récapitulatif n’est transmis par aucun service : l’utilisateur choisit son destinataire et son moyen d’envoi.

Conséquences : aucune synchronisation entre appareils, membres ou compte ; conflit possible entre onglets avec dernier enregistrement gagnant. Une future version partagée devra utiliser les permissions du foyer, gérer les conflits et le consentement du relais. La version actuelle annonce ses limites dans l’interface. Aucune migration de base de données n’est nécessaire.
