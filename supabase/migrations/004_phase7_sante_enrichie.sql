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
