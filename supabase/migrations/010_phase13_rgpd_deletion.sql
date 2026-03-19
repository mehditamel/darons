-- Phase 13: RGPD — Account deletion requests with 30-day grace period
-- UP

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT now(),
  scheduled_deletion_at TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days',
  cancelled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'executed'))
);

-- RLS on account_deletion_requests
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deletion requests" ON account_deletion_requests
  FOR ALL USING (user_id = auth.uid());

-- RLS on user_consents (table exists from 001 but may lack RLS)
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consents" ON user_consents
  FOR ALL USING (user_id = auth.uid());

-- DOWN (for reversibility)
-- DROP POLICY IF EXISTS "Users manage own deletion requests" ON account_deletion_requests;
-- DROP POLICY IF EXISTS "Users manage own consents" ON user_consents;
-- DROP TABLE IF EXISTS account_deletion_requests;
