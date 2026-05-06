"""
sync_shopify.py
---------------
Fetches all Shopify orders from FY26 (Jul 2025–present), calculates
customer cohort and retention metrics, and upserts into the
`shopify_cohorts` Supabase table.

Usage:
    python scripts/sync_shopify.py

Requirements:
    pip install requests supabase python-dotenv
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime, date, timedelta
from collections import defaultdict

import requests
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
load_dotenv(SCRIPT_DIR.parent / '.env.secret')

SHOPIFY_SHOP_URL    = os.getenv('SHOPIFY_SHOP_URL', '').rstrip('/')
SHOPIFY_TOKEN       = os.getenv('SHOPIFY_ACCESS_TOKEN')
SUPABASE_URL        = os.getenv('SUPABASE_URL')
SUPABASE_KEY        = os.getenv('SUPABASE_SERVICE_KEY')

API_VERSION         = '2024-01'
FY26_START          = date(2025, 7, 1)
ORDER_LIMIT         = 250

# ── Shopify fetch ─────────────────────────────────────────────────────────────

def shopify_headers():
    return {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
    }


def fetch_all_orders():
    """
    Fetch all orders from FY26 start, paginating via Link header.
    Returns a flat list of order dicts with fields:
        id, created_at, customer_id, total_price
    """
    base = f'https://{SHOPIFY_SHOP_URL}/admin/api/{API_VERSION}'
    url = (
        f'{base}/orders.json'
        f'?status=any'
        f'&limit={ORDER_LIMIT}'
        f'&created_at_min={FY26_START.isoformat()}'
        f'&fields=id,created_at,customer,total_price'
    )

    all_orders = []
    page = 1

    while url:
        print(f'  Fetching page {page}...')
        resp = requests.get(url, headers=shopify_headers(), timeout=60)
        resp.raise_for_status()

        orders = resp.json().get('orders', [])
        for o in orders:
            customer = o.get('customer')
            if not customer:
                continue  # skip guest checkouts
            all_orders.append({
                'id':          o['id'],
                'created_at':  o['created_at'],
                'customer_id': customer['id'],
                'total_price': float(o.get('total_price') or 0),
            })

        # Pagination via Link header
        link_header = resp.headers.get('Link', '')
        next_url = _parse_next_link(link_header)
        url = next_url
        page += 1

    print(f'  Total orders fetched: {len(all_orders)}')
    return all_orders


def _parse_next_link(link_header):
    """Extract the 'next' URL from a Shopify Link header."""
    if not link_header:
        return None
    parts = link_header.split(',')
    for part in parts:
        match = re.match(r'\s*<(.+?)>\s*;\s*rel="next"', part.strip())
        if match:
            return match.group(1)
    return None


# ── Cohort calculation ────────────────────────────────────────────────────────

def truncate_to_month(dt_str):
    """Return a date truncated to the first of the month."""
    dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    return date(dt.year, dt.month, 1)


def calculate_cohorts(orders):
    """
    Group customers by first-order month and compute retention metrics.

    Returns list of cohort dicts ready for Supabase upsert.
    """
    # Build per-customer order history: {customer_id: [order_date, ...]}
    customer_orders = defaultdict(list)
    for o in orders:
        dt = datetime.fromisoformat(o['created_at'].replace('Z', '+00:00'))
        customer_orders[o['customer_id']].append({
            'date':  dt.date(),
            'price': o['total_price'],
        })

    # Sort each customer's orders chronologically
    for cid in customer_orders:
        customer_orders[cid].sort(key=lambda x: x['date'])

    # Determine each customer's first-order month
    # {cohort_month_str: [customer_id, ...]}
    cohort_map = defaultdict(list)
    for cid, order_list in customer_orders.items():
        first_date = order_list[0]['date']
        if first_date < FY26_START:
            continue  # customer acquired before FY26, not a cohort we track
        cohort_key = first_date.strftime('%Y-%m')
        cohort_map[cohort_key].append(cid)

    records = []

    for cohort_month_str in sorted(cohort_map.keys()):
        cohort_start = date.fromisoformat(cohort_month_str + '-01')
        cohort_customers = cohort_map[cohort_month_str]
        first_purchase_count = len(cohort_customers)

        repeat_30 = 0
        repeat_90 = 0
        total_revenue = 0.0
        total_orders = 0

        for cid in cohort_customers:
            cust_orders = customer_orders[cid]
            first_order_date = cust_orders[0]['date']

            # All spend for this customer (all orders ever in FY26)
            cust_total = sum(o['price'] for o in cust_orders)
            total_revenue += cust_total
            total_orders  += len(cust_orders)

            # Retention: did they place another order within 30 / 90 days?
            subsequent = [o for o in cust_orders[1:]]
            if any((o['date'] - first_order_date).days <= 30 for o in subsequent):
                repeat_30 += 1
            if any((o['date'] - first_order_date).days <= 90 for o in subsequent):
                repeat_90 += 1

        repeat_rate_30 = round(repeat_30 / first_purchase_count, 4) if first_purchase_count else 0.0
        repeat_rate_90 = round(repeat_90 / first_purchase_count, 4) if first_purchase_count else 0.0
        avg_ltv        = round(total_revenue / first_purchase_count, 2) if first_purchase_count else 0.0
        avg_orders     = round(total_orders  / first_purchase_count, 2) if first_purchase_count else 0.0

        records.append({
            'cohort_month':         cohort_month_str,
            'first_purchase_count': first_purchase_count,
            'repeat_customers_30d': repeat_30,
            'repeat_customers_90d': repeat_90,
            'repeat_rate_30d':      repeat_rate_30,
            'repeat_rate_90d':      repeat_rate_90,
            'avg_ltv':              avg_ltv,
            'avg_orders':           avg_orders,
            'total_revenue':        round(total_revenue, 2),
        })

    return records


# ── Supabase upsert ───────────────────────────────────────────────────────────

def upsert_supabase(records):
    from supabase import create_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        print('ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY missing from .env.secret')
        sys.exit(1)

    print(f'\nConnecting to Supabase: {SUPABASE_URL}')
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    print(f'Upserting {len(records)} shopify_cohorts rows...')
    sb.table('shopify_cohorts').upsert(records, on_conflict='cohort_month').execute()
    print(f'  ✓ shopify_cohorts: {len(records)} rows upserted')

    # Update sync metadata
    now = datetime.now().isoformat()
    sb.table('sync_metadata').upsert(
        {'source': 'shopify_cohorts', 'last_sync_at': now},
        on_conflict='source'
    ).execute()
    print(f'  ✓ sync_metadata: shopify_cohorts updated to {now}')


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print('=' * 60)
    print('UmamiPapi — Shopify Cohorts → Supabase Sync')
    print(f'Run at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print('=' * 60)

    if not SHOPIFY_SHOP_URL or not SHOPIFY_TOKEN:
        print('ERROR: SHOPIFY_SHOP_URL or SHOPIFY_ACCESS_TOKEN missing from .env.secret')
        sys.exit(1)

    print('\n[1/3] Fetching Shopify orders...')
    orders = fetch_all_orders()

    if not orders:
        print('  No orders found — nothing to process.')
        return

    print('\n[2/3] Calculating cohort metrics...')
    records = calculate_cohorts(orders)

    if not records:
        print('  No FY26 cohorts found.')
        return

    for r in records:
        print(
            f"  {r['cohort_month']}  "
            f"new={r['first_purchase_count']:>4}  "
            f"ret30={r['repeat_rate_30d']*100:>5.1f}%  "
            f"ret90={r['repeat_rate_90d']*100:>5.1f}%  "
            f"LTV=${r['avg_ltv']:>7.2f}"
        )

    print('\n[3/3] Upserting to Supabase...')
    upsert_supabase(records)

    print(f'\n✓ Sync complete. {len(records)} cohort months upserted to shopify_cohorts.')
    print('  Refresh the dashboard to see updated cohort data.')


if __name__ == '__main__':
    main()
