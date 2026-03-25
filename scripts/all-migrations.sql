-- ============================================================================
-- DARONS.APP — Toutes les migrations combinees (001 a 013)
-- ============================================================================
-- Executer ce fichier dans Supabase Dashboard > SQL Editor
-- URL : https://supabase.com/dashboard/project/wbjksfqxpnnopfunmcxi/sql/new
-- ============================================================================


-- ========== 001_initial_schema.sql ==========

-- Migration 001: Initial schema for Ma Vie Parentale
-- UP

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'partner', 'viewer')),
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'family_pro')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Households
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Family members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')),
  member_type TEXT NOT NULL CHECK (member_type IN ('adult', 'child')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Identity documents
CREATE TABLE identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('cni', 'passeport', 'livret_famille', 'acte_naissance', 'carte_vitale', 'autre')),
  document_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'expiring_soon')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vaccinations
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_code TEXT,
  dose_number INT NOT NULL DEFAULT 1,
  administered_date DATE,
  next_due_date DATE,
  practitioner TEXT,
  batch_number TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('done', 'pending', 'overdue', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Medical appointments
CREATE TABLE medical_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  appointment_type TEXT NOT NULL,
  practitioner TEXT,
  location TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Growth measurements
CREATE TABLE growth_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,1),
  head_circumference_cm NUMERIC(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Digital vault (documents)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  category TEXT NOT NULL CHECK (category IN ('identite', 'sante', 'fiscal', 'scolaire', 'caf', 'assurance', 'logement', 'autre')),
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INT,
  mime_type TEXT,
  tags TEXT[],
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Development milestones
CREATE TABLE development_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('motricite', 'langage', 'cognition', 'social', 'autonomie')),
  milestone_name TEXT NOT NULL,
  expected_age_months INT,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Parent journal
CREATE TABLE parent_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'difficult', 'tough')),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  provider TEXT,
  schedule TEXT,
  cost_monthly NUMERIC(8,2),
  start_date DATE,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Schooling
CREATE TABLE schooling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  school_year TEXT NOT NULL,
  level TEXT NOT NULL,
  establishment TEXT,
  teacher TEXT,
  class_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fiscal years
CREATE TABLE fiscal_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  year INT NOT NULL,
  nb_parts NUMERIC(3,1) NOT NULL,
  revenu_net_imposable NUMERIC(12,2),
  impot_brut NUMERIC(10,2),
  credits_impot JSONB DEFAULT '{}',
  impot_net NUMERIC(10,2),
  tmi INT,
  taux_effectif NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, year)
);

-- Budget entries
CREATE TABLE budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  month DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('alimentation', 'sante', 'garde', 'vetements', 'loisirs', 'scolarite', 'transport', 'logement', 'assurance', 'autre')),
  label TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CAF allocations
CREATE TABLE caf_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  allocation_type TEXT NOT NULL,
  monthly_amount NUMERIC(8,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Health examinations
CREATE TABLE health_examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  exam_number INT NOT NULL,
  exam_age_label TEXT NOT NULL,
  scheduled_date DATE,
  completed_date DATE,
  practitioner TEXT,
  weight_kg NUMERIC(5,2),
  height_cm NUMERIC(5,1),
  head_circumference_cm NUMERIC(5,1),
  screen_exposure_notes TEXT,
  tnd_screening_notes TEXT,
  notes TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'missed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Administrative tasks
CREATE TABLE administrative_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('grossesse', 'naissance', 'garde', 'scolarite', 'fiscal', 'caf', 'sante', 'identite', 'autre')),
  due_date DATE,
  trigger_age_months INT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  url TEXT,
  template_id TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User consents (RGPD)
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'terms_of_service', 'privacy_policy', 'health_data',
    'open_banking', 'ai_processing', 'email_notifications',
    'sms_notifications', 'push_notifications', 'analytics'
  )),
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT
);

-- Notification log
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  notification_type TEXT NOT NULL,
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered BOOLEAN DEFAULT false,
  metadata JSONB
);

-- Childcare structures (cache)
CREATE TABLE childcare_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  name TEXT NOT NULL,
  structure_type TEXT NOT NULL CHECK (structure_type IN ('creche', 'micro_creche', 'assistante_maternelle', 'mam', 'accueil_loisirs', 'relais_pe')),
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  capacity INT,
  phone TEXT,
  email TEXT,
  website TEXT,
  hourly_rate NUMERIC(6,2),
  opening_hours JSONB,
  activities TEXT[],
  rating NUMERIC(3,2),
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Childcare favorites
CREATE TABLE childcare_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  structure_id UUID NOT NULL REFERENCES childcare_structures(id),
  notes TEXT,
  status TEXT DEFAULT 'shortlisted' CHECK (status IN ('shortlisted', 'contacted', 'visited', 'enrolled', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, structure_id)
);

