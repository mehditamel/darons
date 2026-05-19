-- Phase 16: Carnet de Confiance — lien + PIN partagés pour nounou/grands-parents
-- UP

CREATE TABLE trust_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  label TEXT,
  token TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '["allergies","vaccinations","emergency","practitioners","routines"]'::jsonb,
  notes TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  access_count INT NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trust_cards_token ON trust_cards(token);
CREATE INDEX idx_trust_cards_household ON trust_cards(household_id);
CREATE INDEX idx_trust_cards_member ON trust_cards(member_id);

-- RLS — seul le foyer propriétaire voit/édite SES carnets
-- La route publique /c/[token] passe par le service_role après vérif PIN
ALTER TABLE trust_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own trust cards" ON trust_cards
  FOR ALL USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- DOWN (rollback):
-- DROP TABLE trust_cards;
