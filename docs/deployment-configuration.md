# Configuration de production

Configurer les valeurs dans **Vercel → tamel → darons → Environment Variables**. Ne jamais coller de clé dans un script, un commit, une issue, un journal ou une conversation.

| Variable | Valeur attendue | Environnement |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase Darons | Production |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique `sb_publishable_…` | Production |
| `SUPABASE_SECRET_KEY` | Nouvelle clé serveur `sb_secret_…`, stockée comme Secret | Production uniquement |

Les anciennes variables `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` restent acceptées pour les installations existantes. Préférer les nouvelles clés, dont la rotation est indépendante des sessions utilisateur. Utiliser une base de test distincte pour les previews.

## Avant de rétablir la connexion

1. Déployer la correction des permissions et des invitations, puis appliquer la migration `20260912003858_secure_profiles_and_household_invitations.sql`.
2. Dans **Supabase → Darons → Settings → API Keys**, créer une nouvelle clé serveur. L'ancienne clé `service_role` a été retrouvée dans l'historique de `scripts/setup-vercel-env.sh` ; sa suppression du code ne la révoque pas.
3. Configurer les nouvelles clés dans Vercel et redéployer la production.
4. Vérifier la connexion et les opérations serveur, puis désactiver les anciennes clés **Legacy** dans Supabase. Traiter la clé historique comme compromise tant que cette désactivation n'est pas confirmée.
5. Examiner les journaux d'accès pour rechercher d'éventuelles utilisations inhabituelles ; ne pas reproduire les valeurs des clés dans le rapport.

Référence : [procédure officielle Supabase pour remplacer une clé exposée](https://supabase.com/docs/guides/getting-started/api-keys#rotate-a-leaked-or-compromised-key).

Le contrôle automatique des secrets bloque les clés présentes dans le code courant ou introduites dans les nouveaux commits. Les expositions historiques doivent être révoquées chez leur fournisseur ; aucune réécriture forcée de l'historique Git n'est effectuée par cette correction.
