"""
sync_ecomm.py
-------------
Reads Google Ads, Meta Ads, and Shopify data from a public Google Sheet
and upserts into Supabase marketing_daily and marketing_monthly tables.

Source: https://docs.google.com/spreadsheets/d/1J9LEzRz1CTzqAtRzZtr6_8j2L9Zj2PsB-ecZu7tZpOY
Sheets:
  Data: Google  (gid=1493253117)  → Date, Cost, Conversions, Conversions Value
  Data: Meta    (gid=405311491)   → Date, Amount Spent, Website Purchases, Website Purchases Conversion Value, Impressions
  Data: Shopify (gid=1431359422)  → Date, Total Sales, Total Orders, Sessions

Tables written:
  marketing_daily   — one row per day per channel (Google / Meta)
  marketing_monthly — one row per FY26 month, aggregated from all three sources

Usage:
    python scripts/sync_ecomm.py
"""

import os
import sys
import csv
import io
import requests
from collections import defaultdict
from pathlib import Path
from datetime import datetime, date
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
load_dotenv(SCRIPT_DIR.parent / '.env.secret')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

SHEET_ID    = '1J9LEzRz1CTzqAtRzZtr6_8j2L9Zj2PsB-ecZu7tZpOY'
GID_GOOGLE  = '1493253117'
GID_META    = '405311491'
GID_SHOPIFY = '1431359422'

# FY26: Jul 2025 – Jun 2026
FY26_START = date(2025, 7, 1)

