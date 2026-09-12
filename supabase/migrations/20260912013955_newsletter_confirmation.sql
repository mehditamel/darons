CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text DEFAULT 'site',
  confirmed boolean NOT NULL DEFAULT false,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS manage_token_hash text,
  ADD COLUMN IF NOT EXISTS confirmation_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_manage_token_hash_idx
  ON public.newsletter_subscribers(manage_token_hash) WHERE manage_token_hash IS NOT NULL;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.newsletter_subscribers FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

-- One outstanding email per address and time window, even across server instances.
CREATE OR REPLACE FUNCTION public.request_newsletter_confirmation(email_address text, token_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  IF token_hash !~ '^[a-f0-9]{64}$' OR length(email_address) > 254 THEN
    RAISE EXCEPTION 'Invalid confirmation';
  END IF;
  INSERT INTO public.newsletter_subscribers(email, manage_token_hash, confirmation_expires_at, confirmation_sent_at)
    VALUES(lower(trim(email_address)), token_hash, now() + interval '48 hours', now())
  ON CONFLICT (email) DO UPDATE SET
    manage_token_hash = EXCLUDED.manage_token_hash,
    confirmation_expires_at = EXCLUDED.confirmation_expires_at,
    confirmation_sent_at = EXCLUDED.confirmation_sent_at,
    confirmed = false
  WHERE (NOT newsletter_subscribers.confirmed OR newsletter_subscribers.unsubscribed_at IS NOT NULL)
    AND (newsletter_subscribers.confirmation_sent_at IS NULL OR newsletter_subscribers.confirmation_sent_at < now() - interval '15 minutes');
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;
REVOKE ALL ON FUNCTION public.request_newsletter_confirmation(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_newsletter_confirmation(text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.confirm_newsletter_subscription(token_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.newsletter_subscribers SET confirmed = true, subscribed_at = now(), unsubscribed_at = NULL
    WHERE manage_token_hash = token_hash AND confirmation_expires_at > now() AND NOT confirmed;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected = 1;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_newsletter_subscription(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_newsletter_subscription(text) TO service_role;
