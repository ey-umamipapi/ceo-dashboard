"""
HubPapi Automation Daemon
Polls Supabase for queued jobs and runs the appropriate scripts.
Run with: python3 scripts/automation_daemon.py
Keep running in a tmux session or as a launchd service on Koji's Mac.
"""

import os
import time
import subprocess
import traceback
from datetime import datetime, timezone
from supabase import create_client

# Load from .env.local if env vars aren't already set
_ENV_FILE = os.path.join(os.path.dirname(__file__), '..', '.env.local')
if os.path.exists(_ENV_FILE):
    with open(_ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, _, v = line.partition('=')
                os.environ.setdefault(k.strip(), v.strip().strip('"'))

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL') or os.environ['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY')
COWORK       = '/Users/koji/Library/CloudStorage/OneDrive-umamipapi.com.au/DatabasePapi/Cowork'
CEO_CODE     = '/Users/koji/Library/CloudStorage/OneDrive-umamipapi.com.au/CEO Cowork/CEO Code/ceo-dashboard'
GJ_PROCESSOR = '/Users/koji/Library/CloudStorage/OneDrive-umamipapi.com.au/CEO Cowork/CEO Code/GJ Processor'
POLL_INTERVAL = 5   # seconds between job checks
HEARTBEAT_INTERVAL = 30  # seconds between heartbeats

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def heartbeat():
    supabase.table('koji_status').upsert({'id': 1, 'last_seen': now_iso(), 'version': '1.0'}).execute()


def update_job(job_id: int, **kwargs):
    supabase.table('automation_jobs').update(kwargs).eq('id', job_id).execute()


def run_job(job: dict):
    job_id   = job['id']
    job_type = job['job_type']
    print(f'[{now_iso()}] Running job {job_id}: {job_type}')
    update_job(job_id, status='running', started_at=now_iso())

    try:
        output = dispatch(job_type)
        update_job(job_id, status='completed', completed_at=now_iso(), output=output)
        print(f'[{now_iso()}] Job {job_id} completed: {output[:100]}')
    except Exception as e:
        err = traceback.format_exc()
        update_job(job_id, status='failed', completed_at=now_iso(), error=str(e)[:500])
        print(f'[{now_iso()}] Job {job_id} failed: {err}')


def dispatch(job_type: str) -> str:
    """Run the script for the given job type and return a short summary string."""

    if job_type == 'invoices':
        result = subprocess.run(
            ['python3', f'{COWORK}/Code/invoice_register.py'],
            capture_output=True, text=True, timeout=300,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr[-500:] if result.stderr else 'Non-zero exit')
        return (result.stdout.strip().split('\n')[-1] or 'Done')[:200]

    elif job_type == 'retcon-sales':
        result = subprocess.run(
            ['python3', f'{COWORK}/Skills/monthly-retcon-sales/run.py'],
            capture_output=True, text=True, timeout=300,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr[-500:] if result.stderr else 'Non-zero exit')
        return (result.stdout.strip().split('\n')[-1] or 'Done')[:200]

    elif job_type == '3pl-report':
        result = subprocess.run(
            ['python3', f'{COWORK}/Scripts/3pl_report.py'],
            capture_output=True, text=True, timeout=300,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr[-500:] if result.stderr else 'Non-zero exit')
        return (result.stdout.strip().split('\n')[-1] or 'Done')[:200]

    elif job_type == 'gj-processor':
        result = subprocess.run(
            ['python3', 'gj_processor.py'],
            capture_output=True, text=True, timeout=300,
            cwd=GJ_PROCESSOR,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr[-500:] if result.stderr else 'Non-zero exit')
        return (result.stdout.strip().split('\n')[-1] or 'Done')[:200]

    elif job_type == 'sync-dashboard':
        # Sync data then deploy
        for script in ['sync_masterpapi.py', 'sync_ecomm.py']:
            result = subprocess.run(
                ['python3', f'{CEO_CODE}/scripts/{script}'],
                capture_output=True, text=True, timeout=300,
            )
            if result.returncode != 0:
                raise RuntimeError(f'{script} failed: {result.stderr[-300:]}')

        deploy = subprocess.run(
            ['vercel', '--prod'],
            capture_output=True, text=True, timeout=180,
            cwd=CEO_CODE,
        )
        if deploy.returncode != 0:
            raise RuntimeError(f'Deploy failed: {deploy.stderr[-300:]}')
        # Extract production URL from vercel output
        for line in deploy.stdout.split('\n'):
            if 'hub.umamipapi.com.au' in line:
                return f'Deployed → {line.strip()}'
        return 'Synced and deployed'

    else:
        raise ValueError(f'Unknown job type: {job_type}')


def main():
    print(f'[{now_iso()}] Automation daemon started')
    last_heartbeat = 0.0

    while True:
        try:
            # Heartbeat
            if time.time() - last_heartbeat >= HEARTBEAT_INTERVAL:
                heartbeat()
                last_heartbeat = time.time()

            # Pick up pending jobs (oldest first, one at a time)
            result = supabase.table('automation_jobs') \
                .select('*') \
                .eq('status', 'pending') \
                .order('requested_at') \
                .limit(1) \
                .execute()

            if result.data:
                run_job(result.data[0])

        except KeyboardInterrupt:
            print(f'\n[{now_iso()}] Daemon stopped.')
            break
        except Exception as e:
            print(f'[{now_iso()}] Daemon error: {e}')

        time.sleep(POLL_INTERVAL)


if __name__ == '__main__':
    main()
