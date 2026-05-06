-- Migration 003: pl_monthly
-- Stores monthly P&L data synced from Xero (FY26 and future years)

CREATE TABLE IF NOT EXISTS pl_monthly (
  id           SERIAL PRIMARY KEY,
  month        TEXT    NOT NULL,
  fiscal_year  TEXT    NOT NULL DEFAULT 'fy26',
  revenue      NUMERIC,
  cogs         NUMERIC,
  gross_profit NUMERIC,
  gpm          NUMERIC,
  opex         NUMERIC,
  net_op_profit NUMERIC,
  nopm         NUMERIC,
  sort_order   INTEGER,
  UNIQUE(month, fiscal_year)
);
