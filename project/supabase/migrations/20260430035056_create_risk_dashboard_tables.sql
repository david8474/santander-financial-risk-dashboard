/*
  # Santander Financial Risk Intelligence Dashboard - Core Tables

  ## New Tables

  ### 1. `audit_logs`
  Immutable audit trail for every action performed in the dashboard.
  - `id` (uuid, primary key)
  - `action` (text) - what action was taken
  - `entity_type` (text) - type of entity affected (transaction, account, session)
  - `entity_id` (text) - ID of the affected entity
  - `performed_by` (text) - role/user who performed the action
  - `details` (jsonb) - additional context
  - `ip_address` (text) - masked IP for audit
  - `created_at` (timestamptz)

  ### 2. `security_actions`
  Records security responses taken on accounts/transactions.
  - `id` (uuid, primary key)
  - `action_type` (text) - step_up_mfa, transaction_hold, account_review, session_revoke
  - `account_id` (text) - masked account reference
  - `transaction_id` (text) - related transaction if applicable
  - `reason` (text) - reason for action
  - `performed_by` (text) - role
  - `status` (text) - pending, completed, resolved
  - `created_at` (timestamptz)
  - `resolved_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public read/insert allowed for demo purposes (synthetic data only)
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL DEFAULT '',
  entity_id text NOT NULL DEFAULT '',
  performed_by text NOT NULL DEFAULT 'analyst',
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text DEFAULT '***.***.***',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read audit_logs"
  ON audit_logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert audit_logs"
  ON audit_logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS security_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  account_id text NOT NULL DEFAULT '',
  transaction_id text DEFAULT '',
  reason text DEFAULT '',
  performed_by text NOT NULL DEFAULT 'analyst',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE security_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read security_actions"
  ON security_actions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert security_actions"
  ON security_actions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update security_actions"
  ON security_actions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_security_actions_account_id ON security_actions(account_id);
CREATE INDEX IF NOT EXISTS idx_security_actions_status ON security_actions(status);
