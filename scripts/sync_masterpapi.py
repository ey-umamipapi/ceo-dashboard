"""
sync_masterpapi.py
------------------
Reads MasterPapi_FY26_LIVE.xlsx and upserts revenue_monthly + revenue_weekly
into Supabase. Run this locally whenever you want to push fresh revenue data
to the live dashboard.

Usage:
    python scripts/sync_masterpapi.py

Requirements:
    pip install openpyxl supabase python-dotenv
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
import openpyxl

# ── Config ───────────────────────────────────────────────────────────────────

# Load credentials from .env.secret (never committed to git)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.secret'))

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Path to MasterPapi — adjust if your OneDrive path differs
MASTER_PAPI_PATH = r"C:\Users\ethan\OneDrive - umamipapi.com.au\DatabasePapi\Cowork\Inputs\MasterPapi_FY26_LIVE.xlsx"

# FY26 month number → short name (FY starts July = month 1)
MONTH_MAP = {
    1: 'Jul', 2: 'Aug', 3: 'Sep', 4: 'Oct', 5: 'Nov', 6: 'Dec',
    7: 'Jan', 8: 'Feb', 9: 'Mar', 10: 'Apr', 11: 'May', 12: 'Jun'
}

# Current calendar month → FY month number (to detect MTD)
CALENDAR_TO_FY = {
    7: 1, 8: 2, 9: 3, 10: 4, 11: 5, 12: 6,
    1: 7, 2: 8, 3: 9, 4: 10, 5: 11, 6: 12
}

# ── Helpers ──────────────────────────────────────────────────────────────────

def val(cell):
    """Return numeric value of a cell, 0 if None or non-numeric."""
    v = cell.value if hasattr(cell, 'value') else cell
    if v is None:
        return 0
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0

def current_fy_month():
    """Return the current FY26 month number (1=Jul ... 12=Jun)."""
    return CALENDAR_TO_FY[datetime.now().month]

# ── Read MasterPapi ───────────────────────────────────────────────────────────

def read_masterpapi(path):
    print(f"Opening MasterPapi: {path}")
    if not os.path.exists(path):
        print(f"ERROR: File not found at {path}")
        print("Check the MASTER_PAPI_PATH at the top of this script.")
        sys.exit(1)

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)

    monthly = read_monthly(wb)
    weekly = read_weekly(wb)

    wb.close()
    return monthly, weekly


def read_monthly(wb):
    """
    Mth sheet column mapping (1-indexed):
      col 9  = month ending date
      col 10 = FY label (e.g. 'FY26')
      col 12 = orders
      col 42 = Direct
      col 43 = Wsale
      col 44 = Distrbn
      col 45 = Coles
      col 46 = Metcash
      col 47 = FoodServ
      col 48 = Nandos
      col 49 = Other
      col 51 = Total
    """
    ws = wb['Mth']
    current_fy_mo = current_fy_month()
    records = []
    sort_order = 0

    for row in ws.iter_rows(min_row=2):
        fy = row[9].value  # col 10 (0-indexed: col[9])
        if fy != 'FY26':
            continue

        date_cell = row[8].value  # col 9 (month ending date)
        if date_cell is None:
            continue

        # Determine month number from the date
        if hasattr(date_cell, 'month'):
            cal_month = date_cell.month
        else:
            continue

        fy_month_num = CALENDAR_TO_FY.get(cal_month)
        if fy_month_num is None:
            continue

        month_name = MONTH_MAP[fy_month_num]
        sort_order += 1
        is_mtd = (fy_month_num == current_fy_mo)

        record = {
            'fiscal_year': 'fy26',
            'month': month_name,
            'total':   round(val(row[50])),  # col 51
            'direct':  round(val(row[41])),  # col 42
            'wsale':   round(val(row[42])),  # col 43
            'distrbn': round(val(row[43])),  # col 44
            'coles':   round(val(row[44])),  # col 45
            'metcash': round(val(row[45])),  # col 46
            'fserv':   round(val(row[46])),  # col 47
            'nandos':  round(val(row[47])),  # col 48
            'other':   round(val(row[48])),  # col 49
            'orders':  round(val(row[11])),  # col 12
            'ad':      0,
            'roas':    0,
            'mtd':     is_mtd,
            'sort_order': sort_order,
        }

        # Skip rows with no revenue (sheet may have blank future months)
        if record['total'] == 0 and record['orders'] == 0:
            continue

        records.append(record)
        status = ' ← MTD' if is_mtd else ''
        print(f"  Monthly FY26 {month_name}: ${record['total']:,} ({record['orders']} orders){status}")

    return records


def read_weekly(wb):
    """
    Wk sheet column mapping (1-indexed):
      col 9  = week commencing date
      col 10 = FY label
      col 36 = Direct
      col 37 = Wsale
      col 38 = Distrbn
      col 39 = Coles
      col 40 = Metcash
      col 41 = FoodServ
      col 42 = Nandos
      col 43 = Other
      col 45 = Total
    """
    ws = wb['Wk']
    records = []
    sort_order = 0

    for row in ws.iter_rows(min_row=2):
        fy = row[9].value  # col 10
        if fy != 'FY26':
            continue

        date_cell = row[8].value  # col 9
        if date_cell is None:
            continue

        total = round(val(row[44]))  # col 45
        if total == 0:
            continue  # skip blank future weeks

        # Format week label: "3 Jul", "10 Jul", etc.
        if hasattr(date_cell, 'strftime'):
            # Use %d and lstrip to handle both Windows and Unix
            week_label = date_cell.strftime('%d %b').lstrip('0')
        else:
            week_label = str(date_cell)

        sort_order += 1
        record = {
            'week_label': week_label,
            'total':   total,
            'direct':  round(val(row[35])),  # col 36
            'coles':   round(val(row[38])),  # col 39
            'distrbn': round(val(row[37])),  # col 38
            'nandos':  round(val(row[41])),  # col 42
            'other':   round(val(row[42])),  # col 43
            'sort_order': sort_order,
        }

        records.append(record)

    print(f"  Weekly: {len(records)} weeks found")
    return records

# ── Upsert to Supabase ────────────────────────────────────────────────────────

def upsert_supabase(monthly, weekly):
    from supabase import create_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY missing from .env.secret")
        sys.exit(1)

    print(f"\nConnecting to Supabase: {SUPABASE_URL}")
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Ensure sync_metadata table exists
    try:
        sb.table('sync_metadata').select('*', count='exact').limit(1).execute()
    except:
        print("Creating sync_metadata table...")
        # Try to insert — if table doesn't exist, it will fail, but that's ok
        try:
            sb.table('sync_metadata').upsert({'source': 'masterpapi', 'last_sync_at': datetime.now().isoformat()}).execute()
        except:
            print("⚠ sync_metadata table not found. Create it in Supabase SQL editor with:")
            print("  CREATE TABLE sync_metadata (id SERIAL PRIMARY KEY, source TEXT NOT NULL UNIQUE, last_sync_at TIMESTAMPTZ NOT NULL);")
            print("Then run this script again.")

    # Upsert revenue_monthly (FY26 only — match on fiscal_year + month)
    if monthly:
        print(f"\nUpserting {len(monthly)} monthly revenue rows...")
        # Delete existing FY26 rows and reinsert (simpler than per-row upsert with composite key)
        sb.table('revenue_monthly').delete().eq('fiscal_year', 'fy26').execute()
        result = sb.table('revenue_monthly').insert(monthly).execute()
        print(f"✓ revenue_monthly: {len(monthly)} rows written")

    # Upsert revenue_weekly (delete all and reinsert — weekly labels are stable)
    if weekly:
        print(f"Upserting {len(weekly)} weekly revenue rows...")
        sb.table('revenue_weekly').delete().neq('id', 0).execute()
        result = sb.table('revenue_weekly').insert(weekly).execute()
        print(f"✓ revenue_weekly: {len(weekly)} rows written")

    # Update sync metadata
    now = datetime.now().isoformat()
    sb.table('sync_metadata').update({'last_sync_at': now}).eq('source', 'masterpapi').execute()
    print(f"✓ sync_metadata: masterpapi timestamp updated to {now}")

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("UmamiPapi — MasterPapi → Supabase Sync")
    print(f"Run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    print("\n[1/2] Reading MasterPapi...")
    monthly, weekly = read_masterpapi(MASTER_PAPI_PATH)

    print(f"\n[2/2] Upserting to Supabase...")
    upsert_supabase(monthly, weekly)

    print("\n✓ Sync complete. Refresh the dashboard to see updated data.")
    print("  https://ceo-dashboard.vercel.app")

if __name__ == '__main__':
    main()
