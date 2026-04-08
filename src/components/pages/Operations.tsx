'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { DashboardData } from '@/types'
import { DATA_UPDATED } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const DL = 'rgba(255,255,255,0.04)'
const RED = '#C0392B', RLT = '#E74C3C', CRM = '#F5E6D0', GRN = '#27AE60', ORG = '#E67E22', BLU = '#2980B9', PRP = '#8E44AD'

const INVENTORY = [
  { sku: 'OG Large', available: 4210, status: 'ok' },
  { sku: 'ES Large', available: 152, status: 'critical' },
  { sku: 'ES Jumbo', available: 70, status: 'critical' },
  { sku: 'OG Jumbo', available: 55, status: 'critical' },
  { sku: 'Chilli Egg Mayo', available: 17185, status: 'watch' },
  { sku: 'Hot Honey', available: 2100, status: 'ok' },
  { sku: 'PERi Crackle 1KG', available: 890, status: 'ok' },
]

export default function Operations({ data }: { data: DashboardData }) {
  const prodMonthly = data.prodMonthly ?? []

  const latestProd = [...prodMonthly].reverse().find(p => (p.uph ?? 0) > 0)
  const uphVal = latestProd?.uph ?? 0

  // Units Jan-Mar
  const janMarUnits = prodMonthly
    .filter(p => ['Jan', 'Feb', 'Mar'].some(m => p.month?.startsWith(m)))
    .reduce((s, p) => s + (p.units ?? 0), 0)

  // Production days
  const totalDays = prodMonthly.reduce((s, p) => s + (p.days ?? 0), 0)

  // UPH chart
  const uphMonths = prodMonthly.filter(p => (p.uph ?? 0) > 0)
  const uphData = {
    labels: uphMonths.map(p => p.month?.slice(0, 3) ?? ''),
    datasets: [
      {
        label: 'UPH',
        data: uphMonths.map(p => p.uph),
        backgroundColor: uphMonths.map(p => (p.uph ?? 0) >= 190 ? GRN : ORG),
        borderRadius: 3,
      },
    ],
  }

  const UPH_BENCHMARK = 190
  const uphOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` UPH: ${ctx.raw?.toFixed(1)}` } },
      annotation: undefined,
    },
    scales: {
      x: { grid: { color: DL }, ticks: { color: '#666', font: { size: 10 } } },
      y: {
        grid: { color: DL },
        ticks: { color: '#666', font: { size: 10 } },
        min: 140,
        suggestedMax: 220,
      },
    },
  }

  return (
    <div className="page">
      {/* DSB */}
      <div className="dsb">
        <div className="dsb-item"><div className="dsb-dot" /><span className="dsb-label">Master Papi</span><span>{DATA_UPDATED.masterPapi}</span></div>
        <div className="dsb-item"><div className="dsb-dot stale" /><span className="dsb-label">Financial</span><span>{DATA_UPDATED.financial}</span></div>
      </div>

      {/* Command Block */}
      <div className="cmd-block">
        <div className="cmd-block-title">Operations Intelligence</div>
        <div className="flag-row">
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>Forklift operators unlicensed since Jan 2025 — WHS liability. Not closed. Each production day this runs is unmitigated liability.</span></div>
          <div className="flag-item red"><span className="flag-icon">⚠</span><span>ES Large: 152 jars available. ES Jumbo: 70 jars. OG Jumbo: 55 jars. Three SKUs at critically low levels.</span></div>
          <div className="flag-item green"><span className="flag-icon">↑</span><span>Jan UPH 201.3 — above 190 benchmark. Wk03 hit 200.8.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Resolve forklift licence issue this week — assign to MT with EOW deadline.</span></div>
          <div className="flag-item blue"><span className="flag-icon">→</span><span>Confirm ES Large + Jumbo restock timeline from Mark by EOW.</span></div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row cols-3">
        <div className={`kpi ${uphVal >= 190 ? 'green' : 'orange'}`}>
          <div className="kpi-lbl">Latest UPH</div>
          <div className="kpi-val">{uphVal > 0 ? uphVal.toFixed(1) : '—'}</div>
          <div className="kpi-sub">{latestProd?.month ?? '—'} · benchmark 190</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-lbl">Units Jan–Mar</div>
          <div className="kpi-val">{janMarUnits.toLocaleString()}</div>
          <div className="kpi-sub">3-month total</div>
        </div>
        <div className="kpi">
          <div className="kpi-lbl">Production Days</div>
          <div className="kpi-val">{totalDays}</div>
          <div className="kpi-sub">FY26 YTD</div>
        </div>
      </div>

      {/* UPH Chart + Diagnosis */}
      <div className="g2" style={{ marginBottom: 16 }}>
        <div className="panel">
          <div className="ph"><span className="pt">UPH Monthly</span><span className="pg">190 benchmark</span></div>
          <div className="pb">
            <div className="chart-h200">
              <Bar data={uphData} options={uphOpts} />
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: 'var(--mid)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#F39C12', verticalAlign: 'middle' }} />
              Benchmark: 190 UPH
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><span className="pt">Issue Pattern Diagnosis</span></div>
          <div className="pb">
            <div style={{ fontSize: 12, color: 'var(--creme)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 10 }}><strong style={{ color: 'var(--white)' }}>Structural UPH drag:</strong> WHS unlicensed operators create stop-start risk. Any injury event = production halt.</p>
              <p style={{ marginBottom: 10 }}><strong style={{ color: 'var(--white)' }}>SKU complexity:</strong> Running 5 SKUs on a single line increases changeover time. Larger runs (OG Large) drive higher UPH naturally.</p>
              <p style={{ marginBottom: 10 }}><strong style={{ color: 'var(--white)' }}>Staffing floor:</strong> 5.3 avg staff on floor — at or below optimal. Any absence = UPH impact.</p>
              <p><strong style={{ color: '#F39C12' }}>Priority:</strong> Close forklift licence. Lock ES/Jumbo restock. Protect Mar→Apr production continuity.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Summary Table */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="ph"><span className="pt">Production Summary</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>Month</th>
                <th className="r">Units</th>
                <th className="r">Hours</th>
                <th className="r">Days</th>
                <th className="r">Staff</th>
                <th className="r">UPH</th>
              </tr>
            </thead>
            <tbody>
              {prodMonthly.map(p => (
                <tr key={p.month}>
                  <td>{p.month}</td>
                  <td className="r">{(p.units ?? 0).toLocaleString()}</td>
                  <td className="r">{p.hours ?? '—'}</td>
                  <td className="r">{p.days ?? '—'}</td>
                  <td className="r">{p.staff ?? '—'}</td>
                  <td className="r">
                    <span className={(p.uph ?? 0) >= 190 ? 'up' : (p.uph ?? 0) > 0 ? 'warn' : ''}>
                      {(p.uph ?? 0) > 0 ? (p.uph ?? 0).toFixed(1) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="panel">
        <div className="ph"><span className="pt">Inventory Available</span><span className="pg">Current</span></div>
        <div className="pb">
          <table className="tbl">
            <thead>
              <tr>
                <th>SKU</th>
                <th className="r">Jars Available</th>
                <th className="c">Status</th>
              </tr>
            </thead>
            <tbody>
              {INVENTORY.map(item => (
                <tr key={item.sku}>
                  <td>{item.sku}</td>
                  <td className="r">{item.available.toLocaleString()}</td>
                  <td className="c">
                    {item.status === 'critical' && <span className="tag tag-red">Critical</span>}
                    {item.status === 'watch' && <span className="tag tag-orange">Watch</span>}
                    {item.status === 'ok' && <span className="tag tag-green">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