-- Savings goals
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC(10,2) NOT NULL,
  current_amount NUMERIC(10,2) DEFAULT 0,
  target_date DATE,
  icon TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-compute identity_documents status based on expiry_date
CREATE OR REPLACE FUNCTION compute_document_status()
RETURNS trigger AS $$
BEGIN
  NEW.status := CASE
    WHEN NEW.expiry_date IS NULL THEN 'valid'
    WHEN NEW.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN NEW.expiry_date < CURRENT_DATE + INTERVAL '3 months' THEN 'expiring_soon'
    ELSE 'valid'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_identity_document_status
  BEFORE INSERT OR UPDATE ON identity_documents
  FOR EACH ROW EXECUTE FUNCTION compute_document_status();

-- ========== 002_rls_policies.sql ==========

-- Migration 002: Row Level Security policies
-- UP

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE schooling ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE caf_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrative_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE childcare_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Households: owner can CRUD
CREATE POLICY "Users see own household" ON households
  FOR ALL USING (owner_id = auth.uid());

-- Helper: check if user owns the household
CREATE OR REPLACE FUNCTION user_household_ids()
RETURNS SETOF UUID AS $$
  SELECT id FROM households WHERE owner_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Family members: via household ownership
CREATE POLICY "Users manage own family members" ON family_members
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- Identity documents: via family member → household
CREATE POLICY "Users manage own identity documents" ON identity_documents
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Vaccinations
CREATE POLICY "Users manage own vaccinations" ON vaccinations
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Medical appointments
CREATE POLICY "Users manage own appointments" ON medical_appointments
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Growth measurements
CREATE POLICY "Users manage own growth data" ON growth_measurements
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Documents (vault)
CREATE POLICY "Users manage own documents" ON documents
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- Development milestones
CREATE POLICY "Users manage own milestones" ON development_milestones
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Parent journal
CREATE POLICY "Users manage own journal" ON parent_journal
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Activities
CREATE POLICY "Users manage own activities" ON activities
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Schooling
CREATE POLICY "Users manage own schooling" ON schooling
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Fiscal years
CREATE POLICY "Users manage own fiscal data" ON fiscal_years
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- Budget entries
CREATE POLICY "Users manage own budget" ON budget_entries
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- CAF allocations
CREATE POLICY "Users manage own allocations" ON caf_allocations
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- Health examinations
CREATE POLICY "Users manage own health exams" ON health_examinations
  FOR ALL USING (
    member_id IN (
      SELECT id FROM family_members WHERE household_id IN (SELECT user_household_ids())
    )
  );

-- Administrative tasks
CREATE POLICY "Users manage own admin tasks" ON administrative_tasks
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- User consents
CREATE POLICY "Users manage own consents" ON user_consents
  FOR ALL USING (user_id = auth.uid());

-- Notification log
CREATE POLICY "Users see own notifications" ON notification_log
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- Childcare favorites
CREATE POLICY "Users manage own favorites" ON childcare_favorites
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- Childcare structures: readable by all authenticated users
ALTER TABLE childcare_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view structures" ON childcare_structures
  FOR SELECT USING (auth.role() = 'authenticated');

-- Savings goals
CREATE POLICY "Users manage own savings goals" ON savings_goals
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- ========== 003_alerts_table.sql ==========

-- Migration 003: Proactive alerts table + AI usage tracking
-- UP

-- Proactive alerts generated by the system or AI
CREATE TABLE proactive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT NOT NULL CHECK (category IN ('identite', 'sante', 'fiscal', 'caf', 'scolarite', 'budget')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  due_date DATE,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- AI usage tracking per household per month
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- first day of month
  call_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, month)
);

-- AI monthly summaries cache
CREATE TABLE ai_monthly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  health TEXT NOT NULL,
  development TEXT NOT NULL,
  budget TEXT NOT NULL,
  admin TEXT NOT NULL,
  priorities TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(household_id, month)
);

-- RLS
ALTER TABLE proactive_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_monthly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own alerts" ON proactive_alerts
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

CREATE POLICY "Users see own AI usage" ON ai_usage
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

