-- Migration 004: shopify_cohorts
-- Stores Shopify customer cohort and retention metrics

CREATE TABLE IF NOT EXISTS shopify_cohorts (
  id                    SERIAL  PRIMARY KEY,
  cohort_month          TEXT    NOT NULL UNIQUE,
  first_purchase_count  INTEGER,
  repeat_customers_30d  INTEGER,
  repeat_customers_90d  INTEGER,
  repeat_rate_30d       NUMERIC,
  repeat_rate_90d       NUMERIC,
  avg_ltv               NUMERIC,
  avg_orders            NUMERIC,
  total_revenue         NUMERIC
);
