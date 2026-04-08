# UmamiPapi CEO Dashboard

A standalone Next.js web application replicating the CEO Dashboard, connected to Supabase for data storage and deployable to Vercel.

---

## Stack

- **Next.js 14** (App Router)
- **Supabase** — PostgreSQL database + realtime
- **react-chartjs-2** — Chart.js charts
- **TypeScript**
- **Vercel** — deployment

---

## Local Setup

### 1. Install dependencies

```bash
cd ceo-dashboard
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   This creates all tables and seeds all the existing data.

3. Copy your project credentials from **Settings → API**:
   - `Project URL`
   - `anon public` key

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B: GitHub + Vercel Dashboard

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Import Project → select the repo
3. Add the two environment variables in the Vercel project settings
4. Deploy

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (metadata, fonts)
│   ├── page.tsx            # Renders Dashboard
│   ├── globals.css         # All CSS (exact port from original)
│   └── api/
│       ├── data/route.ts   # GET all dashboard data from Supabase
│       └── dismissed/route.ts  # GET/POST/DELETE dismissed alerts
├── components/
│   ├── Dashboard.tsx       # Main app shell + routing state
│   ├── Nav.tsx             # Sidebar navigation
│   ├── Topbar.tsx          # Top bar + theme toggle
│   ├── MobileNav.tsx       # Bottom tab bar + drawer
│   └── pages/
│       ├── CommandCentre.tsx
│       ├── SalesOverview.tsx
│       ├── Operations.tsx
│       ├── FinancialControl.tsx
│       ├── SpendControl.tsx
│       ├── Marketing.tsx
│       ├── SEO.tsx
│       ├── PeopleTeam.tsx
│       ├── RevenueDetail.tsx
│       ├── MarginDetail.tsx
│       ├── ChannelDetail.tsx
│       └── ProductionDetail.tsx
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # fmt, pct, static data constants
└── types/
    └── index.ts            # All TypeScript types
```

---

## Supabase Tables

| Table | Description |
|-------|-------------|
| `revenue_monthly` | FY25 + FY26 monthly revenue by channel |
| `revenue_weekly` | Weekly revenue breakdown |
| `production_monthly` | Monthly production (units, hours, UPH, staff) |
| `production_weekly` | Weekly production efficiency |
| `production_sku` | SKU mix data |
| `issues` | Operational issues log |
| `calendar_events` | Upcoming events + public holidays |
| `ap_categories` | AP spend by category |
| `marketing_monthly` | Monthly marketing KPIs |
| `large_transactions` | Transactions >$10K |
| `anomalies` | Spend anomaly flags |
| `signals` | CEO signals (updates, delegations, nudges) |
| `dismissed_alerts` | Dismissed command centre alerts (per day) |

---

## Updating Data

All data lives in Supabase. Update it directly via:
- **Supabase Dashboard** → Table Editor
- **SQL Editor** for bulk updates
- Or connect your data sources (Xero, Shopify, Google Sheets) via Supabase Edge Functions

---

## Themes

Three themes available via the toggle button in the top bar:
- **Night** (default) — dark charcoal
- **Day** — warm cream/white
- **Dusk** — deep amber

Theme preference is saved to `localStorage`.
