-- Migration 009: Phase 12 — Banking persistence, Push subscriptions, Admin cohorts
-- UP

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());

-- Admin cohort analysis cache
CREATE TABLE admin_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_date DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('j1', 'j7', 'j30', 'j90')),
  total_users INT NOT NULL DEFAULT 0,
  retained_users INT NOT NULL DEFAULT 0,
  retention_rate NUMERIC(5,2) DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cohort_date, period)
);

ALTER TABLE admin_cohorts ENABLE ROW LEVEL SECURITY;

-- Only admin can read cohorts (via service role in server actions)
CREATE POLICY "No direct access to admin_cohorts" ON admin_cohorts
  FOR SELECT USING (false);

-- Admin user events for churn tracking
CREATE TABLE admin_user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('signup', 'upgrade', 'downgrade', 'cancel', 'reactivate', 'churn_risk')),
  previous_plan TEXT,
  new_plan TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct access to admin_user_events" ON admin_user_events
  FOR SELECT USING (false);

-- Add AI categorization columns to bank_transactions
ALTER TABLE bank_transactions
  ADD COLUMN IF NOT EXISTS ai_category TEXT,
  ADD COLUMN IF NOT EXISTS ai_categorized_at TIMESTAMPTZ;

-- Bank connections: ensure RLS
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

-- RLS for banking tables
CREATE POLICY "Users see own bank connections" ON bank_connections
  FOR ALL USING (
    household_id IN (SELECT id FROM households WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users see own bank accounts" ON bank_accounts
  FOR ALL USING (
    connection_id IN (
      SELECT bc.id FROM bank_connections bc
      JOIN households h ON bc.household_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users see own bank transactions" ON bank_transactions
  FOR ALL USING (
    account_id IN (
      SELECT ba.id FROM bank_accounts ba
      JOIN bank_connections bc ON ba.connection_id = bc.id
      JOIN households h ON bc.household_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

-- DOWN
-- DROP TABLE IF EXISTS push_subscriptions;
-- DROP TABLE IF EXISTS admin_cohorts;
-- DROP TABLE IF EXISTS admin_user_events;
-- ALTER TABLE bank_transactions DROP COLUMN IF EXISTS ai_category;
-- ALTER TABLE bank_transactions DROP COLUMN IF EXISTS ai_categorized_at;
