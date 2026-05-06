"""
sync_xero.py
------------
Fetches monthly P&L from Xero for FY26 (Jul 2025–present) and upserts
into the `pl_monthly` Supabase table.

OAuth2 flow:
  - First run: opens browser for auth, caches tokens to .xero_token_cache.json
  - Subsequent runs: uses refresh token silently

Usage:
    python scripts/sync_xero.py

Requirements:
    pip install requests supabase python-dotenv
"""

import os
import sys
import json
import time
import webbrowser
import threading
import urllib.parse
from pathlib import Path
from datetime import datetime, date
from http.server import HTTPServer, BaseHTTPRequestHandler

import requests
from dotenv import load_dotenv

# ── Config ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
load_dotenv(SCRIPT_DIR.parent / '.env.secret')

CLIENT_ID     = os.getenv('XERO_CLIENT_ID')
CLIENT_SECRET = os.getenv('XERO_CLIENT_SECRET')
SUPABASE_URL  = os.getenv('SUPABASE_URL')
SUPABASE_KEY  = os.getenv('SUPABASE_SERVICE_KEY')

TOKEN_CACHE   = SCRIPT_DIR / '.xero_token_cache.json'
REDIRECT_URI  = 'http://localhost:8080/callback'
SCOPES        = 'accounting.reports.profitandloss.read accounting.reports.executivesummary.read offline_access'

AUTH_URL        = 'https://login.xero.com/identity/connect/authorize'
TOKEN_URL       = 'https://login.xero.com/identity/connect/token'
CONNECTIONS_URL = 'https://api.xero.com/connections'
PNL_URL         = 'https://api.xero.com/api.xro/2.0/Reports/ProfitAndLoss'
EXEC_URL        = 'https://api.xero.com/api.xro/2.0/Reports/ExecutiveSummary'

FY26_START    = '2025-07-01'

FY_SORT = {
    'Jul': 1, 'Aug': 2, 'Sep': 3, 'Oct': 4, 'Nov': 5, 'Dec': 6,
    'Jan': 7, 'Feb': 8, 'Mar': 9, 'Apr': 10, 'May': 11, 'Jun': 12,
}

# ── OAuth2 helpers ────────────────────────────────────────────────────────────

def load_token_cache():
    if TOKEN_CACHE.exists():
        with open(TOKEN_CACHE) as f:
            return json.load(f)
    return None


def save_token_cache(data):
    with open(TOKEN_CACHE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f'  Token cached to {TOKEN_CACHE}')


def exchange_code_for_tokens(code):
    """Exchange an auth code for access + refresh tokens."""
    resp = requests.post(
        TOKEN_URL,
        data={
            'grant_type':    'authorization_code',
            'code':          code,
            'redirect_uri':  REDIRECT_URI,
        },
        auth=(CLIENT_ID, CLIENT_SECRET),
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        timeout=30,
    )
    resp.raise_for_status()
    tokens = resp.json()
    tokens['fetched_at'] = time.time()
    save_token_cache(tokens)
    return tokens


def refresh_access_token(refresh_token):
    """Use a refresh token to get a new access token."""
    resp = requests.post(
        TOKEN_URL,
        data={
            'grant_type':    'refresh_token',
            'refresh_token': refresh_token,
        },
        auth=(CLIENT_ID, CLIENT_SECRET),
        headers={'Content-Type': 'application/x-www-form-urlencoded'},
        timeout=30,
    )
    resp.raise_for_status()
    tokens = resp.json()
    tokens['fetched_at'] = time.time()
    save_token_cache(tokens)
    return tokens


def is_token_expired(tokens):
    """True if the access token will expire within 60 seconds."""
    fetched = tokens.get('fetched_at', 0)
    expires_in = tokens.get('expires_in', 1800)
    return (time.time() - fetched) >= (expires_in - 60)


class _CallbackHandler(BaseHTTPRequestHandler):
    """Minimal HTTP handler to capture the OAuth2 callback."""
    auth_code = None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        code = params.get('code', [None])[0]
        if code:
            _CallbackHandler.auth_code = code
            body = b'<html><body><h2>Authorised! You can close this tab.</h2></body></html>'
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(400)
            self.end_headers()

    def log_message(self, *args):
        pass  # silence server logs


