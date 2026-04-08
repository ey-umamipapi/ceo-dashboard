'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { DashboardData, RevenueMonth } from '@/types'
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

const MONTHS = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

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

export default function SalesOverview({ data, filterYear }: Props) {
  const rows: RevenueMonth[] = (filterYear === 'fy26' ? data.fy26 : data.fy25) ?? []
  const fy25 = data.fy25 ?? []
  const fy26 = data.fy26 ?? []

  const nonMtd = rows.filter(m => !m.mtd)
  const mtdRow = fy26.find(m => m.mtd)
  const marRow = nonMtd.find(m => m.month?.includes('Mar') || m.month?.includes('Mar'))
    ?? nonMtd.at(-1)
  const febRow = nonMtd.find(m => m.month?.includes('Feb'))

  const ytdTotal = rows.reduce((s, m) => s + (m.total ?? 0), 0)
  const fy25Base = fy25.slice(0, 9).reduce((s, m) => s + (m.total ?? 0), 0)
  const yoyPct = pct(ytdTotal, fy25Base)

  const aprMtdDays = 8
  const aprProjected = mtdRow ? (mtdRow.total / aprMtdDays) * 30 : 0
  const momProjPct = marRow ? pct(aprProjected, marRow.total) : 0

  // FY25 YoY Apr (use Apr FY25 row if available)
  const apr25 = fy25.find(m => m.month?.includes('Apr'))
  const yoyApr = apr25 && mtdRow ? pct(mtdRow.total, apr25.total) : 0

  // Channel totals YTD
  const channelTotals = CHANNELS_DEF.map(ch => ({
    ...ch,
    total: rows.reduce((s, m) => s + getChannelKey(ch, m), 0),
  }))
  const grandTotal = channelTotals.reduce((s, c) => s + c.total, 0)

  // Monthly revenue chart data
  const fy26Monthly = MONTHS.map(mo => {
    const r = fy26.find(m => m.month?.startsWith(mo))
    return r ? r.total : 0
  })
  const fy25Monthly = MONTHS.map(mo => {
    const r = fy25.find(m => m.month?.startsWith(mo))
    return r ? r.total : 0
  })

  const lineData = {
    labels: MONTHS,
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
      <div className="kpi-row cols-4">
        <div className="kpi">
          <div className="kpi-lbl">YTD Revenue</div>
          <div className="kpi-val">{fmt(ytdTotal)}</div>
          <div className="kpi-sub"><span className={yoyPct >= 0 ? 'up' : 'dn'}>{pctFmt(yoyPct)}</span> vs FY25</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Apr MTD</div>
          <div className="kpi-val">{mtdRow ? fmt(mtdRow.total) : '—'}</div>
          <div className="kpi-sub">8 days in</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Proj MoM</div>
          <div className="kpi-val">{pctFmt(momProjPct)}</div>
          <div className="kpi-sub">vs Mar {marRow ? fmt(marRow.total) : '—'}</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-lbl">YoY ex-Metcash</div>
          <div className="kpi-val">+9.4%</div>
          <div className="kpi-sub">Organic growth</div>
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
                <th className="r">Feb</th>
                <th className="r">Mar</th>
                <th className="r">MoM</th>
              </tr>
            </thead>
            <tbody>
              {channelTotals.map(ch => {
                const feb = nonMtd.find(m => m.month?.includes('Feb'))
                const mar = nonMtd.find(m => m.month?.includes('Mar'))
                const febVal = feb ? getChannelKey(ch, feb) : 0
                const marVal = mar ? getChannelKey(ch, mar) : 0
                const mom = pct(marVal, febVal)
                const share = grandTotal > 0 ? (ch.total / grandTotal * 100) : 0
                return (
                  <tr key={ch.key}>
                    <td><span className="dot" style={{ background: ch.color }} />{ch.label}</td>
                    <td className="r">{fmt(ch.total)}</td>
                    <td className="r">{share.toFixed(1)}%</td>
                    <td className="r">{febVal > 0 ? fmt(febVal) : '—'}</td>
                    <td className="r">{marVal > 0 ? fmt(marVal) : '—'}</td>
                    <td className="r"><span className={mom >= 0 ? 'up' : 'dn'}>{marVal > 0 && febVal > 0 ? pctFmt(mom) : '—'}</span></td>
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
