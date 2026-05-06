-- 012_user_roles.sql
-- User roles table for HubPapi access control.
-- Roles: admin, finance, ops, commercial, production, viewer
-- Populated manually by Ethan after creating Supabase Auth accounts.
--
-- RLS: users can only read their own role. Admin can read all.
-- Run once in Supabase SQL editor.

CREATE TABLE IF NOT EXISTS user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin','finance','ops','commercial','production','viewer')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Users can read their own role only
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (Koji scripts) can insert/update roles
-- Ethan manages roles via Supabase dashboard or SQL editor directly
