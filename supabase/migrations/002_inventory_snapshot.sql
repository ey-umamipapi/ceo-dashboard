CREATE TABLE IF NOT EXISTS inventory_snapshot (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OK',
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS inventory_snapshot_sku_date
  ON inventory_snapshot(sku, snapshot_date);
