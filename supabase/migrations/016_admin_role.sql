-- Phase 17: Rôle admin porté par la base plutôt qu'un email codé en dur
-- UP

-- Drapeau admin sur les profils. Par défaut personne n'est admin.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Bootstrap : le porteur du projet est admin (remplace l'ancien test sur l'email).
-- Idempotent : ne fait rien si le profil n'existe pas encore.
UPDATE profiles SET is_admin = true WHERE email = 'mehdi@tamel.fr';

-- Note : is_admin n'est jamais exposé en écriture côté client.
-- Les policies RLS existantes sur profiles ne permettent à un utilisateur que de
-- voir/éditer sa propre ligne ; la promotion d'un admin se fait via service_role
-- (migration/seed ou action serveur dédiée). On ne crée donc pas de policy
-- supplémentaire ici.

-- DOWN (rollback):
-- ALTER TABLE profiles DROP COLUMN IF EXISTS is_admin;
