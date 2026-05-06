-- 007_xero_ar.sql
-- Overdue AR invoices from Xero (refreshed on each sync)

CREATE TABLE IF NOT EXISTS xero_ar_invoices (
  invoice_id     TEXT PRIMARY KEY,
  invoice_number TEXT,
  contact_name   TEXT,
  amount_due     NUMERIC(15,2),
  currency_code  TEXT DEFAULT 'AUD',
  days_overdue   INT,
  due_date       DATE,
  snapshot_date  DATE DEFAULT CURRENT_DATE,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
