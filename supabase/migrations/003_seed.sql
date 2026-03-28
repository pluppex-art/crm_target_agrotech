-- ============================================================
-- Target Agrotech CRM — Migration 003: Triggers + Seed
-- ============================================================

-- Trigger: auto-create profile on new user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'usuario')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Seed: default role permissions
INSERT INTO role_permissions (role, resource, action, allowed) VALUES
  -- Gestor can view/create/edit most things
  ('gestor', 'dashboard', 'view', true),
  ('gestor', 'crm', 'view', true),
  ('gestor', 'crm', 'create', true),
  ('gestor', 'crm', 'edit', true),
  ('gestor', 'crm', 'delete', false),
  ('gestor', 'conversations', 'view', true),
  ('gestor', 'conversations', 'create', true),
  ('gestor', 'conversations', 'edit', true),
  ('gestor', 'conversations', 'delete', false),
  ('gestor', 'email_marketing', 'view', true),
  ('gestor', 'email_marketing', 'create', true),
  ('gestor', 'email_marketing', 'edit', true),
  ('gestor', 'email_marketing', 'delete', false),
  ('gestor', 'ads', 'view', true),
  ('gestor', 'ads', 'create', true),
  ('gestor', 'ads', 'edit', true),
  ('gestor', 'ads', 'delete', false),
  ('gestor', 'financial', 'view', true),
  ('gestor', 'financial', 'create', true),
  ('gestor', 'financial', 'edit', true),
  ('gestor', 'financial', 'delete', false),
  ('gestor', 'contracts', 'view', true),
  ('gestor', 'contracts', 'create', true),
  ('gestor', 'contracts', 'edit', true),
  ('gestor', 'contracts', 'delete', false),
  ('gestor', 'settings', 'view', false),
  -- Usuario can only view crm/conversations/contracts
  ('usuario', 'dashboard', 'view', true),
  ('usuario', 'crm', 'view', true),
  ('usuario', 'crm', 'create', false),
  ('usuario', 'crm', 'edit', false),
  ('usuario', 'crm', 'delete', false),
  ('usuario', 'conversations', 'view', true),
  ('usuario', 'conversations', 'create', true),
  ('usuario', 'conversations', 'edit', false),
  ('usuario', 'conversations', 'delete', false),
  ('usuario', 'email_marketing', 'view', false),
  ('usuario', 'ads', 'view', false),
  ('usuario', 'financial', 'view', false),
  ('usuario', 'contracts', 'view', true),
  ('usuario', 'contracts', 'create', false),
  ('usuario', 'settings', 'view', false)
ON CONFLICT (role, resource, action) DO NOTHING;
