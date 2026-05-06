-- 008_margin_skus_multi_sku.sql
-- Extends margin_skus to support all active SKUs (not just Chilli Oil),
-- adds source file tracking, last-modified date, and data integrity flags.
--
-- Run once in Supabase SQL editor.

ALTER TABLE margin_skus
  ADD COLUMN IF NOT EXISTS source_file       TEXT,
  ADD COLUMN IF NOT EXISTS file_modified_at  DATE,
  ADD COLUMN IF NOT EXISTS data_issue        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS data_issue_note   TEXT,
  ADD COLUMN IF NOT EXISTS synced_at         TIMESTAMPTZ DEFAULT NOW();

-- Drop the old unique constraint and replace with one that includes source_file,
-- so the same product/channel can have records from different files if needed.
ALTER TABLE margin_skus DROP CONSTRAINT IF EXISTS margin_skus_product_channel_key;
ALTER TABLE margin_skus ADD CONSTRAINT margin_skus_product_channel_key UNIQUE (product, channel);

-- Index for fast lookups by source file (used during delete-before-insert per file)
CREATE INDEX IF NOT EXISTS idx_margin_skus_source_file ON margin_skus (source_file);
