-- 010_prod_efficiency_remodel.sql
-- Replaces the broken capacity-planning columns in prod_efficiency
-- (demand/capacity/surplus — sourced from a PROD sheet that never had that layout)
-- with actual monthly production totals from the Production Summary sheet.
--
-- Old columns (demand, capacity, surplus, utilisation, staff_required, current_staff)
-- are dropped because they were never populated and nothing reads them.
--
-- Run once in Supabase SQL editor.

ALTER TABLE prod_efficiency
  DROP COLUMN IF EXISTS demand,
  DROP COLUMN IF EXISTS capacity,
  DROP COLUMN IF EXISTS surplus,
  DROP COLUMN IF EXISTS utilisation,
  DROP COLUMN IF EXISTS staff_required,
  DROP COLUMN IF EXISTS current_staff;

ALTER TABLE prod_efficiency
  ADD COLUMN IF NOT EXISTS total_tins   INTEGER,
  ADD COLUMN IF NOT EXISTS coles_tins   INTEGER,
  ADD COLUMN IF NOT EXISTS distrbn_tins INTEGER,
  ADD COLUMN IF NOT EXISTS nandos_tins  INTEGER,
  ADD COLUMN IF NOT EXISTS fserv_tins   INTEGER,
  ADD COLUMN IF NOT EXISTS wsale_tins   INTEGER,
  ADD COLUMN IF NOT EXISTS direct_tins  INTEGER;
