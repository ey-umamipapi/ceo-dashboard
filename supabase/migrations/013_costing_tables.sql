-- M3 Costing Engine tables

CREATE TABLE IF NOT EXISTS costing_cogs (
  id SERIAL PRIMARY KEY,
  sku_name TEXT NOT NULL,
  source_file TEXT NOT NULL,
  product_variant TEXT NOT NULL,
  ingredients_cogs NUMERIC,
  packaging_cogs NUMERIC,
  overheads_cogs NUMERIC,
  total_cogs NUMERIC,
  batches_per_month NUMERIC,
  units_per_batch NUMERIC,
  total_units NUMERIC,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku_name, product_variant)
);

CREATE TABLE IF NOT EXISTS costing_ingredients (
  id SERIAL PRIMARY KEY,
  sku_name TEXT NOT NULL,
  source_file TEXT NOT NULL,
  component TEXT NOT NULL,
  qty_per_unit NUMERIC,
  qty_per_batch NUMERIC,
  unit_cost NUMERIC,
  batch_cost NUMERIC,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku_name, component)
);

CREATE TABLE IF NOT EXISTS costing_packaging (
  id SERIAL PRIMARY KEY,
  sku_name TEXT NOT NULL,
  source_file TEXT NOT NULL,
  packaging_type TEXT NOT NULL,
  product_variant TEXT NOT NULL,
  unit_cost NUMERIC,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sku_name, packaging_type, product_variant)
);

CREATE TABLE IF NOT EXISTS costing_overheads (
  id SERIAL PRIMARY KEY,
  sku_name TEXT NOT NULL UNIQUE,
  source_file TEXT NOT NULL,
  hourly_rate NUMERIC,
  super_pct NUMERIC,
  annual_rent NUMERIC,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
