CREATE TABLE IF NOT EXISTS prod_schedule (
  run_date  TEXT PRIMARY KEY,
  day_name  TEXT,
  sku1      TEXT,
  sku2      TEXT,
  sku3      TEXT,
  sku4      TEXT,
  staff     INT,
  hours     NUMERIC(5,2),
  notes     TEXT
);
