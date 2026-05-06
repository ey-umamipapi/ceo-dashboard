"""
push_xero_live.py
-----------------
Pushes live Xero data (fetched via MCP connector) directly to Supabase.
Run this after applying migration 007_xero_ar.sql in Supabase.

Usage:
    python scripts/push_xero_live.py
"""

import os
import sys
from pathlib import Path
from datetime import datetime, date

from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).parent
load_dotenv(SCRIPT_DIR.parent / '.env.secret')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# ── Live data from Xero MCP (as of 2026-05-04) ───────────────────────────────

CASH_POSITION = {
    'month':           'May',
    'fiscal_year':     'fy26',
    'cash':            954005.74,
    'receivables':     409376.77,
    'payables':        22000.00,
    'working_capital': 154650.91,
    'sort_order':      11,
}

AR_INVOICES = [
    {
        'invoice_id':     'd5ce2939-d23f-427c-8e1a-3fb5558d28b1',
        'invoice_number': 'COLES-V-114',
        'contact_name':   'COLES VIC',
        'amount_due':     31590.40,
        'currency_code':  'AUD',
        'days_overdue':   46,
        'due_date':       '2026-03-18',
        'snapshot_date':  '2026-05-04',
    },
    {
        'invoice_id':     'adf262b2-5a43-4f3b-ae92-40c434d637b7',
        'invoice_number': 'COLES-V-116',
        'contact_name':   'COLES VIC',
        'amount_due':     31590.40,
        'currency_code':  'AUD',
        'days_overdue':   28,
        'due_date':       '2026-04-05',
        'snapshot_date':  '2026-05-04',
    },
    {
        'invoice_id':     'b0366ff3-7206-4163-8751-b214a82cb4c4',
        'invoice_number': 'COLES-N-86',
        'contact_name':   'COLES NSW',
        'amount_due':     26086.40,
        'currency_code':  'AUD',
        'days_overdue':   53,
        'due_date':       '2026-03-11',
        'snapshot_date':  '2026-05-04',
    },
]

def main():
    from supabase import create_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        print('ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY missing from .env.secret')
        sys.exit(1)

    sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f'Connected to Supabase: {SUPABASE_URL}')

    # 1. Upsert cash position into xero_exec_summary
    print('\n[1/3] Upserting cash position (May FY26)...')
    sb.table('xero_exec_summary').upsert(CASH_POSITION, on_conflict='month,fiscal_year').execute()
    print(f"  ✓ Cash ${CASH_POSITION['cash']:,.0f}  WC ${CASH_POSITION['working_capital']:,.0f}  Receivables ${CASH_POSITION['receivables']:,.0f}")

    # 2. Upsert overdue AR invoices
    print('\n[2/3] Upserting overdue AR invoices...')
    sb.table('xero_ar_invoices').upsert(AR_INVOICES, on_conflict='invoice_id').execute()
    for inv in AR_INVOICES:
        print(f"  ✓ {inv['invoice_number']}  {inv['contact_name']}  ${inv['amount_due']:,.2f}  {inv['days_overdue']}d overdue")

    # 3. Update sync_metadata
    print('\n[3/3] Updating sync_metadata...')
    now = datetime.now().isoformat()
    sb.table('sync_metadata').upsert({'source': 'xero_ar', 'last_sync_at': now}, on_conflict='source').execute()
    sb.table('sync_metadata').upsert({'source': 'financial', 'last_sync_at': now}, on_conflict='source').execute()
    print(f'  ✓ sync_metadata updated to {now}')

    print('\n✓ Done. Refresh the dashboard to see live Xero data.')

if __name__ == '__main__':
    main()
