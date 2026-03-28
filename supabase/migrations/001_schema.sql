-- ============================================================
-- Target Agrotech CRM — Migration 001: Schema
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('admin','gestor','usuario')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts / Leads
CREATE TABLE IF NOT EXISTS contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  company         TEXT,
  cpf_cnpj        TEXT,
  type            TEXT NOT NULL DEFAULT 'lead' CHECK (type IN ('lead','prospect','client')),
  pipeline_stage  TEXT NOT NULL DEFAULT 'new'
                    CHECK (pipeline_stage IN ('new','contacted','qualified','proposal','negotiation','won','lost')),
  owner_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  notes           TEXT,
  source          TEXT,
  custom_fields   JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activities (timeline)
CREATE TABLE IF NOT EXISTS activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id   UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type         TEXT NOT NULL CHECK (type IN ('note','call','email','whatsapp','meeting','stage_change','contract_sent')),
  description  TEXT NOT NULL,
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  channel         TEXT NOT NULL DEFAULT 'chat' CHECK (channel IN ('chat','whatsapp','email')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','bot')),
  assigned_to     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  n8n_session_id  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type      TEXT NOT NULL CHECK (sender_type IN ('user','contact','agent')),
  sender_id        UUID,
  content          TEXT NOT NULL,
  metadata         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  subject       TEXT NOT NULL,
  from_name     TEXT NOT NULL,
  from_email    TEXT NOT NULL,
  body_html     TEXT NOT NULL,
  body_text     TEXT,
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','sending','sent','cancelled')),
  scheduled_at  TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stats         JSONB NOT NULL DEFAULT '{"sent":0,"opened":0,"clicked":0,"bounced":0}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_lists (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_list_members (
  list_id     UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
  contact_id  UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  PRIMARY KEY (list_id, contact_id)
);

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id   UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','sent','opened','clicked','bounced','unsubscribed')),
  sent_at      TIMESTAMPTZ,
  UNIQUE(campaign_id, contact_id)
);

CREATE TABLE IF NOT EXISTS email_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  subject      TEXT NOT NULL,
  body_html    TEXT NOT NULL,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ad Campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  platform      TEXT NOT NULL CHECK (platform IN ('google','meta')),
  external_id   TEXT,
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('active','paused','ended','draft')),
  budget_daily  NUMERIC(12,2),
  budget_total  NUMERIC(12,2),
  start_date    DATE,
  end_date      DATE,
  metrics       JSONB NOT NULL DEFAULT '{"impressions":0,"clicks":0,"conversions":0,"spend":0}',
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
  value            NUMERIC(12,2),
  body_html        TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','sent','signed','cancelled')),
  signed_at        TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ,
  file_url         TEXT,
  signature_token  TEXT UNIQUE,
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions / Financial
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL CHECK (type IN ('revenue','expense')),
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  date            DATE NOT NULL,
  contact_id      UUID REFERENCES contacts(id) ON DELETE SET NULL,
  contract_id     UUID REFERENCES contracts(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','cancelled')),
  payment_method  TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Role Permissions (dynamic RBAC)
CREATE TABLE IF NOT EXISTS role_permissions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role      TEXT NOT NULL CHECK (role IN ('admin','gestor','usuario')),
  resource  TEXT NOT NULL,
  action    TEXT NOT NULL CHECK (action IN ('view','create','edit','delete')),
  allowed   BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(role, resource, action)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contacts_pipeline_stage ON contacts(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_contracts_contact_id ON contracts(contact_id);
CREATE INDEX IF NOT EXISTS idx_contracts_signature_token ON contracts(signature_token);