CREATE POLICY "Users manage own summaries" ON ai_monthly_summaries
  FOR ALL USING (household_id IN (SELECT user_household_ids()));

-- DOWN
-- DROP TABLE ai_monthly_summaries;
-- DROP TABLE ai_usage;
-- DROP TABLE proactive_alerts;

-- ========== 004_phase7_sante_enrichie.sql ==========

-- Phase 7: Santé enrichie & OCR
-- UP: New tables for daily health journal, prescriptions, allergies + gestational age

-- Add gestational age to family_members (for premature age correction)
ALTER TABLE family_members ADD COLUMN gestational_age_weeks INT;

-- Daily health journal (enriched: mood, sleep, appetite, stools, screen time)
CREATE TABLE daily_health_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT CHECK (mood IN ('great', 'good', 'neutral', 'difficult', 'tough')),
  sleep_hours NUMERIC(4,1),
  sleep_quality TEXT CHECK (sleep_quality IN ('excellent', 'good', 'average', 'poor', 'very_poor')),
  appetite TEXT CHECK (appetite IN ('good', 'average', 'poor')),
  stools TEXT CHECK (stools IN ('normal', 'liquid', 'hard', 'absent')),
  screen_time_minutes INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, entry_date)
);

-- Prescriptions (OCR'd ordonnances)
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  scan_file_path TEXT,
  ocr_text TEXT,
  medications JSONB DEFAULT '[]',
  practitioner TEXT,
  prescription_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allergies & intolerances
CREATE TABLE allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  allergen TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe')),
  reaction TEXT,
  diagnosed_date DATE,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE daily_health_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own daily journal" ON daily_health_journal
  FOR ALL USING (
    member_id IN (
      SELECT fm.id FROM family_members fm
      JOIN households h ON fm.household_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own prescriptions" ON prescriptions
  FOR ALL USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own allergies" ON allergies
  FOR ALL USING (
    member_id IN (
      SELECT fm.id FROM family_members fm
      JOIN households h ON fm.household_id = h.id
      WHERE h.owner_id = auth.uid()
    )
  );

-- DOWN (for rollback):
-- DROP TABLE IF EXISTS allergies;
-- DROP TABLE IF EXISTS prescriptions;
-- DROP TABLE IF EXISTS daily_health_journal;
-- ALTER TABLE family_members DROP COLUMN IF EXISTS gestational_age_weeks;

-- ========== 005_phase8_multi_foyers_shared_expenses.sql ==========

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

-- ========== 006_calendar_tokens.sql ==========

-- UP: Add calendar_tokens JSONB column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendar_tokens JSONB;

COMMENT ON COLUMN profiles.calendar_tokens IS 'Encrypted Google Calendar OAuth tokens (access_token, refresh_token, expires_at)';

-- DOWN: ALTER TABLE profiles DROP COLUMN IF EXISTS calendar_tokens;

-- ========== 007_phone_number.sql ==========

-- Migration 007: Add phone_number to profiles for SMS notifications (Twilio)

-- UP
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- DOWN (rollback)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS phone_number;

-- ========== 008_analytics_sessions.sql ==========

-- Phase 11: Analytics — user sessions and events for DAU/MAU tracking
-- UP

-- Track user sessions for DAU/MAU
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, session_date)
);

-- Track in-app events for cohort analysis
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast DAU/MAU queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_date ON user_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_name ON user_events(event_name);
CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_created ON user_events(created_at);

-- RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Users can only see/insert their own sessions
CREATE POLICY "Users manage own sessions" ON user_sessions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users manage own events" ON user_events
  FOR ALL USING (user_id = auth.uid());

-- DOWN
-- DROP TABLE IF EXISTS user_events;
-- DROP TABLE IF EXISTS user_sessions;

-- ========== 008b_banking_tables.sql ==========

-- Migration 008b: Create banking tables (missing from initial migrations)
-- These tables are referenced in 009 but were never created
-- UP

CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  bridge_item_id TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'needs_refresh', 'error', 'disconnected')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  bridge_account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT,
  balance NUMERIC(12,2),
  currency TEXT DEFAULT 'EUR',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  bridge_transaction_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  description TEXT,
  category_auto TEXT,
  category_user TEXT,
  member_id UUID REFERENCES family_members(id),
  transaction_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DOWN
-- DROP TABLE IF EXISTS bank_transactions;
-- DROP TABLE IF EXISTS bank_accounts;
-- DROP TABLE IF EXISTS bank_connections;

