-- Keep privileged fields server-controlled, and accept invitations atomically.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (first_name, last_name, avatar_url, phone_number, referral_code, calendar_tokens, updated_at)
  ON public.profiles TO authenticated;
-- Use the verified Auth identity for the existing project-owner bootstrap.
UPDATE public.profiles SET is_admin = true
WHERE id IN (SELECT id FROM auth.users WHERE lower(email) = 'mehdi@tamel.fr' AND email_confirmed_at IS NOT NULL);

ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.update_updated_at() SET search_path = '';
ALTER FUNCTION public.compute_document_status() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.handle_new_user(), public.update_updated_at(), public.compute_document_status()
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.owns_household(target_household uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.households WHERE id = target_household AND owner_id = (SELECT auth.uid()));
$$;
REVOKE ALL ON FUNCTION private.owns_household(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.owns_household(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.owned_household_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT id FROM public.households WHERE owner_id = (SELECT auth.uid());
$$;
REVOKE ALL ON FUNCTION private.owned_household_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.owned_household_ids() TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.user_household_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT private.owned_household_ids();
$$;
REVOKE ALL ON FUNCTION public.user_household_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_household_ids() TO authenticated, service_role;

-- Email is read from Auth, never from the editable profile or user_metadata.
CREATE OR REPLACE FUNCTION private.is_invitation_recipient(invited_email text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM auth.users
    WHERE id = (SELECT auth.uid()) AND email_confirmed_at IS NOT NULL
      AND lower(email) = lower(trim(invited_email)));
$$;
REVOKE ALL ON FUNCTION private.is_invitation_recipient(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_invitation_recipient(text) TO authenticated, service_role;

DO $$ DECLARE p record; BEGIN
  FOR p IN SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('household_members', 'household_invitations')
  LOOP EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename); END LOOP;
END $$;

ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.household_members, public.household_invitations FROM PUBLIC, anon, authenticated;
GRANT SELECT, DELETE ON public.household_members TO authenticated;
GRANT UPDATE (role) ON public.household_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.household_invitations TO authenticated;
GRANT UPDATE (status) ON public.household_invitations TO authenticated;
GRANT ALL ON public.household_members, public.household_invitations TO service_role;

CREATE POLICY members_read ON public.household_members FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.owns_household(household_id));
CREATE POLICY members_update ON public.household_members FOR UPDATE TO authenticated
  USING (private.owns_household(household_id) AND role <> 'owner')
  WITH CHECK (private.owns_household(household_id) AND role IN ('partner', 'viewer', 'nanny'));
CREATE POLICY members_delete ON public.household_members FOR DELETE TO authenticated
  USING (role <> 'owner' AND (user_id = (SELECT auth.uid()) OR private.owns_household(household_id)));

CREATE POLICY invitations_read ON public.household_invitations FOR SELECT TO authenticated
  USING (private.owns_household(household_id) OR private.is_invitation_recipient(invitee_email));
CREATE POLICY invitations_create ON public.household_invitations FOR INSERT TO authenticated
  WITH CHECK (private.owns_household(household_id) AND inviter_id = (SELECT auth.uid())
    AND status = 'pending' AND accepted_at IS NULL AND role IN ('partner', 'viewer', 'nanny')
    AND expires_at > now() AND expires_at <= now() + interval '7 days');
CREATE POLICY invitations_cancel ON public.household_invitations FOR UPDATE TO authenticated
  USING (private.owns_household(household_id) AND status = 'pending')
  WITH CHECK (private.owns_household(household_id) AND status IN ('expired', 'declined'));
CREATE POLICY invitations_delete ON public.household_invitations FOR DELETE TO authenticated
  USING (private.owns_household(household_id));

CREATE OR REPLACE FUNCTION private.accept_household_invitation(invitation_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE invitation public.household_invitations%ROWTYPE; caller uuid := auth.uid();
BEGIN
  IF caller IS NULL OR invitation_token IS NULL OR length(invitation_token) <> 64 THEN
    RAISE EXCEPTION 'Invitation introuvable ou expirée' USING ERRCODE = 'P0001';
  END IF;
  SELECT * INTO invitation FROM public.household_invitations WHERE token = invitation_token FOR UPDATE;
  IF NOT FOUND OR invitation.status <> 'pending' OR invitation.expires_at <= now()
    OR NOT private.is_invitation_recipient(invitation.invitee_email)
    OR NOT EXISTS (SELECT 1 FROM public.households WHERE id = invitation.household_id AND owner_id = invitation.inviter_id)
    OR private.owns_household(invitation.household_id) THEN
    RAISE EXCEPTION 'Invitation introuvable ou expirée' USING ERRCODE = 'P0001';
  END IF;
  IF EXISTS (SELECT 1 FROM public.household_members WHERE household_id = invitation.household_id AND user_id = caller) THEN
    RAISE EXCEPTION 'Tu fais déjà partie de ce foyer' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.household_members(household_id, user_id, role)
    VALUES (invitation.household_id, caller, invitation.role);
  UPDATE public.household_invitations SET status = 'accepted', accepted_at = now() WHERE id = invitation.id;
  RETURN invitation.household_id;
END;
$$;
REVOKE ALL ON FUNCTION private.accept_household_invitation(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.accept_household_invitation(text) TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.accept_household_invitation(invitation_token text)
RETURNS uuid LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT private.accept_household_invitation(invitation_token);
$$;
REVOKE ALL ON FUNCTION public.accept_household_invitation(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_household_invitation(text) TO authenticated, service_role;
