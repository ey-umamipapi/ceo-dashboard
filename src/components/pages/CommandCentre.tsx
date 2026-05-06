'use client'

import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { DashboardData } from '@/types'
import { fmt, pct, pctFmt, todayStamp } from '@/lib/utils'

function formatSyncTime(syncMetadata: any[] | undefined, source: string): string {
  if (!syncMetadata || syncMetadata.length === 0) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta || !meta.last_sync_at) return 'Not synced'
  const d = new Date(meta.last_sync_at)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const ALERTS = [
  { type: 'crit', text: 'Mayo at 17,185 jars — best-before risk active. No days-cover model. Largest open working capital exposure.' },
  { type: 'crit', text: 'Forklift operators unlicensed since Jan 2025 — WHS liability unresolved.' },
  { type: 'crit', text: 'collections/chilli-oil — 16K impressions, 0.9% CTR. Hero product page underperforming. Fix is a 2-hour task.' },
  { type: 'watch', text: 'Coles concentration at 47% of YTD revenue — single-customer dependency risk.' },
  { type: 'watch', text: 'GP and NOP actuals only available through Nov 2025 — 4 months of margin blind.' },
  { type: 'info', text: 'Mayo Coles pricing gap: $4.58 sell-in vs ~$8 DTC equivalent. 27pp margin gap. Validation with Joe + Retcon pending.' },
]

