'use client'

import { useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { DashboardData, RevenueMonth, RevenueWeek } from '@/types'
import { fmt, pct, pctFmt, CHANNELS_DEF } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

function formatSyncTime(syncMetadata: any[] | undefined, source: string): string {
  if (!syncMetadata || syncMetadata.length === 0) return 'Not synced'
  const meta = syncMetadata.find(m => m.source === source)
  if (!meta || !meta.last_sync_at) return 'Not synced'
  const d = new Date(meta.last_sync_at)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const FY_MONTH_ORDER = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

interface Props {
  data: DashboardData
  filterYear: 'fy26' | 'fy25'
}

function getChannelKey(ch: typeof CHANNELS_DEF[0], row: RevenueMonth): number {
  if (ch.key === 'direct') return row.direct ?? 0
  if (ch.key === 'coles') return row.coles ?? 0
  if (ch.key === 'nandos') return row.nandos ?? 0
  if (ch.key === 'distrbn') return row.distrbn ?? 0
  if (ch.key === 'metcash') return row.metcash ?? 0
  return row.other ?? 0
}

const CHANNEL_COLORS_WEEKLY: Record<string, { border: string; bg: string }> = {
  direct:  { border: '#2980B9', bg: 'rgba(41,128,185,0.4)' },
  coles:   { border: '#C0392B', bg: 'rgba(192,57,43,0.4)' },
  nandos:  { border: '#E67E22', bg: 'rgba(230,126,34,0.4)' },
  distrbn: { border: '#8E44AD', bg: 'rgba(142,68,173,0.4)' },
  other:   { border: '#27AE60', bg: 'rgba(39,174,96,0.4)' },
}

export default function SalesOverview({ data, filterYear }: Props) {
  const [showWeekly, setShowWeekly] = useState(false)
  const rows: RevenueMonth[] = (filterYear === 'fy26' ? data.fy26 : data.fy25) ?? []
  const fy25 = data.fy25 ?? []
  const fy26 = data.fy26 ?? []
  const weekly: RevenueWeek[] = data.weekly ?? []

  const nonMtd = rows.filter(m => !m.mtd)
  const mtdRow = fy26.find(m => m.mtd)
  const prevMonthRow = nonMtd.at(-1)       // last complete month
  const prev2MonthRow = nonMtd.at(-2)      // two months ago

  // Dynamic date helpers
  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const curMonthAbbr  = MONTH_ABBR[now.getMonth()]
  const prevMonthAbbr = prevMonthRow?.month?.slice(0, 3) ?? MONTH_ABBR[(now.getMonth() + 11) % 12]
  const prev2MonthAbbr = prev2MonthRow?.month?.slice(0, 3) ?? MONTH_ABBR[(now.getMonth() + 10) % 12]
  const mtdDaysElapsed = now.getDate() - 1

  const ytdTotal = rows.reduce((s, m) => s + (m.total ?? 0), 0)
  const fy26Count = fy26.length
  const fy25Base = fy25.slice(0, fy26Count).reduce((s, m) => s + (m.total ?? 0), 0)
  const yoyPct = pct(ytdTotal, fy25Base)

  const mtdProjected = mtdDaysElapsed > 0 && mtdRow ? (mtdRow.total / mtdDaysElapsed) * 30 : 0
  const momProjPct = prevMonthRow ? pct(mtdProjected, prevMonthRow.total) : 0

  // Chart month labels — derive from actual FY26 data
  const chartMonths = FY_MONTH_ORDER.filter(mo =>
    fy26.some(m => m.month?.startsWith(mo)) || fy25.some(m => m.month?.startsWith(mo))
  )

  // Channel totals YTD
  const channelTotals = CHANNELS_DEF.map(ch => ({
    ...ch,
    total: rows.reduce((s, m) => s + getChannelKey(ch, m), 0),
  }))
  const grandTotal = channelTotals.reduce((s, c) => s + c.total, 0)

  // Monthly revenue chart data
  const fy26Monthly = chartMonths.map(mo => {
    const r = fy26.find(m => m.month?.startsWith(mo))
    return r ? r.total : 0
  })
  const fy25Monthly = chartMonths.map(mo => {
    const r = fy25.find(m => m.month?.startsWith(mo))
    return r ? r.total : 0
  })

  const lineData = {
    labels: chartMonths,
    datasets: [
      { label: 'FY26', data: fy26Monthly, borderColor: RED, backgroundColor: 'rgba(192,57,43,0.15)', tension: 0.35, fill: true, pointRadius: 3, pointBackgroundColor: RED },
      { label: 'FY25', data: fy25Monthly, borderColor: '#555', backgroundColor: 'transparent', tension: 0.35, borderDash: [4, 3], pointRadius: 2, pointBackgroundColor: '#555' },
    ],
  }

  const lineOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#888', font: { size: 10 }, boxWidth: 12 } }, tooltip: { callbacks: { label: (ctx: any) => ' ' + fmt(ctx.raw) } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 }, callback: (v: number) => fmt(v) } },
    },
  }

  // Donut chart
  const donutData = {
    labels: channelTotals.map(c => c.label),
    datasets: [{ data: channelTotals.map(c => c.total), backgroundColor: channelTotals.map(c => c.color), borderWidth: 0 }],
  }
  const donutOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: '#888', font: { size: 10 }, boxWidth: 10, padding: 8 } }, tooltip: { callbacks: { label: (ctx: any) => ' ' + fmt(ctx.raw) } } },
  }

  // Stacked bar
  const stackedData = {
    labels: nonMtd.map(m => m.month?.slice(0, 3) ?? ''),
    datasets: CHANNELS_DEF.map(ch => ({
      label: ch.label,
      data: nonMtd.map(m => getChannelKey(ch, m)),
      backgroundColor: ch.color,
      stack: 'a',
    })),
  }
  const stackedOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { color: '#888', font: { size: 9 }, boxWidth: 8, padding: 6 } }, tooltip: { callbacks: { label: (ctx: any) => ' ' + fmt(ctx.raw) } } },
    scales: {
      x: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: number) => fmt(v) } },
    },
  }

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">eCommerce</span><span>{formatSyncTime(data.syncMetadata, 'marketing')}</span></div>
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Sales Intelligence</div>
        <div className="flag-row">
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Coles Apr MTD $41,165 — only 8 days in. Apr full month will be weak vs Mar $177K unless large orders arrive.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>YoY ex-Metcash tracking +9.4% — but Sep/Oct still show structural weakness vs FY25 peaks.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Nandos Jan 2026: $124,827 — highest single-month ever. Structural step-change.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Distribution channel growing: $85K Feb, $74K Jan vs avg ~$50K.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Monitor Apr Coles orders daily — $177K Mar sets a tough comparison.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Confirm Nandos Jan volume was structural (new pricing/SKU) not one-off.</span></div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-3">
        <div className="kpi">
          <div className="kpi-lbl">YTD Revenue</div>
          <div className="kpi-val">{fmt(ytdTotal)}</div>
          <div className="kpi-sub"><span className={yoyPct >= 0 ? 'up' : 'dn'}>{pctFmt(yoyPct)}</span> vs FY25</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">{curMonthAbbr} MTD</div>
          <div className="kpi-val">{mtdRow ? fmt(mtdRow.total) : '—'}</div>
          <div className="kpi-sub">{mtdDaysElapsed} days in</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Proj MoM</div>
          <div className="kpi-val">{pctFmt(momProjPct)}</div>
          <div className="kpi-sub">vs {prevMonthAbbr} {prevMonthRow ? fmt(prevMonthRow.total) : '—'}</div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Monthly Revenue — FY26 vs FY25</span><span className="pg">Jul–Mar</span></div>
        <div className="pb">
          <div className="chart-h220"><Line data={lineData} options={lineOpts} /></div>
        </div>
      </div>

      {/* g-1-2: Donut + Stacked Bar */}
      <div className="g-1-2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">Channel Mix YTD</span></div>
          <div className="pb">
            <div className="chart-h200"><Doughnut data={donutData} options={donutOpts} /></div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Monthly Channel Breakdown</span></div>
          <div className="pb">
            <div className="chart-h200"><Bar data={stackedData} options={stackedOpts} /></div>
          </div>
        </div>
      </div>

      {/* Weekly Revenue — collapsible */}
      {weekly.length > 0 && (() => {
        const last13 = weekly.slice(-13)
        const weekRangeLabel = last13.length > 0 ? `${last13[0].week_label} – ${last13[last13.length - 1].week_label}` : ''
        const weeklyChartData = {
          labels: last13.map(w => w.week_label),
          datasets: (['direct', 'coles', 'nandos', 'distrbn', 'other'] as const).map(ch => ({
            label: ch.charAt(0).toUpperCase() + ch.slice(1),
            data: last13.map(w => w[ch]),
            borderColor: CHANNEL_COLORS_WEEKLY[ch].border,
            backgroundColor: CHANNEL_COLORS_WEEKLY[ch].bg,
            tension: 0.3, fill: true, stack: 'w', pointRadius: 2,
            pointBackgroundColor: CHANNEL_COLORS_WEEKLY[ch].border,
          })),
        }
        const weeklyOpts: any = {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom', labels: { color: '#aaa', font: { size: 10 }, boxWidth: 12, padding: 10 } },
            tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` } },
          },
          scales: {
            x: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, maxRotation: 45 } },
            y: { stacked: true, grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: number) => fmt(v) } },
          },
        }
        return (
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="ph" style={{ cursor: 'pointer' }} onClick={() => setShowWeekly(v => !v)}>
              <span className="pt">Weekly Revenue — Last 13 Weeks</span>
              <span className="pg">{showWeekly ? weekRangeLabel : '▸ expand'}</span>
            </div>
            {showWeekly && (
              <div className="pb">
                <div className="chart-h240"><Line data={weeklyChartData} options={weeklyOpts} /></div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Channel Performance Table */}
      <div className="panel">
        <div className="ph"><span className="pt">Channel Performance</span><span className="pg">YTD FY26</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Channel</th>
                <th className="r">YTD</th>
                <th className="r">% Share</th>
                <th className="r">{prev2MonthAbbr}</th>
                <th className="r">{prevMonthAbbr}</th>
                <th className="r">MoM</th>
              </tr>
            </thead>
            <tbody>
              {channelTotals.map(ch => {
                const prev2Val = prev2MonthRow ? getChannelKey(ch, prev2MonthRow) : 0
                const prevVal  = prevMonthRow  ? getChannelKey(ch, prevMonthRow)  : 0
                const mom = pct(prevVal, prev2Val)
                const share = grandTotal > 0 ? (ch.total / grandTotal * 100) : 0
                return (
                  <tr key={ch.key}>
                    <td><span className="dot" style={{ background: ch.color }} />{ch.label}</td>
                    <td className="r">{fmt(ch.total)}</td>
                    <td className="r">{share.toFixed(1)}%</td>
                    <td className="r">{prev2Val > 0 ? fmt(prev2Val) : '—'}</td>
                    <td className="r">{prevVal > 0 ? fmt(prevVal) : '—'}</td>
                    <td className="r"><span className={mom >= 0 ? 'up' : 'dn'}>{prevVal > 0 && prev2Val > 0 ? pctFmt(mom) : '—'}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
