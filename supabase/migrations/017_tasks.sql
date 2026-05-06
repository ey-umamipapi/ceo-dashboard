-- 017_tasks.sql
-- HubPapi task board — Trello-like task management integrated with business context.
-- Tasks can be linked to business entities (invoice, order, SKU, customer, etc.)
-- and are scoped by department so each team sees their own board.

CREATE TABLE IF NOT EXISTS tasks (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'todo'
                  CHECK (status IN ('todo','in-progress','review','done','blocked')),
  priority      TEXT NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low','medium','high','urgent')),
  department    TEXT CHECK (department IN ('ceo','commercial','marketing','finance','people','ops','all')),
  assignee_email TEXT,
  assignee_name  TEXT,
  created_by     TEXT NOT NULL,
  due_date       DATE,
  -- Optional link to a business entity
  linked_type    TEXT,   -- 'invoice' | 'order' | 'sku' | 'customer' | 'production_run' | etc.
  linked_id      TEXT,   -- the entity's ID / reference number
  linked_label   TEXT,   -- human-readable label shown on the card
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Keep updated_at current
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS tasks_status_idx     ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_department_idx ON tasks(department);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx   ON tasks(due_date);

-- RLS: any authenticated user can read all tasks, create tasks.
-- Updates/deletes restricted to service role (managed via API).
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users read tasks"
  ON tasks FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users insert tasks"
  ON tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth users update tasks"
  ON tasks FOR UPDATE USING (auth.role() = 'authenticated');
