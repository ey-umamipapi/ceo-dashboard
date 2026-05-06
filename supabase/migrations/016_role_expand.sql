-- 016_role_expand.sql
-- Add 'ceo' and 'guest' roles to user_roles.
-- ceo: Ethan — full access including CEO section (Weekly Pulse, Automations)
-- guest: limited access — no financial data (Finance section, Revenue/Channel detail hidden)
-- Run in Supabase SQL editor.

ALTER TABLE user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('ceo','admin','finance','ops','commercial','production','guest','viewer'));

-- Update Ethan's role from admin → ceo (adjust email if needed)
UPDATE user_roles SET role = 'ceo' WHERE email = 'ethan@umamipapi.com.au';
