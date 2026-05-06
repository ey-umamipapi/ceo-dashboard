-- Automation job queue: HubPapi writes jobs, Koji daemon processes them
CREATE TABLE IF NOT EXISTS automation_jobs (
  id           SERIAL PRIMARY KEY,
  job_type     TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending', -- pending | running | completed | failed
  requested_by TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  output       TEXT,
  error        TEXT
);

-- Koji daemon heartbeat — single row, upserted by the daemon every 30s
CREATE TABLE IF NOT EXISTS koji_status (
  id          INT  PRIMARY KEY DEFAULT 1,
  last_seen   TIMESTAMPTZ,
  version     TEXT
);
INSERT INTO koji_status (id, last_seen) VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS automation_jobs_status_idx ON automation_jobs (status, requested_at DESC);
