-- M4 Inventory & Daily Metrics tables

CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL UNIQUE,
  week_label TEXT,
  commentary TEXT,
  tins_produced INTEGER,
  tins_filled_overnight INTEGER,
  tins_filled_day INTEGER,
  jars_filled_overnight INTEGER,
  jars_filled_day INTEGER,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_batches (
  id SERIAL PRIMARY KEY,
  batch_code TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL,
  expiry_date DATE,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
