-- UP: Add physical activity tracking to daily health journal
ALTER TABLE daily_health_journal
ADD COLUMN IF NOT EXISTS physical_activity_minutes INT;

-- DOWN: ALTER TABLE daily_health_journal DROP COLUMN IF EXISTS physical_activity_minutes;
