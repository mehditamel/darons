-- Phase 17: Abonnés à la newsletter (capture email depuis la landing)
-- UP

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'site',
  confirmed BOOLEAN NOT NULL DEFAULT false,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- RLS : aucune lecture/écriture côté client. La table est alimentée
-- uniquement par la route serveur /api/newsletter/subscribe via service_role
-- (qui contourne RLS). On active RLS sans policy permissive = accès refusé
-- par défaut pour anon/authenticated.
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to newsletter_subscribers" ON newsletter_subscribers
  FOR ALL USING (false);

-- DOWN (rollback):
-- DROP TABLE newsletter_subscribers;
