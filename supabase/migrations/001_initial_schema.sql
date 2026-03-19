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
