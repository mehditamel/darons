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
