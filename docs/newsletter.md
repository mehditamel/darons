# Newsletter

La demande d'inscription enregistre une adresse normalisée et un jeton aléatoire dont seul le hachage est conservé en base. L'inscription n'est active qu'après confirmation explicite sur le site, dans les 48 heures. Une simple ouverture du lien, notamment par un analyseur d'emails, ne change aucune préférence.

Le même lien de gestion permet une désinscription explicite. Cette action invalide le jeton sans supprimer le compte Darons. Une nouvelle inscription exige une nouvelle confirmation.

## Mise en service

- Appliquer `20260912013955_newsletter_confirmation.sql`. La migration crée le stockage s'il est absent et conserve les abonnements existants.
- Configurer `SUPABASE_SECRET_KEY` et `RESEND_API_KEY` en production. Le domaine de l'expéditeur `Darons <noreply@darons.app>` doit être validé chez Resend.
- Vérifier avec une adresse de test autorisée la réception, la confirmation, la désinscription et la réinscription. Les tests automatisés utilisent un fournisseur simulé et ne prouvent pas la délivrabilité en production.

Les adresses et les fonctions de gestion sont accessibles uniquement au serveur. La base limite les demandes à une confirmation par adresse toutes les quinze minutes, y compris entre plusieurs instances. Une erreur du fournisseur est affichée comme un échec d'envoi et permet une nouvelle tentative. L'API ne révèle pas si une adresse est déjà abonnée.

Les futurs envois de campagne doivent sélectionner seulement les abonnements confirmés sans date de désinscription et inclure un lien de désinscription valide. Aucun envoi de campagne automatique n'est ajouté par cette fonctionnalité.
