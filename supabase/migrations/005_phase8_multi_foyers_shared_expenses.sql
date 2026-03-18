-- Phase 8: Multi-foyers, Parrainage, Dépenses partagées, Arrondi épargne
-- UP migration

-- ═══════════════════════════════════════════════════════════
-- 1. MULTI-FOYERS — Invitations & partage cross-household
-- ═══════════════════════════════════════════════════════════

-- Household invitations (invite grandparents, nanny, co-parent)
CREATE TABLE household_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id),
  invitee_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('partner', 'viewer', 'nanny')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Household members (link users to multiple households)
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'partner', 'viewer', 'nanny')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, user_id)
);

-- Migrate existing owners into household_members
INSERT INTO household_members (household_id, user_id, role)
SELECT id, owner_id, 'owner' FROM households
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- 2. PROGRAMME DE PARRAINAGE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id),
  referral_code TEXT NOT NULL UNIQUE,
  referree_id UUID REFERENCES profiles(id),
  referree_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'subscribed', 'rewarded')),
  reward_type TEXT DEFAULT 'free_month' CHECK (reward_type IN ('free_month', 'discount_20', 'storage_bonus')),
  reward_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  converted_at TIMESTAMPTZ
);

-- Add referral code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- ═══════════════════════════════════════════════════════════
-- 3. DÉPENSES PARTAGÉES (type Tricount)
-- ═══════════════════════════════════════════════════════════

-- Expense groups (can span household or friends)
CREATE TABLE expense_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  currency TEXT DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Participants in an expense group
CREATE TABLE expense_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES expense_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  external_name TEXT, -- for non-registered participants
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shared expenses
CREATE TABLE shared_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES expense_groups(id) ON DELETE CASCADE,
  paid_by UUID NOT NULL REFERENCES expense_group_members(id),
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  category TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expense splits (who owes what)
CREATE TABLE expense_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES shared_expenses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES expense_group_members(id),
  amount NUMERIC(10,2) NOT NULL,
  is_settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Settlements (payments between members)
CREATE TABLE expense_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES expense_groups(id) ON DELETE CASCADE,
  from_member UUID NOT NULL REFERENCES expense_group_members(id),
  to_member UUID NOT NULL REFERENCES expense_group_members(id),
  amount NUMERIC(10,2) NOT NULL,
  settled_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 4. ARRONDI ÉPARGNE AUTOMATIQUE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE roundup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  roundup_to NUMERIC(4,2) DEFAULT 1.00, -- round up to nearest X (1€ default)
  target_goal_id UUID REFERENCES savings_goals(id) ON DELETE SET NULL,
  monthly_cap NUMERIC(8,2) DEFAULT 50.00, -- max monthly roundup
  total_rounded NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Log of individual roundup events
CREATE TABLE roundup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  transaction_amount NUMERIC(10,2) NOT NULL,
  roundup_amount NUMERIC(10,2) NOT NULL,
  goal_id UUID REFERENCES savings_goals(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- 5. ADMIN SaaS DASHBOARD (metrics storage)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE admin_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL UNIQUE,
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  free_users INT DEFAULT 0,
  premium_users INT DEFAULT 0,
  family_pro_users INT DEFAULT 0,
  mrr_cents INT DEFAULT 0, -- in cents to avoid float issues
  churn_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════

ALTER TABLE household_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roundup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roundup_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Household invitations: visible to household owner or invitee
CREATE POLICY "household_invitations_policy" ON household_invitations
  FOR ALL USING (
    inviter_id = auth.uid()
    OR invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Household members: visible to members of the same household
CREATE POLICY "household_members_select" ON household_members
  FOR SELECT USING (
    household_id IN (SELECT household_id FROM household_members hm WHERE hm.user_id = auth.uid())
  );

CREATE POLICY "household_members_insert" ON household_members
  FOR INSERT WITH CHECK (
    household_id IN (SELECT id FROM households WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "household_members_delete" ON household_members
  FOR DELETE USING (
    household_id IN (SELECT id FROM households WHERE owner_id = auth.uid())
  );

-- Referrals: user sees own referrals
CREATE POLICY "referrals_policy" ON referrals
  FOR ALL USING (referrer_id = auth.uid() OR referree_id = auth.uid());

-- Expense groups: accessible to members
CREATE POLICY "expense_groups_policy" ON expense_groups
  FOR ALL USING (
    created_by = auth.uid()
    OR id IN (SELECT group_id FROM expense_group_members WHERE user_id = auth.uid())
  );

-- Expense group members: accessible if in the group
CREATE POLICY "expense_group_members_policy" ON expense_group_members
  FOR ALL USING (
    user_id = auth.uid()
    OR group_id IN (SELECT group_id FROM expense_group_members egm WHERE egm.user_id = auth.uid())
  );

-- Shared expenses: accessible if in the group
CREATE POLICY "shared_expenses_policy" ON shared_expenses
  FOR ALL USING (
    group_id IN (SELECT group_id FROM expense_group_members WHERE user_id = auth.uid())
  );

-- Expense splits: accessible if in the group
CREATE POLICY "expense_splits_policy" ON expense_splits
  FOR ALL USING (
    expense_id IN (
      SELECT se.id FROM shared_expenses se
      JOIN expense_group_members egm ON egm.group_id = se.group_id
      WHERE egm.user_id = auth.uid()
    )
  );

-- Settlements: accessible if in the group
CREATE POLICY "expense_settlements_policy" ON expense_settlements
  FOR ALL USING (
    group_id IN (SELECT group_id FROM expense_group_members WHERE user_id = auth.uid())
  );

-- Roundup settings: household members only
CREATE POLICY "roundup_settings_policy" ON roundup_settings
  FOR ALL USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

CREATE POLICY "roundup_log_policy" ON roundup_log
  FOR ALL USING (
    household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid())
  );

-- Admin metrics: only service role (no user access by default)
CREATE POLICY "admin_metrics_no_access" ON admin_metrics_daily
  FOR ALL USING (false);

-- ═══════════════════════════════════════════════════════════
-- DOWN migration (rollback)
-- ═══════════════════════════════════════════════════════════
-- DROP TABLE IF EXISTS admin_metrics_daily CASCADE;
-- DROP TABLE IF EXISTS roundup_log CASCADE;
-- DROP TABLE IF EXISTS roundup_settings CASCADE;
-- DROP TABLE IF EXISTS expense_settlements CASCADE;
-- DROP TABLE IF EXISTS expense_splits CASCADE;
-- DROP TABLE IF EXISTS shared_expenses CASCADE;
-- DROP TABLE IF EXISTS expense_group_members CASCADE;
-- DROP TABLE IF EXISTS expense_groups CASCADE;
-- DROP TABLE IF EXISTS referrals CASCADE;
-- DROP TABLE IF EXISTS household_members CASCADE;
-- DROP TABLE IF EXISTS household_invitations CASCADE;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS referral_code;