-- ========== 009_phase12_banking_push_admin.sql ==========

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

-- ========== 010_phase13_rgpd_deletion.sql ==========

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

-- ========== 011_phase14_fhir_sync.sql ==========

-- Phase 14: Mon Espace Santé FHIR integration
-- UP: Add FHIR tracking columns and sync tables

-- Add FHIR patient ID to family members
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS fhir_patient_id TEXT;

-- Add FHIR tracking columns to vaccinations
ALTER TABLE vaccinations ADD COLUMN IF NOT EXISTS fhir_resource_id TEXT;
ALTER TABLE vaccinations ADD COLUMN IF NOT EXISTS fhir_last_updated TIMESTAMPTZ;
ALTER TABLE vaccinations ADD COLUMN IF NOT EXISTS sync_source TEXT NOT NULL DEFAULT 'local' CHECK (sync_source IN ('local', 'fhir'));

-- Add FHIR tracking columns to growth_measurements
ALTER TABLE growth_measurements ADD COLUMN IF NOT EXISTS fhir_resource_id TEXT;
ALTER TABLE growth_measurements ADD COLUMN IF NOT EXISTS fhir_last_updated TIMESTAMPTZ;
ALTER TABLE growth_measurements ADD COLUMN IF NOT EXISTS sync_source TEXT NOT NULL DEFAULT 'local' CHECK (sync_source IN ('local', 'fhir'));

-- Add FHIR tracking columns to allergies
ALTER TABLE allergies ADD COLUMN IF NOT EXISTS fhir_resource_id TEXT;
ALTER TABLE allergies ADD COLUMN IF NOT EXISTS fhir_last_updated TIMESTAMPTZ;
ALTER TABLE allergies ADD COLUMN IF NOT EXISTS sync_source TEXT NOT NULL DEFAULT 'local' CHECK (sync_source IN ('local', 'fhir'));

-- Add FHIR tracking columns to prescriptions
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS fhir_resource_id TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS fhir_last_updated TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS sync_source TEXT NOT NULL DEFAULT 'local' CHECK (sync_source IN ('local', 'fhir'));

-- Mon Espace Santé connections per family member
CREATE TABLE IF NOT EXISTS mes_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  mes_patient_id TEXT NOT NULL,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expiry TIMESTAMPTZ,
  consent_granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT NOT NULL DEFAULT 'connected' CHECK (sync_status IN ('connected', 'syncing', 'error', 'disconnected', 'token_expired')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id)
);

-- FHIR sync log for audit trail
CREATE TABLE IF NOT EXISTS fhir_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('Immunization', 'Observation', 'AllergyIntolerance', 'DocumentReference', 'Patient')),
  direction TEXT NOT NULL CHECK (direction IN ('pull', 'push')),
  records_synced INT NOT NULL DEFAULT 0,
  records_created INT NOT NULL DEFAULT 0,
  records_updated INT NOT NULL DEFAULT 0,
  records_skipped INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'error')),
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Add mes_health_sync to user_consents consent_type check
-- (recreate the check constraint to include the new value)
ALTER TABLE user_consents DROP CONSTRAINT IF EXISTS user_consents_consent_type_check;
ALTER TABLE user_consents ADD CONSTRAINT user_consents_consent_type_check CHECK (
  consent_type IN (
    'terms_of_service', 'privacy_policy', 'health_data',
    'open_banking', 'ai_processing', 'email_notifications',
    'sms_notifications', 'push_notifications', 'analytics',
    'mes_health_sync'
  )
);

-- Indexes for FHIR resource lookups
CREATE INDEX IF NOT EXISTS idx_vaccinations_fhir_resource_id ON vaccinations(fhir_resource_id) WHERE fhir_resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_growth_measurements_fhir_resource_id ON growth_measurements(fhir_resource_id) WHERE fhir_resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_allergies_fhir_resource_id ON allergies(fhir_resource_id) WHERE fhir_resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_fhir_resource_id ON prescriptions(fhir_resource_id) WHERE fhir_resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mes_connections_member_id ON mes_connections(member_id);
CREATE INDEX IF NOT EXISTS idx_fhir_sync_log_member_id ON fhir_sync_log(member_id);
CREATE INDEX IF NOT EXISTS idx_fhir_sync_log_household_id ON fhir_sync_log(household_id);

-- RLS policies for mes_connections
ALTER TABLE mes_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own MES connections" ON mes_connections
  FOR ALL USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- RLS policies for fhir_sync_log
