'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { DashboardData, RevenueMonth } from '@/types'
import { fmt, pct, pctFmt, DATA_UPDATED } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

interface Props {
  data: DashboardData
  filterYear: 'fy26' | 'fy25'
}

interface ChannelDef {
  key: keyof RevenueMonth
  label: string
  color: string
}

const CHANNELS: ChannelDef[] = [
  { key: 'coles', label: 'Coles', color: RED },
  { key: 'distrbn', label: "Distribution", color: ORG },
  { key: 'nandos', label: "Nando's", color: PRP },
  { key: 'direct', label: 'Direct (eComm)', color: CRM },
]

function ChannelPanel({ rows, channel }: { rows: RevenueMonth[]; channel: ChannelDef }) {
  const nonMtd = rows.filter(m => !m.mtd)
  const vals = nonMtd.map(m => (m[channel.key] as number) ?? 0)
  const labels = nonMtd.map(m => m.month?.slice(0, 3) ?? '')

  const chartData = {
    labels,
    datasets: [{
      label: channel.label,
      data: vals,
      borderColor: channel.color,
      backgroundColor: channel.color + '20',
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: channel.color,
    }],
  }

  const chartOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ' ' + fmt(ctx.raw) } } },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 } } },
      y: { grid: { color: DL }, ticks: { color: '#666', font: { size: 9 }, callback: (v: number) => fmt(v) } },
    },
  }

  const ytd = vals.reduce((s, v) => s + v, 0)

  return (
    <div className="panel">
      <div className="ph">
        <span className="pt">{channel.label}</span>
        <span className="pg">YTD {fmt(ytd)}</span>
      </div>
      <div className="pb">
        <div className="chart-h160"><Line data={chartData} options={chartOpts} /></div>
        <div style={{ marginTop: 12 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Month</th>
                <th className="r">Revenue</th>
                <th className="r">MoM</th>
              </tr>
            </thead>
            <tbody>
              {nonMtd.map((m, i) => {
                const val = (m[channel.key] as number) ?? 0
                const prevVal = i > 0 ? ((nonMtd[i - 1][channel.key] as number) ?? 0) : null
                const momChg = prevVal != null && prevVal > 0 ? pct(val, prevVal) : null
                return (
                  <tr key={m.month ?? i}>
                    <td>{m.month}</td>
                    <td className="r">{val > 0 ? fmt(val) : '—'}</td>
                    <td className="r">
                      {momChg != null && val > 0 ? (
                        <span className={momChg >= 0 ? 'up' : 'dn'}>{pctFmt(momChg)}</span>
                      ) : '—'}
                    </td>
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

export default function ChannelDetail({ data, filterYear }: Props) {
  const rows: RevenueMonth[] = (filterYear === 'fy26' ? data.fy26 : data.fy25) ?? []

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{DATA_UPDATED.masterPapi}</span></div>
      </div>

      <div className="g2">
        {CHANNELS.map(ch => (
          <ChannelPanel key={ch.key} rows={rows} channel={ch} />
        ))}
      </div>
    </div>
  )
}
