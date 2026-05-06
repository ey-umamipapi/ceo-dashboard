'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { DashboardData, RevenueMonth, RevenueWeek } from '@/types'
import { fmt, pct, pctFmt } from '@/lib/utils'

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

interface Props {
  data: DashboardData
  filterYear: 'fy26' | 'fy25'
}

export default function RevenueDetail({ data, filterYear }: Props) {
  const rows: RevenueMonth[] = (filterYear === 'fy26' ? data.fy26 : data.fy25) ?? []
  const fy26 = data.fy26 ?? []
  const fy25 = data.fy25 ?? []
  const weekly: RevenueWeek[] = data.weekly ?? []

  const nonMtd = rows.filter(m => !m.mtd)
  const mtdRow = fy26.find(m => m.mtd)
  const prevMonthRow = fy26.filter(m => !m.mtd).at(-1)   // last complete month

  // Dynamic date helpers
  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const curMonthAbbr  = MONTH_ABBR[now.getMonth()]
  const prevMonthAbbr = MONTH_ABBR[(now.getMonth() + 11) % 12]
  const mtdDaysElapsed = now.getDate() - 1  // completed days

  const mtdProjected = mtdDaysElapsed > 0 && mtdRow ? (mtdRow.total / mtdDaysElapsed) * 30 : 0
  const momProjPct = prevMonthRow ? pct(mtdProjected, prevMonthRow.total) : 0

  // YoY current month
  const curMonth25 = fy25.find(m => m.month?.includes(curMonthAbbr))
  const yoyCur = curMonth25 && mtdRow && mtdDaysElapsed > 0 ? pct(mtdRow.total / mtdDaysElapsed * 30, curMonth25.total) : 0

  // Weekly chart — last 13 weeks, stacked area by channel
  const last13 = weekly.slice(-13)
  const weekRangeLabel = last13.length > 0 ? `${last13[0].week_label} – ${last13[last13.length - 1].week_label}` : ''

  const CHANNEL_COLORS: Record<string, { border: string; bg: string }> = {
    direct:  { border: BLU,              bg: 'rgba(41,128,185,0.45)' },
    coles:   { border: RED,              bg: 'rgba(192,57,43,0.45)' },
    nandos:  { border: ORG,              bg: 'rgba(230,126,34,0.45)' },
    distrbn: { border: PRP,              bg: 'rgba(142,68,173,0.45)' },
    other:   { border: GRN,              bg: 'rgba(39,174,96,0.45)' },
  }

  const weeklyChartData = {
    labels: last13.map(w => w.week_label),
    datasets: (['direct', 'coles', 'nandos', 'distrbn', 'other'] as const).map(ch => ({
      label: ch.charAt(0).toUpperCase() + ch.slice(1),
      data: last13.map(w => w[ch]),
      borderColor: CHANNEL_COLORS[ch].border,
      backgroundColor: CHANNEL_COLORS[ch].bg,
      tension: 0.3,
      fill: true,
      stack: 'weekly',
      pointRadius: 2,
      pointBackgroundColor: CHANNEL_COLORS[ch].border,
    })),
  }

  const weeklyOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
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
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{formatSyncTime(data.syncMetadata, 'masterpapi')}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">eCommerce</span><span>{formatSyncTime(data.syncMetadata, 'marketing')}</span></div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-4">
        <div className="kpi blue">
          <div className="kpi-lbl">{curMonthAbbr} MTD</div>
          <div className="kpi-val">{mtdRow ? fmt(mtdRow.total) : '—'}</div>
          <div className="kpi-sub">{mtdDaysElapsed} days in</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Projected {curMonthAbbr}</div>
          <div className="kpi-val">{fmt(mtdProjected)}</div>
          <div className="kpi-sub">At current run rate</div>
        </div>
        <div className={`kpi ${momProjPct >= 0 ? 'green' : 'red'}`}>
          <div className="kpi-lbl">Proj MoM</div>
          <div className="kpi-val">{pctFmt(momProjPct)}</div>
          <div className="kpi-sub">vs {prevMonthAbbr} {prevMonthRow ? fmt(prevMonthRow.total) : '—'}</div>
        </div>
        <div className={`kpi ${yoyCur >= 0 ? 'green' : 'red'}`}>
          <div className="kpi-lbl">YoY {curMonthAbbr}</div>
          <div className="kpi-val">{curMonth25 ? pctFmt(yoyCur) : '—'}</div>
          <div className="kpi-sub">Projected vs {curMonthAbbr} FY25</div>
        </div>
      </div>

      {/* Weekly Revenue Chart */}
      {weekly.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Weekly Revenue</span><span className="pg">Last 13 weeks · {weekRangeLabel}</span></div>
          <div className="pb">
            <div className="chart-h240"><Line data={weeklyChartData} options={weeklyOpts} /></div>
          </div>
        </div>
      )}

      {/* Monthly Revenue Detail Table */}
      <div className="panel">
        <div className="ph">
          <span className="pt">Monthly Revenue Detail</span>
          <span className="pg">{filterYear.toUpperCase()}</span>
        </div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Month</th>
                <th className="r">Revenue</th>
                <th className="r">MoM</th>
                <th className="r">FY25</th>
                <th className="r">YoY</th>
                <th className="r">Coles</th>
                <th className="r">Direct</th>
                <th className="r">Orders</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m, i) => {
                const prev = rows[i - 1]
                const momChg = prev ? pct(m.total, prev.total) : null
                // Match FY25 by month label
                const monthLabel = m.month?.slice(0, 3)
                const fy25Row = fy25.find(r => r.month?.startsWith(monthLabel ?? ''))
                const yoyChg = fy25Row ? pct(m.total, fy25Row.total) : null
                return (
                  <tr key={m.month ?? i}>
                    <td>{m.month}{m.mtd ? <span style={{ fontSize: 9, color: 'var(--mid)', marginLeft: 4 }}>MTD</span> : null}</td>
                    <td className="r">{fmt(m.total)}</td>
                    <td className="r">{momChg != null ? <span className={momChg >= 0 ? 'up' : 'dn'}>{pctFmt(momChg)}</span> : '—'}</td>
                    <td className="r">{fy25Row ? fmt(fy25Row.total) : '—'}</td>
                    <td className="r">{yoyChg != null ? <span className={yoyChg >= 0 ? 'up' : 'dn'}>{pctFmt(yoyChg)}</span> : '—'}</td>
                    <td className="r">{m.coles > 0 ? fmt(m.coles) : '—'}</td>
                    <td className="r">{m.direct > 0 ? fmt(m.direct) : '—'}</td>
                    <td className="r">{m.orders > 0 ? m.orders.toLocaleString() : '—'}</td>
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