MONTH_NUM = {
    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12,
}
# Year for each calendar month within FY26
MONTH_YEAR = {
    'Jan': 2026, 'Feb': 2026, 'Mar': 2026, 'Apr': 2026, 'May': 2026, 'Jun': 2026,
    'Jul': 2025, 'Aug': 2025, 'Sep': 2025, 'Oct': 2025, 'Nov': 2025, 'Dec': 2025,
}
# FY sort order (Jul = 1 … Jun = 12)
FY_SORT = {
    'Jul': 1, 'Aug': 2, 'Sep': 3, 'Oct': 4, 'Nov': 5, 'Dec': 6,
    'Jan': 7, 'Feb': 8, 'Mar': 9, 'Apr': 10, 'May': 11, 'Jun': 12,
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def num(v):
    """Parse a numeric string, return 0.0 if empty or invalid."""
    try:
        return float(str(v).replace(',', '').strip())
    except (ValueError, TypeError):
        return 0.0

def parse_date(date_str):
    """
    Parse "14 Apr" format into a date object.
    Returns None if invalid, unparseable, or falls before FY26_START.
    """
    s = str(date_str).strip()
    if not s:
        return None
    parts = s.split()
    if len(parts) != 2:
        return None
    try:
        day = int(parts[0])
        mon = parts[1][:3].capitalize()
        if mon not in MONTH_NUM:
            return None
        d = date(MONTH_YEAR[mon], MONTH_NUM[mon], day)
        return d if d >= FY26_START else None
    except (ValueError, KeyError):
        return None

def current_month_name():
    return datetime.now().strftime('%b')

# ── Fetch ─────────────────────────────────────────────────────────────────────

def fetch_sheet(gid, label):
    url = f'https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:csv&gid={gid}'
    print(f'  Fetching {label}...')
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    # Strip whitespace from column names
    rows = list(csv.DictReader(io.StringIO(r.text)))
    return [{k.strip(): v for k, v in row.items()} for row in rows]

# ── Readers ───────────────────────────────────────────────────────────────────

def read_google():
    """
    The Google Ads export may contain multiple rows per date (one per campaign).
    Aggregate by date before returning so we get one row per day.
    """
    rows = fetch_sheet(GID_GOOGLE, 'Data: Google')
    by_date = defaultdict(lambda: {'spend': 0.0, 'conversions': 0, 'conv_value': 0.0})
    for row in rows:
        d = parse_date(row.get('Date', ''))
        if not d:
            continue
        k = d.isoformat()
        by_date[k]['spend']      += num(row.get('Cost', 0))
        by_date[k]['conversions'] += int(num(row.get('Conversions', 0)))
        by_date[k]['conv_value'] += num(row.get('Conversions Value', 0))
    daily = [
        {
            'date':        k,
            'channel':     'Google',
            'spend':       round(v['spend'], 2),
            'impressions': 0,   # not included in this Google Ads export
            'conversions': v['conversions'],
            '_conv_value': round(v['conv_value'], 2),
        }
        for k, v in sorted(by_date.items())
    ]
    print(f'  → {len(daily)} FY26 daily rows (aggregated from {len([r for r in rows if parse_date(r.get("Date",""))])} raw rows)')
    return daily


def read_meta():
    """
    The Meta export may contain multiple rows per date (one per ad set/campaign).
    Aggregate by date before returning so we get one row per day.
    """
    rows = fetch_sheet(GID_META, 'Data: Meta')
    by_date = defaultdict(lambda: {'spend': 0.0, 'impressions': 0, 'conversions': 0, 'conv_value': 0.0})
    for row in rows:
        d = parse_date(row.get('Date', ''))
        if not d:
            continue
        k = d.isoformat()
        by_date[k]['spend']       += num(row.get('Amount Spent', 0))
        by_date[k]['impressions'] += int(num(row.get('Impressions', 0)))
        by_date[k]['conversions'] += int(num(row.get('Website Purchases', 0)))
        by_date[k]['conv_value']  += num(row.get('Website Purchases Conversion Value', 0))
    daily = [
        {
            'date':        k,
            'channel':     'Meta',
            'spend':       round(v['spend'], 2),
            'impressions': v['impressions'],
            'conversions': v['conversions'],
            '_conv_value': round(v['conv_value'], 2),
        }
        for k, v in sorted(by_date.items())
    ]
    print(f'  → {len(daily)} FY26 daily rows (aggregated from {len([r for r in rows if parse_date(r.get("Date",""))])} raw rows)')
    return daily


def read_shopify():
    rows = fetch_sheet(GID_SHOPIFY, 'Data: Shopify')
    daily = []
    for row in rows:
        d = parse_date(row.get('Date', ''))
        if not d:
            continue
        daily.append({
            'date':     d.isoformat(),
            'revenue':  round(num(row.get('Total Sales', 0)), 2),
            'orders':   int(num(row.get('Total Orders', 0))),
            'sessions': int(num(row.get('Sessions', 0))),
        })
    print(f'  → {len(daily)} FY26 daily rows')
    return daily

# ── Aggregate monthly ─────────────────────────────────────────────────────────

def aggregate_monthly(google_daily, meta_daily, shopify_daily):
    current_mon = current_month_name()

    google_mo  = defaultdict(lambda: {'spend': 0.0, 'conv_value': 0.0})
    meta_mo    = defaultdict(lambda: {'spend': 0.0, 'conv_value': 0.0})
    shopify_mo = defaultdict(lambda: {'revenue': 0.0, 'orders': 0, 'sessions': 0})

    for row in google_daily:
        mon = date.fromisoformat(row['date']).strftime('%b')
        google_mo[mon]['spend']      += row['spend']
        google_mo[mon]['conv_value'] += row['_conv_value']

    for row in meta_daily:
        mon = date.fromisoformat(row['date']).strftime('%b')
        meta_mo[mon]['spend']      += row['spend']
        meta_mo[mon]['conv_value'] += row['_conv_value']

    for row in shopify_daily:
        mon = date.fromisoformat(row['date']).strftime('%b')
        shopify_mo[mon]['revenue']  += row['revenue']
        shopify_mo[mon]['orders']   += row['orders']
        shopify_mo[mon]['sessions'] += row['sessions']

    all_months = (set(google_mo) | set(meta_mo) | set(shopify_mo)) & set(FY_SORT)
    records = []

    for mon in sorted(all_months, key=lambda m: FY_SORT[m]):
        g = google_mo[mon]
        m = meta_mo[mon]
        s = shopify_mo[mon]

        meta_spend   = round(m['spend'], 2)
        google_spend = round(g['spend'], 2)
        total_spend  = round(meta_spend + google_spend, 2)
        rev          = round(s['revenue'], 2)
        orders       = s['orders']
        sessions     = s['sessions']

        meta_roas   = round(m['conv_value'] / meta_spend, 2)   if meta_spend > 0   else None
        google_roas = round(g['conv_value'] / google_spend, 2) if google_spend > 0 else None
        mer         = round(rev / total_spend, 2)              if total_spend > 0  else 0
        aov         = round(rev / orders, 2)                   if orders > 0       else 0
        cpa         = round(total_spend / orders, 2)           if orders > 0       else 0
        conv_rate   = round((orders / sessions) * 100, 2)      if sessions > 0     else None

        record = {
            'month':        mon,
            'rev':          rev,
            'orders':       orders,
            'meta_spend':   meta_spend,
            'google_spend': google_spend,
            'total_spend':  total_spend,
            'mer':          mer,
            'meta_roas':    meta_roas,
            'google_roas':  google_roas,
            'conv_rate':    conv_rate,
            'aov':          aov,
            'cpa':          cpa,
            'mtd':          (mon == current_mon),
            'sort_order':   FY_SORT[mon],
        }
        records.append(record)

        mtd_flag = ' ← MTD' if record['mtd'] else ''
        print(f'  {mon}: rev=${rev:>9,.0f}  meta=${meta_spend:>7,.0f}  '
              f'google=${google_spend:>7,.0f}  MER={mer:.2f}{mtd_flag}')

    return records

# ── Upsert ────────────────────────────────────────────────────────────────────

def upsert_supabase(google_daily, meta_daily, monthly):
    from supabase import create_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        print('ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY missing from .env.secret')
        sys.exit(1)

    print(f'\nConnecting to Supabase: {SUPABASE_URL}')
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # marketing_daily — drop all FY26 rows and reinsert
    daily_rows = [
        {
            'date':        row['date'],
            'channel':     row['channel'],
            'spend':       row['spend'],
            'impressions': row['impressions'],
            'conversions': row['conversions'],
        }
        for row in google_daily + meta_daily
    ]

    if daily_rows:
        print(f'\nUpserting {len(daily_rows)} marketing_daily rows...')
        sb.table('marketing_daily').delete().gte('date', FY26_START.isoformat()).execute()
        for i in range(0, len(daily_rows), 500):
            sb.table('marketing_daily').insert(daily_rows[i:i + 500]).execute()
        print(f'✓ marketing_daily: {len(daily_rows)} rows')

    # marketing_monthly — full replace
    if monthly:
        print(f'Upserting {len(monthly)} marketing_monthly rows...')
        sb.table('marketing_monthly').delete().neq('id', 0).execute()
        sb.table('marketing_monthly').insert(monthly).execute()
        print(f'✓ marketing_monthly: {len(monthly)} rows')

    # Sync timestamp
    now = datetime.now().isoformat()
    sb.table('sync_metadata').update({'last_sync_at': now}).eq('source', 'marketing').execute()
    print(f'✓ sync_metadata: marketing updated to {now}')

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print('=' * 60)
    print('UmamiPapi — eComm (Google / Meta / Shopify) → Supabase Sync')
    print(f'Run at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print('=' * 60)

    print('\n[1/4] Fetching Google Ads data...')
    google_daily = read_google()

    print('\n[2/4] Fetching Meta Ads data...')
    meta_daily = read_meta()

    print('\n[3/4] Fetching Shopify data...')
    shopify_daily = read_shopify()

    print('\n[4/4] Aggregating monthly & upserting to Supabase...')
    monthly = aggregate_monthly(google_daily, meta_daily, shopify_daily)
    upsert_supabase(google_daily, meta_daily, monthly)

    print('\n✓ Sync complete. Refresh the dashboard to see eComm data.')
    print('  https://ceo-dashboard.vercel.app')


if __name__ == '__main__':
    main()