def browser_auth_flow():
    """Open browser for one-time OAuth2 consent and capture the code."""
    params = {
        'response_type': 'code',
        'client_id':     CLIENT_ID,
        'redirect_uri':  REDIRECT_URI,
        'scope':         SCOPES,
        'state':         'ceo-dash',
    }
    url = AUTH_URL + '?' + urllib.parse.urlencode(params)

    print('\n--- Xero One-Time Auth ---')
    print('Opening your browser for Xero login...')
    print('If it does not open automatically, visit:')
    print(f'  {url}\n')

    webbrowser.open(url)

    server = HTTPServer(('localhost', 8080), _CallbackHandler)
    server.timeout = 120  # wait up to 2 minutes

    print('Waiting for callback on http://localhost:8080/callback ...')
    while _CallbackHandler.auth_code is None:
        server.handle_request()

    code = _CallbackHandler.auth_code
    print(f'  Got auth code: {code[:10]}...')
    return exchange_code_for_tokens(code)


def get_valid_tokens():
    """Return valid access tokens, refreshing or doing browser auth as needed."""
    tokens = load_token_cache()

    if tokens is None:
        print('No cached tokens — starting browser auth flow.')
        return browser_auth_flow()

    if is_token_expired(tokens):
        print('Access token expired — refreshing silently...')
        try:
            return refresh_access_token(tokens['refresh_token'])
        except Exception as e:
            print(f'  Refresh failed ({e}) — falling back to browser auth.')
            return browser_auth_flow()

    print('  Using cached access token.')
    return tokens


# ── Xero API calls ────────────────────────────────────────────────────────────

def get_tenant_id(access_token):
    resp = requests.get(
        CONNECTIONS_URL,
        headers={'Authorization': f'Bearer {access_token}', 'Accept': 'application/json'},
        timeout=30,
    )
    resp.raise_for_status()
    connections = resp.json()
    if not connections:
        print('ERROR: No Xero tenants found. Check your OAuth scopes and org.')
        sys.exit(1)
    tenant_id = connections[0]['tenantId']
    org_name  = connections[0].get('tenantName', 'Unknown')
    print(f'  Tenant: {org_name} ({tenant_id})')
    return tenant_id


