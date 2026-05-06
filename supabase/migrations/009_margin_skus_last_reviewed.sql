-- 009_margin_skus_last_reviewed.sql
-- Adds last_reviewed_at to margin_skus so the costing UI can show
-- when Richard last signed off each MarginPapi file (read from Setup!F17).
-- Until Richard starts entering dates, this falls back to file_modified_at.
--
-- Run once in Supabase SQL editor.

ALTER TABLE margin_skus
  ADD COLUMN IF NOT EXISTS last_reviewed_at DATE;
