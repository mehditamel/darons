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