def fetch_exec_summary(access_token, tenant_id):
    today = date.today().isoformat()
    params = {
        'toDate':    today,
        'periods':   str(_fy26_periods()),
        'timeframe': 'MONTH',
    }
    resp = requests.get(
        EXEC_URL,
        params=params,
        headers={
            'Authorization':  f'Bearer {access_token}',
            'Xero-tenant-id': tenant_id,
            'Accept':         'application/json',
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


def parse_exec_summary(exec_json):
    """
    Parse Xero Executive Summary JSON into monthly cash/working-capital rows.
    Returns list of {month, fiscal_year, cash, receivables, payables, working_capital, sort_order}
    """
    try:
        report = exec_json['Reports'][0]
    except (KeyError, IndexError):
        print('  WARNING: Unexpected Executive Summary response structure — skipping.')
        return []

    rows = report.get('Rows', [])

    # Extract column month labels from Header row
    month_labels = []
    for row in rows:
        if row.get('RowType') == 'Header':
            for cell in row.get('Cells', [])[1:]:
                parsed = _parse_xero_month_label(cell.get('Value', ''))
                if parsed:
                    month_labels.append(parsed)
            break

    if not month_labels:
        print('  WARNING: No month headers found in Executive Summary.')
        return []

    def extract_val(label_matches):
        for row in rows:
            result = _search_rows(row, label_matches)
            if result is not None:
                return result
        return None

    cash        = extract_val({'Cash', 'Cash and Cash Equivalents', 'Net Cash'})
    receivables = extract_val({'Receivables', 'Accounts Receivable', 'Debtors'})
    payables    = extract_val({'Payables', 'Accounts Payable', 'Creditors'})
    working_cap = extract_val({'Working Capital', 'Net Working Capital'})

    def safe_float(vals, idx):
        if vals is None or idx >= len(vals):
            return None
        try:
            v = str(vals[idx]).replace(',', '').strip()
            return float(v) if v not in ('', '-', 'N/A') else None
        except (ValueError, TypeError):
            return None

    records = []
    for i, mon in enumerate(month_labels):
        if mon not in FY_SORT:
            continue
        c  = safe_float(cash,        i)
        r  = safe_float(receivables, i)
        p  = safe_float(payables,    i)
        wc = safe_float(working_cap, i)
        if c is None and r is None and p is None and wc is None:
            continue
        records.append({
            'month':           mon,
            'fiscal_year':     'fy26',
            'cash':            round(c,  2) if c  is not None else None,
            'receivables':     round(r,  2) if r  is not None else None,
            'payables':        round(p,  2) if p  is not None else None,
            'working_capital': round(wc, 2) if wc is not None else None,
            'sort_order':      FY_SORT[mon],
        })

    return records


def _fy26_periods():
    """Months elapsed since FY26 start (Jul 2025), capped at 11 (Xero max)."""
    start = date(2025, 7, 1)
    today = date.today()
    months = (today.year - start.year) * 12 + (today.month - start.month) + 1
    return min(max(months, 1), 11)


def fetch_pnl(access_token, tenant_id):
    today = date.today().isoformat()
    params = {
        'toDate':         today,
        'periods':        str(_fy26_periods()),
        'timeframe':      'MONTH',
        'standardLayout': 'true',
    }
    resp = requests.get(
        PNL_URL,
        params=params,
        headers={
            'Authorization':  f'Bearer {access_token}',
            'Xero-tenant-id': tenant_id,
            'Accept':         'application/json',
        },
        timeout=60,
    )
    if not resp.ok:
        print(f'  Xero P&L error {resp.status_code}: {resp.text}')
        resp.raise_for_status()
    return resp.json()


# ── P&L Parser ────────────────────────────────────────────────────────────────

def parse_pnl(pnl_json):
    """
    Parse Xero P&L report JSON into a list of monthly dicts.

    Returns:
        list of {month, fiscal_year, revenue, cogs, gross_profit, gpm,
                  opex, net_op_profit, nopm, sort_order}
    """
    try:
        report = pnl_json['Reports'][0]
    except (KeyError, IndexError):
        print('ERROR: Unexpected P&L response structure.')
        sys.exit(1)

    rows = report.get('Rows', [])

    # ── Step 1: extract column month labels from Header row ───────────────────
    month_labels = []
    for row in rows:
        if row.get('RowType') == 'Header':
            cells = row.get('Cells', [])
            # First cell is the row label (""), rest are date columns
            for cell in cells[1:]:
                val = cell.get('Value', '')
                # Xero returns e.g. "01 Jul 2025" or "Jul 2025" or "July 2025"
                parsed_month = _parse_xero_month_label(val)
                if parsed_month:
                    month_labels.append(parsed_month)
            break

    if not month_labels:
        print('ERROR: Could not find month column headers in P&L report.')
        sys.exit(1)

    n_months = len(month_labels)
    print(f'  P&L columns: {", ".join(month_labels)}  ({n_months} months)')

    # ── Step 2: extract key rows ──────────────────────────────────────────────
    def summary_of_section(label_matches):
        """Return the SummaryRow values from the first Section whose title matches."""
        for row in rows:
            if row.get('RowType') != 'Section':
                continue
            title = row.get('Title', '')
            if any(lbl.lower() in title.lower() for lbl in label_matches if lbl):
                for sub in row.get('Rows', []):
                    if sub.get('RowType') == 'SummaryRow':
                        cells = sub.get('Cells', [])
                        return [c.get('Value', '') for c in cells[1:]]
        return None

    revenue      = summary_of_section({'Income', 'Revenue', 'Total Income'})
    cogs         = summary_of_section({'Cost of Sales', 'Less Cost of Sales', 'Direct Costs'})
    opex         = summary_of_section({'Operating Expenses', 'Less Operating Expenses', 'Expenses'})
    other_income = summary_of_section({'Other Income', 'Plus Other Income'})

    def safe_float(vals, idx):
        if vals is None or idx >= len(vals):
            return 0.0
        try:
            v = str(vals[idx]).replace(',', '').strip()
            return float(v) if v not in ('', '-', 'N/A') else 0.0
        except (ValueError, TypeError):
            return 0.0

    records = []
    for i, mon in enumerate(month_labels):
        if mon not in FY_SORT:
            continue

        rev  = safe_float(revenue,      i)
        cg   = safe_float(cogs,         i)
        op   = safe_float(opex,         i)
        oth  = safe_float(other_income, i)

        # Skip months with zero revenue (not yet occurred)
        if rev == 0.0:
            continue

        gp_v  = rev - cg
        net   = gp_v + oth - op
        gpm_v  = round((gp_v / rev) * 100, 2) if rev != 0 else 0.0
        nopm_v = round((net  / rev) * 100, 2) if rev != 0 else 0.0

        records.append({
            'month':         mon,
            'fiscal_year':   'fy26',
            'revenue':       round(rev,  2),
            'cogs':          round(cg,   2),
            'gross_profit':  round(gp_v, 2),
            'gpm':           gpm_v,
            'opex':          round(op,   2),
            'net_op_profit': round(net,  2),
            'nopm':          nopm_v,
            'sort_order':    FY_SORT[mon],
        })

    return records


def _parse_xero_month_label(val):
    """
    Convert Xero column header to a 3-letter month abbreviation.
    Handles: "01 Jul 2025", "Jul 2025", "July 2025", "Jul-25", "Jul"
    """
    val = str(val).strip()
    if not val:
        return None

    months_long  = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December']
    months_short = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec']

    # Check for 3-letter abbreviation anywhere in the string
    for abbr in months_short:
        if abbr.lower() in val.lower():
            return abbr

    # Check for full month name
    for i, full in enumerate(months_long):
        if full.lower() in val.lower():
            return months_short[i]

    return None


def _search_rows(row, label_matches):
    """
    Recursively search a Xero row (which may have nested Rows) for a
    SummaryRow whose title matches one of the label_matches strings.
    Returns a list of cell values (excluding the first label cell) or None.
    """
    row_type = row.get('RowType', '')
    title    = row.get('Title', '')

    # Check if this row's title matches
    if any(lbl.lower() in title.lower() or title.lower() in lbl.lower()
           for lbl in label_matches):
        if row_type in ('SummaryRow', 'Row'):
            cells = row.get('Cells', [])
            return [c.get('Value', '') for c in cells[1:]]

    # Search nested Rows
    for sub in row.get('Rows', []):
        result = _search_rows(sub, label_matches)
        if result is not None:
            return result

    return None


# ── Supabase upsert ───────────────────────────────────────────────────────────

def upsert_supabase(pl_records, exec_records):
    from supabase import create_client

    if not SUPABASE_URL or not SUPABASE_KEY:
        print('ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY missing from .env.secret')
        sys.exit(1)

    print(f'\nConnecting to Supabase: {SUPABASE_URL}')
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    print(f'Upserting {len(pl_records)} pl_monthly rows...')
    sb.table('pl_monthly').upsert(pl_records, on_conflict='month,fiscal_year').execute()
    print(f'  ✓ pl_monthly: {len(pl_records)} rows upserted')

    if exec_records:
        print(f'Upserting {len(exec_records)} xero_exec_summary rows...')
        sb.table('xero_exec_summary').upsert(exec_records, on_conflict='month,fiscal_year').execute()
        print(f'  ✓ xero_exec_summary: {len(exec_records)} rows upserted')

    now = datetime.now().isoformat()
    sb.table('sync_metadata').upsert(
        {'source': 'xero_pl', 'last_sync_at': now},
        on_conflict='source'
    ).execute()
    print(f'  ✓ sync_metadata: xero_pl updated to {now}')


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print('=' * 60)
    print('UmamiPapi — Xero P&L → Supabase Sync')
    print(f'Run at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print('=' * 60)

    if not CLIENT_ID or not CLIENT_SECRET:
        print('ERROR: XERO_CLIENT_ID or XERO_CLIENT_SECRET missing from .env.secret')
        sys.exit(1)

    print('\n[1/5] Authenticating with Xero...')
    tokens = get_valid_tokens()
    access_token = tokens['access_token']

    print('\n[2/5] Getting Xero tenant ID...')
    tenant_id = get_tenant_id(access_token)

    print('\n[3/5] Fetching P&L report (FY26)...')
    pnl_json = fetch_pnl(access_token, tenant_id)

    print('\n[4/5] Fetching Executive Summary (FY26)...')
    exec_json = fetch_exec_summary(access_token, tenant_id)

    print('\n[5/5] Parsing & upserting to Supabase...')
    pl_records   = parse_pnl(pnl_json)
    exec_records = parse_exec_summary(exec_json)

    if not pl_records:
        print('  No months with revenue found in P&L report — nothing to upsert.')
        return

    for r in pl_records:
        print(f"  {r['month']:>3}  rev=${r['revenue']:>10,.0f}  GPM={r['gpm']:>5.1f}%  NOPM={r['nopm']:>5.1f}%")

    if exec_records:
        print(f'  Executive Summary: {len(exec_records)} months parsed.')
        for r in exec_records:
            cash_str = f"${r['cash']:>10,.0f}" if r['cash'] is not None else '          —'
            wc_str   = f"${r['working_capital']:>10,.0f}" if r['working_capital'] is not None else '          —'
            print(f"  {r['month']:>3}  cash={cash_str}  wc={wc_str}")

    upsert_supabase(pl_records, exec_records)

    print(f'\n✓ Sync complete. {len(pl_records)} P&L months, {len(exec_records)} exec summary months.')
    print('  Refresh the dashboard to see updated data.')


if __name__ == '__main__':
    main()
