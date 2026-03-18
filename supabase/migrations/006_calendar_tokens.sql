-- UP: Add calendar_tokens JSONB column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS calendar_tokens JSONB;

COMMENT ON COLUMN profiles.calendar_tokens IS 'Encrypted Google Calendar OAuth tokens (access_token, refresh_token, expires_at)';

-- DOWN: ALTER TABLE profiles DROP COLUMN IF EXISTS calendar_tokens;
