-- ============================================================
-- Target Agrotech CRM — Migration 002: RLS Policies
-- ============================================================

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── profiles ───────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR get_user_role() = 'admin')
  WITH CHECK (id = auth.uid() OR get_user_role() = 'admin');

CREATE POLICY "profiles_insert_trigger"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid() OR get_user_role() = 'admin');

-- ─── contacts ───────────────────────────────────────────────
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select"
  ON contacts FOR SELECT
  USING (
    get_user_role() IN ('admin','gestor')
    OR owner_id = auth.uid()
  );

CREATE POLICY "contacts_insert"
  ON contacts FOR INSERT
  WITH CHECK (get_user_role() IN ('admin','gestor'));

CREATE POLICY "contacts_update"
  ON contacts FOR UPDATE
  USING (
    get_user_role() IN ('admin','gestor')
    OR owner_id = auth.uid()
  );

CREATE POLICY "contacts_delete"
  ON contacts FOR DELETE
  USING (get_user_role() = 'admin');

-- ─── activities ─────────────────────────────────────────────
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select"
  ON activities FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "activities_insert"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── conversations ───────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select"
  ON conversations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_insert"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "conversations_update"
  ON conversations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ─── messages ───────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select"
  ON messages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─── email_campaigns ────────────────────────────────────────
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_campaigns_all"
  ON email_campaigns FOR ALL
  USING (get_user_role() IN ('admin','gestor'));

-- ─── email_lists ────────────────────────────────────────────
ALTER TABLE email_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_lists_all"
  ON email_lists FOR ALL
  USING (get_user_role() IN ('admin','gestor'));

-- ─── email_list_members ─────────────────────────────────────
ALTER TABLE email_list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_list_members_all"
  ON email_list_members FOR ALL
  USING (get_user_role() IN ('admin','gestor'));

-- ─── email_campaign_recipients ──────────────────────────────
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_campaign_recipients_all"
  ON email_campaign_recipients FOR ALL
  USING (get_user_role() IN ('admin','gestor'));

-- ─── email_templates ────────────────────────────────────────
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates_all"
  ON email_templates FOR ALL
  USING (get_user_role() IN ('admin','gestor'));

-- ─── ad_campaigns ───────────────────────────────────────────
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_campaigns_all"
  ON ad_campaigns FOR ALL
  USING (get_user_role() IN ('admin','gestor'));

-- ─── transactions ───────────────────────────────────────────
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_all"
  ON transactions FOR ALL
  USING (get_user_role() IN ('admin','gestor'));

-- ─── contracts ──────────────────────────────────────────────
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contracts_select"
  ON contracts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "contracts_insert"
  ON contracts FOR INSERT
  WITH CHECK (get_user_role() IN ('admin','gestor'));

CREATE POLICY "contracts_update"
  ON contracts FOR UPDATE
  USING (get_user_role() IN ('admin','gestor'));

CREATE POLICY "contracts_delete"
  ON contracts FOR DELETE
  USING (get_user_role() = 'admin');

-- ─── role_permissions ───────────────────────────────────────
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_select"
  ON role_permissions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "role_permissions_write"
  ON role_permissions FOR ALL
  USING (get_user_role() = 'admin');
