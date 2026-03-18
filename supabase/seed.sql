-- Seed data: Foyer TAMELGHAGHET (beta test)
-- This seed file is designed to be run after a user with email mehdi@tamel.fr is created via Supabase Auth

-- Insert household (assumes profile already exists via auth trigger)
-- These UUIDs are placeholders — in production, use the actual auth.users UUID

-- Example seed for local development:
-- 1. Create user via Supabase Auth UI or API
-- 2. Then run this with the actual user UUID

DO $$
DECLARE
  v_user_id UUID;
  v_household_id UUID;
  v_mehdi_id UUID;
  v_yasmine_id UUID;
  v_matis_id UUID;
BEGIN
  -- Check if seed user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'mehdi@tamel.fr' LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Seed user mehdi@tamel.fr not found. Skipping seed data.';
    RETURN;
  END IF;

  -- Create household
  INSERT INTO households (id, name, owner_id)
  VALUES (gen_random_uuid(), 'Foyer TAMELGHAGHET', v_user_id)
  RETURNING id INTO v_household_id;

  -- Add family members
  INSERT INTO family_members (id, household_id, first_name, last_name, birth_date, gender, member_type)
  VALUES (gen_random_uuid(), v_household_id, 'Mehdi', 'TAMELGHAGHET', '1990-03-15', 'M', 'adult')
  RETURNING id INTO v_mehdi_id;

  INSERT INTO family_members (id, household_id, first_name, last_name, birth_date, gender, member_type)
  VALUES (gen_random_uuid(), v_household_id, 'Yasmine', 'TAMELGHAGHET', '1993-05-15', 'F', 'adult')
  RETURNING id INTO v_yasmine_id;

  INSERT INTO family_members (id, household_id, first_name, last_name, birth_date, gender, member_type)
  VALUES (gen_random_uuid(), v_household_id, 'Matis', 'TAMELGHAGHET', '2025-03-10', 'M', 'child')
  RETURNING id INTO v_matis_id;

  -- Add fiscal data
  INSERT INTO fiscal_years (household_id, year, nb_parts, revenu_net_imposable, tmi)
  VALUES (v_household_id, 2025, 2.5, NULL, 30);

  -- Add CAF allocations
  INSERT INTO caf_allocations (household_id, allocation_type, monthly_amount, start_date, active)
  VALUES
    (v_household_id, 'PAJE - Allocation de base', 184.81, '2025-04-01', true),
    (v_household_id, 'CMG', 347.19, '2025-04-01', true);

  -- Add Matis vaccinations (first doses at 2 months)
  INSERT INTO vaccinations (member_id, vaccine_name, vaccine_code, dose_number, administered_date, status)
  VALUES
    (v_matis_id, 'Diphtérie-Tétanos-Polio-Coqueluche', 'DTPCa', 1, '2025-05-10', 'done'),
    (v_matis_id, 'Haemophilus influenzae b', 'Hib', 1, '2025-05-10', 'done'),
    (v_matis_id, 'Hépatite B', 'HepB', 1, '2025-05-10', 'done'),
    (v_matis_id, 'Pneumocoque', 'PCV', 1, '2025-05-10', 'done');

  RAISE NOTICE 'Seed data created successfully for foyer TAMELGHAGHET';
END $$;
