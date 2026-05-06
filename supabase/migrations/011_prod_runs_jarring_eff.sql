-- 011_prod_runs_jarring_eff.sql
-- Adds jarring_efficiency (min/staff-hr) to prod_runs.
-- Sourced from PROD sheet column AR — calculated in MasterPapi
-- from tins jarred ÷ (staff × hours).
--
-- Run once in Supabase SQL editor.

ALTER TABLE prod_runs
  ADD COLUMN IF NOT EXISTS jarring_efficiency NUMERIC;