function AlertStrip() {
  const [dismissed, setDismissed] = useState<number[]>([])
  const key = `up_dismissed_alerts_${todayStamp()}`

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setDismissed(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [key])

  const dismiss = (idx: number) => {
    const next = [...dismissed, idx]
    setDismissed(next)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const visible = ALERTS.filter((_, i) => !dismissed.includes(i))
  if (visible.length === 0) return null

  return (
    <div style={{ marginBottom: 18 }}>
      <div className="alert-row">
        {ALERTS.map((a, i) => {
          if (dismissed.includes(i)) return null
          const cls = a.type === 'crit' ? 'alert-crit' : a.type === 'watch' ? 'alert-watch' : 'alert-info'
          const badge = a.type === 'crit' ? 'crit' : a.type === 'watch' ? 'watch' : 'info'
          const label = a.type === 'crit' ? 'CRITICAL' : a.type === 'watch' ? 'WATCH' : 'INFO'
          return (
            <div key={i} className={`alert-item ${cls}`}>
              <span className={`alert-badge ${badge}`}>{label}</span>
              <span>{a.text}</span>
              <button className="alert-dismiss" onClick={() => dismiss(i)} aria-label="Dismiss">✕</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CommandCentre({ data }: { data: DashboardData }) {
  const fy26 = data.fy26 ?? []
  const fy25 = data.fy25 ?? []

  // ── Dynamic date helpers ──────────────────────────────────────────────────
  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const curMonthAbbr  = MONTH_ABBR[now.getMonth()]
  const prevMonthAbbr = MONTH_ABBR[(now.getMonth() + 11) % 12]
  const mtdDaysElapsed = now.getDate() - 1  // completed days (exclude today)

  // ── YTD total FY26 (non-MTD months + MTD) ───────────────────────────────
  const ytdTotal = fy26.reduce((s, m) => s + (m.total ?? 0), 0)

  // FY25 comparison: same number of elapsed FY months
  const fy26Count = fy26.length
  const fy25Base  = fy25.slice(0, fy26Count).reduce((s, m) => s + (m.total ?? 0), 0)
  const yoyPct    = pct(ytdTotal, fy25Base)

  // MTD row = whichever row is flagged mtd
  const mtdRow = fy26.find(m => m.mtd)
  // Last complete month = last non-MTD row
  const latestMonth = fy26.filter(m => !m.mtd).at(-1)
  // Latest production month with uph > 0
  const latestProd = [...(data.prodMonthly ?? [])].reverse().find(p => (p.uph ?? 0) > 0)
  // Latest marketing row (last month complete)
  const mktLatest = data.marketing?.filter(m => !m.mtd).at(-1)

  // MTD projected run-rate (× 30 day month)
  const mtdProjected = mtdDaysElapsed > 0 && mtdRow ? (mtdRow.total / mtdDaysElapsed) * 30 : 0
  const mtdPct = latestMonth && latestMonth.total > 0 ? (mtdRow?.total ?? 0) / latestMonth.total * 100 : 0

  // YoY ex-Metcash
  const fy26ExMeta = fy26.reduce((s, m) => s + (m.total - (m.metcash ?? 0)), 0)
  const fy25ExMeta = fy25.slice(0, fy26Count).reduce((s, m) => s + (m.total - (m.metcash ?? 0)), 0)
  const yoyExMeta  = pct(fy26ExMeta, fy25ExMeta)

  // Revenue status colour
  const revColor = yoyPct >= 10 ? 'green' : yoyPct >= 0 ? 'amber' : 'red'

  // Ops status
  const uphVal = latestProd?.uph ?? 0
  const opsColor = uphVal >= 190 ? 'green' : uphVal >= 170 ? 'amber' : 'red'

  // Marketing CPA
  const cpa = mktLatest?.cpa ?? 0
  const mktColor = cpa <= 25 ? 'green' : cpa <= 30 ? 'amber' : 'red'

  // Cash from Xero exec summary (latest month)
  const execSummary = data.xeroExecSummary ?? []
  const latestExec = execSummary[execSummary.length - 1]
  const cashVal = latestExec?.cash
  const cashLabel = cashVal != null ? `$${(cashVal / 1000).toFixed(0)}K` : '$576K'
  const cashSub = latestExec ? `${latestExec.month} — live from Xero` : 'Static — sync pending'
  const cashDecision = cashVal != null ? (cashVal >= 150000 ? 'Healthy cash position' : cashVal >= 80000 ? 'Monitor — getting tight' : 'Low — action required') : 'Healthy. $677K gross bank.'
  const cashColor = cashVal != null ? (cashVal >= 150000 ? 'green' : cashVal >= 80000 ? 'amber' : 'red') : 'green'

  // Delegations
  const delegations = (data.signals ?? []).filter(s => s.signal_type === 'delegation' && !s.archived)

  // Recent months for current month panel
  const recentMonths = fy26.filter(m => !m.mtd).slice(-4)

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">eCommerce</span><span>{formatSyncTime(data.syncMetadata, 'marketing')}</span></div>
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Financial</span><span>{formatSyncTime(data.syncMetadata, 'financial')}</span></div>
      </div>

      {/* Alert Strip */}
      <AlertStrip />

      {/* Status Row */}
      <div className="status-row" style={{ marginBottom: 20 }}>
        <div className={`status-card ${revColor}`}>
          <div className="status-label"><span className={`status-dot ${revColor}`} />Revenue</div>
          <div className="status-value">{pctFmt(yoyPct)}</div>
          <div className="status-sub">YoY YTD vs FY25</div>
          <div className="status-decision">{yoyPct >= 10 ? 'On track' : yoyPct >= 0 ? 'Borderline — monitor' : 'Behind — needs action'}</div>
        </div>
        <div className={`status-card ${opsColor}`}>
          <div className="status-label"><span className={`status-dot ${opsColor}`} />Operations</div>
          <div className="status-value">{uphVal > 0 ? uphVal.toFixed(1) : '—'}</div>
          <div className="status-sub">UPH vs 190 benchmark</div>
          <div className="status-decision">{uphVal >= 190 ? 'Above benchmark' : 'Below 190 target'}</div>
        </div>
        <div className={`status-card ${cashColor}`}>
          <div className="status-label"><span className={`status-dot ${cashColor}`} />Cash</div>
          <div className="status-value">{cashLabel}</div>
          <div className="status-sub">{cashSub}</div>
          <div className="status-decision">{cashDecision}</div>
        </div>
        <div className={`status-card ${mktColor}`}>
          <div className="status-label"><span className={`status-dot ${mktColor}`} />Marketing Pulse</div>
          <div className="status-value">{cpa > 0 ? `$${cpa.toFixed(2)}` : '—'}</div>
          <div className="status-sub">{prevMonthAbbr} CPA — threshold $25</div>
          <div className="status-decision">{cpa <= 25 ? 'CPA in range' : 'CPA above threshold — review'}</div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-3">
        <div className={`kpi ${revColor}`}>
          <div className="kpi-lbl">YTD Revenue FY26</div>
          <div className="kpi-val">{fmt(ytdTotal)}</div>
          <div className="kpi-sub"><span className={yoyPct >= 0 ? 'up' : 'dn'}>{pctFmt(yoyPct)}</span> vs FY25 same period</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">{curMonthAbbr} MTD Revenue</div>
          <div className="kpi-val">{mtdRow ? fmt(mtdRow.total) : '—'}</div>
          <div className="kpi-sub">
            <div className="prog-wrap" style={{ marginTop: 4 }}>
              <div className="prog-fill" style={{ width: `${Math.min(mtdPct, 100)}%`, background: BLU }} />
            </div>
            {mtdDaysElapsed > 0 ? `Proj ${fmt(mtdProjected)} at ${mtdDaysElapsed}d run rate` : 'First day of month'}
          </div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">YoY ex-Metcash</div>
          <div className="kpi-val">{pctFmt(yoyExMeta)}</div>
          <div className="kpi-sub">Organic channel growth</div>
        </div>
      </div>

      {/* 2-col grid */}
      <div className="g2">
        {/* Current Month Panel */}
        <div className="panel">
          <div className="ph">
            <span className="pt">Current Month</span>
            <span className="pg">{curMonthAbbr} MTD / {prevMonthAbbr} Complete</span>
          </div>
          <div className="pb">
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--mid)', marginBottom: 4 }}>{curMonthAbbr} MTD ({mtdDaysElapsed} days)</div>
              <div style={{ fontFamily: 'VisbyRound', fontWeight: 800, fontSize: 26, color: 'var(--white)' }}>
                {mtdRow ? fmt(mtdRow.total) : '—'}
              </div>
              <div className="prog-wrap">
                <div className="prog-fill" style={{ width: `${Math.min(mtdPct, 100)}%` }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--mid)' }}>{mtdPct.toFixed(0)}% of {prevMonthAbbr} pace · Proj {fmt(mtdProjected)}</div>
            </div>
            <div className="slbl">Recent Months</div>
            {recentMonths.length === 0 ? (
              <p className="text-muted">No revenue data available.</p>
            ) : (
              recentMonths.map(m => (
                <div key={m.month} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--row-sep)', fontSize: 12 }}>
                  <span style={{ color: 'var(--creme)' }}>{m.month}</span>
                  <span style={{ color: 'var(--white)', fontWeight: 600 }}>{fmt(m.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CEO Actions Panel */}
        <div className="panel">
          <div className="ph">
            <span className="pt">CEO Actions This Week</span>
            <span className="pg">{delegations.length} open</span>
          </div>
          <div className="pb">
            {delegations.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--mid)' }}>No open delegations.</div>
            ) : (
              delegations.map((s, i) => (
                <div key={s.id ?? i} className="feed-item">
                  <div className="feed-date">{s.date}</div>
                  <div className="feed-text">{s.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
