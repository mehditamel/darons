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
