-- Establish a trustworthy admin flag before exposing the authorization RPC.
-- This also repairs installations that already applied the preceding migration.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
REVOKE UPDATE ON public.profiles FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (is_admin, role, email, subscription_plan, stripe_customer_id)
  ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (first_name, last_name, avatar_url, phone_number, referral_code, calendar_tokens, updated_at)
  ON public.profiles TO authenticated;
UPDATE public.profiles SET is_admin = EXISTS (
  SELECT 1 FROM auth.users WHERE auth.users.id = profiles.id
    AND lower(auth.users.email) = 'mehdi@tamel.fr' AND auth.users.email_confirmed_at IS NOT NULL
);

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_admin = true);
$$;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated, service_role;
