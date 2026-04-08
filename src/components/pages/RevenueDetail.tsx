'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { DashboardData, RevenueMonth, RevenueWeek } from '@/types'
import { fmt, pct, pctFmt, DATA_UPDATED } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

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
  const marRow = fy26.filter(m => !m.mtd).find(m => m.month?.includes('Mar')) ?? fy26.filter(m => !m.mtd).at(-1)

  const aprMtdDays = 8
  const aprProjected = mtdRow ? (mtdRow.total / aprMtdDays) * 30 : 0
  const momProjPct = marRow ? pct(aprProjected, marRow.total) : 0

  // YoY Apr
  const apr25 = fy25.find(m => m.month?.includes('Apr'))
  const yoyApr = apr25 && mtdRow ? pct(mtdRow.total / aprMtdDays * 30, apr25.total) : 0

  // Weekly chart
  const weeklyChartData = {
    labels: weekly.map(w => w.week_label),
    datasets: [{
      label: 'Weekly Revenue',
      data: weekly.map(w => w.total),
      borderColor: RED,
      backgroundColor: 'rgba(192,57,43,0.12)',
      tension: 0.3,
      fill: true,
      pointRadius: 2,
      pointBackgroundColor: RED,
    }],
  }

  const weeklyOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ' ' + fmt(ctx.raw) } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, maxRotation: 45 } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: number) => fmt(v) } },
    },
  }

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{DATA_UPDATED.masterPapi}</span></div>
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">eCommerce</span><span>{DATA_UPDATED.ecom}</span></div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-4">
        <div className="kpi blue">
          <div className="kpi-lbl">Apr MTD</div>
          <div className="kpi-val">{mtdRow ? fmt(mtdRow.total) : '—'}</div>
          <div className="kpi-sub">{aprMtdDays} days in</div>
        </div>
        <div className="kpi orange">
          <div className="kpi-lbl">Projected Apr</div>
          <div className="kpi-val">{fmt(aprProjected)}</div>
          <div className="kpi-sub">At current run rate</div>
        </div>
        <div className={`kpi ${momProjPct >= 0 ? 'green' : 'red'}`}>
          <div className="kpi-lbl">Proj MoM</div>
          <div className="kpi-val">{pctFmt(momProjPct)}</div>
          <div className="kpi-sub">vs Mar {marRow ? fmt(marRow.total) : '—'}</div>
        </div>
        <div className={`kpi ${yoyApr >= 0 ? 'green' : 'red'}`}>
          <div className="kpi-lbl">YoY Apr</div>
          <div className="kpi-val">{apr25 ? pctFmt(yoyApr) : '—'}</div>
          <div className="kpi-sub">Projected vs Apr FY25</div>
        </div>
      </div>

      {/* Weekly Revenue Chart */}
      {weekly.length > 0 && (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="ph"><span className="pt">Weekly Revenue</span><span className="pg">FY26 YTD</span></div>
          <div className="pb">
            <div className="chart-h220"><Line data={weeklyChartData} options={weeklyOpts} /></div>
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
