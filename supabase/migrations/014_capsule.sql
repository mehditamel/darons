-- Phase 15: La Capsule — souvenirs et récaps IA par enfant
-- UP

-- Souvenirs (photos / vidéos / notes libres) attachés à un enfant
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('photo', 'video', 'note')),
  file_path TEXT,
  mime_type TEXT,
  file_size INT,
  caption TEXT,
  memory_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memories_member_date ON memories(member_id, memory_date DESC);
CREATE INDEX idx_memories_household ON memories(household_id);

-- Récaps IA générés (trimestre / année / personnalisé)
CREATE TABLE capsule_recaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('quarter', 'year', 'custom')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  title TEXT,
  content JSONB NOT NULL,
  cover_memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('generating', 'ready', 'failed')),
  error_message TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, period_type, period_start)
);

CREATE INDEX idx_recaps_member ON capsule_recaps(member_id, period_start DESC);
CREATE INDEX idx_recaps_household ON capsule_recaps(household_id);

-- RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE capsule_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own memories" ON memories
  FOR ALL USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own recaps" ON capsule_recaps
  FOR ALL USING (
    household_id IN (
      SELECT id FROM households WHERE owner_id = auth.uid()
    )
  );

-- Storage bucket pour photos/vidéos souvenirs (privé, accès via signed URL uniquement)
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS : un utilisateur ne lit/écrit que ses propres souvenirs (path = householdId/...)
CREATE POLICY "Users read own memory files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM households WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users upload memory files in own household" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM households WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users delete own memory files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM households WHERE owner_id = auth.uid()
    )
  );

-- DOWN (rollback):
-- DROP POLICY "Users delete own memory files" ON storage.objects;
-- DROP POLICY "Users upload memory files in own household" ON storage.objects;
-- DROP POLICY "Users read own memory files" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'memories';
-- DROP TABLE capsule_recaps;
-- DROP TABLE memories;