ALTER TABLE fhir_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own FHIR sync logs" ON fhir_sync_log
  FOR ALL USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- DOWN (rollback):
-- ALTER TABLE family_members DROP COLUMN IF EXISTS fhir_patient_id;
-- ALTER TABLE vaccinations DROP COLUMN IF EXISTS fhir_resource_id;
-- ALTER TABLE vaccinations DROP COLUMN IF EXISTS fhir_last_updated;
-- ALTER TABLE vaccinations DROP COLUMN IF EXISTS sync_source;
-- ALTER TABLE growth_measurements DROP COLUMN IF EXISTS fhir_resource_id;
-- ALTER TABLE growth_measurements DROP COLUMN IF EXISTS fhir_last_updated;
-- ALTER TABLE growth_measurements DROP COLUMN IF EXISTS sync_source;
-- ALTER TABLE allergies DROP COLUMN IF EXISTS fhir_resource_id;
-- ALTER TABLE allergies DROP COLUMN IF EXISTS fhir_last_updated;
-- ALTER TABLE allergies DROP COLUMN IF EXISTS sync_source;
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS fhir_resource_id;
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS fhir_last_updated;
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS sync_source;
-- DROP TABLE IF EXISTS fhir_sync_log;
-- DROP TABLE IF EXISTS mes_connections;

-- ========== 012_performance_indexes.sql ==========

-- Performance indexes on frequently queried foreign keys
-- UP

CREATE INDEX IF NOT EXISTS idx_family_members_household ON family_members(household_id);
CREATE INDEX IF NOT EXISTS idx_identity_documents_member ON identity_documents(member_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_member ON vaccinations(member_id);
CREATE INDEX IF NOT EXISTS idx_medical_appointments_member ON medical_appointments(member_id);
CREATE INDEX IF NOT EXISTS idx_growth_measurements_member ON growth_measurements(member_id);
CREATE INDEX IF NOT EXISTS idx_documents_household ON documents(household_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_household_month ON budget_entries(household_id, month);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_date ON bank_transactions(account_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_proactive_alerts_household ON proactive_alerts(household_id);
CREATE INDEX IF NOT EXISTS idx_health_examinations_member ON health_examinations(member_id);
CREATE INDEX IF NOT EXISTS idx_activities_member ON activities(member_id);
CREATE INDEX IF NOT EXISTS idx_administrative_tasks_household ON administrative_tasks(household_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_household ON notification_log(household_id);
CREATE INDEX IF NOT EXISTS idx_caf_allocations_household ON caf_allocations(household_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_household ON savings_goals(household_id);
CREATE INDEX IF NOT EXISTS idx_schooling_member ON schooling(member_id);
CREATE INDEX IF NOT EXISTS idx_development_milestones_member ON development_milestones(member_id);
CREATE INDEX IF NOT EXISTS idx_parent_journal_member ON parent_journal(member_id);

-- DOWN
-- DROP INDEX IF EXISTS idx_family_members_household;
-- DROP INDEX IF EXISTS idx_identity_documents_member;
-- DROP INDEX IF EXISTS idx_vaccinations_member;
-- DROP INDEX IF EXISTS idx_medical_appointments_member;
-- DROP INDEX IF EXISTS idx_growth_measurements_member;
-- DROP INDEX IF EXISTS idx_documents_household;
-- DROP INDEX IF EXISTS idx_budget_entries_household_month;
-- DROP INDEX IF EXISTS idx_bank_transactions_account_date;
-- DROP INDEX IF EXISTS idx_proactive_alerts_household;
-- DROP INDEX IF EXISTS idx_health_examinations_member;
-- DROP INDEX IF EXISTS idx_activities_member;
-- DROP INDEX IF EXISTS idx_administrative_tasks_household;
-- DROP INDEX IF EXISTS idx_notification_log_household;
-- DROP INDEX IF EXISTS idx_caf_allocations_household;
-- DROP INDEX IF EXISTS idx_savings_goals_household;
-- DROP INDEX IF EXISTS idx_schooling_member;
-- DROP INDEX IF EXISTS idx_development_milestones_member;
-- DROP INDEX IF EXISTS idx_parent_journal_member;

-- ========== 013_physical_activity_field.sql ==========

-- UP: Add physical activity tracking to daily health journal
ALTER TABLE daily_health_journal
ADD COLUMN IF NOT EXISTS physical_activity_minutes INT;

-- DOWN: ALTER TABLE daily_health_journal DROP COLUMN IF EXISTS physical_activity_minutes;
