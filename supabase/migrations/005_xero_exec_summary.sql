CREATE TABLE IF NOT EXISTS xero_exec_summary (
  id           SERIAL PRIMARY KEY,
  month        TEXT NOT NULL,
  fiscal_year  TEXT NOT NULL,
  cash         NUMERIC(15,2),
  receivables  NUMERIC(15,2),
  payables     NUMERIC(15,2),
  working_capital NUMERIC(15,2),
  sort_order   INT,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, fiscal_year)
);
